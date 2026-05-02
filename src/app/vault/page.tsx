'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import { erc20Abi, formatUnits, parseUnits, isAddress, zeroAddress, type Address } from 'viem'
import WalletButton from '@/components/WalletButton'
import {
  TOKEN_ADDRESS,
  VAULT_FACTORY_ADDRESS,
  VAULT_TIER_THRESHOLD,
  VAULT_FACTORY_ABI,
  VAULT_ABI,
} from '@/lib/contracts'

const MONAD_EXPLORER = 'https://monadvision.com'

const TOKEN_PRESETS = [
  { addr: 'NATIVE', symbol: 'MON', label: '⚡ Native MON', color: '#c8ff00' },
  { addr: TOKEN_ADDRESS, symbol: 'PHUCK', label: '💊 $PHUCK', color: '#9945ff' },
  { addr: '0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A', symbol: 'WMON', label: 'WMON', color: '#888' },
] as const

function shortAddr(a?: string) {
  if (!a) return ''
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

function Nav() {
  return (
    <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:200,borderBottom:'1px solid rgba(255,255,255,0.06)',background:'rgba(8,6,18,0.9)',backdropFilter:'blur(32px)',WebkitBackdropFilter:'blur(32px)',padding:'0 2.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',height:'66px'}}>
      <a href="/" style={{display:'flex',alignItems:'center',gap:'12px',textDecoration:'none'}}>
        <div style={{width:36,height:36,borderRadius:10,overflow:'hidden',border:'1px solid rgba(255,255,255,0.1)',flexShrink:0}}>
          <img src="/logo.png" alt="PHUCKMC" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        </div>
        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.45rem',letterSpacing:'.06em',color:'#f0eeff'}}>PHUCK<span style={{color:'#c8ff00'}}>MC</span></span>
      </a>
      <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
        {([['Home','/'],['Swap','/swap'],['Staking','/staking'],['Predictions','/predictions'],['Vault','/vault']] as const).map(([l,h])=>(
          <a key={l} href={h} style={{padding:'7px 15px',borderRadius:999,border:`1px solid ${h==='/vault'?'rgba(200,255,0,0.5)':'rgba(255,255,255,0.07)'}`,background:h==='/vault'?'rgba(200,255,0,0.14)':'transparent',fontSize:'.83rem',fontWeight:600,color:h==='/vault'?'#c8ff00':'rgba(240,238,255,0.65)',textDecoration:'none'}}>{l}</a>
        ))}
        <WalletButton />
      </div>
    </nav>
  )
}

export default function VaultPage() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()

  // ── Read $PHUCK balance for tier gate ──
  const { data: phuckBal } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 15000 },
  })
  const { data: phuckDec } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: 'decimals',
  })

  const phuckBalance = useMemo(() => {
    if (!phuckBal || !phuckDec) return 0n
    return phuckBal / (10n ** BigInt(phuckDec))
  }, [phuckBal, phuckDec])

  const isHolder = phuckBalance >= VAULT_TIER_THRESHOLD
  const factoryDeployed = (VAULT_FACTORY_ADDRESS as string) !== zeroAddress

  // ── Read user's vault address from factory ──
  const { data: vaultAddr, refetch: refetchVault } = useReadContract({
    address: VAULT_FACTORY_ADDRESS,
    abi: VAULT_FACTORY_ABI,
    functionName: 'getVault',
    args: address ? [address] : undefined,
    query: { enabled: !!address && factoryDeployed },
  }) as { data: Address | undefined; refetch: () => void }

  const hasVault = !!vaultAddr && vaultAddr !== zeroAddress

  // ── Tabs ──
  const [tab, setTab] = useState<'deposit' | 'withdraw' | 'holdings'>('deposit')

  // ── Deposit/Withdraw form ──
  const [tokenInput, setTokenInput] = useState<string>(TOKEN_ADDRESS)
  const [amountInput, setAmountInput] = useState<string>('')
  const [tokenSymbol, setTokenSymbol] = useState<string>('PHUCK')
  const [tokenDecimals, setTokenDecimals] = useState<number>(18)
  const [walletBal, setWalletBal] = useState<bigint>(0n)
  const [vaultBal, setVaultBal] = useState<bigint>(0n)
  const [allowance, setAllowance] = useState<bigint>(0n)
  const isNative = tokenInput === 'NATIVE'

  // Fetch token meta whenever token changes
  useEffect(() => {
    if (!publicClient || !address) return
    let cancelled = false
    ;(async () => {
      try {
        if (isNative) {
          setTokenSymbol('MON')
          setTokenDecimals(18)
          const bal = await publicClient.getBalance({ address })
          if (!cancelled) setWalletBal(bal)
          if (hasVault && vaultAddr) {
            const vb = await publicClient.getBalance({ address: vaultAddr })
            if (!cancelled) setVaultBal(vb)
          }
          if (!cancelled) setAllowance(0n)
          return
        }
        if (!isAddress(tokenInput)) return
        const tok = tokenInput as Address
        const [sym, dec, bal] = await Promise.all([
          publicClient.readContract({ address: tok, abi: erc20Abi, functionName: 'symbol' }).catch(() => 'TOKEN'),
          publicClient.readContract({ address: tok, abi: erc20Abi, functionName: 'decimals' }).catch(() => 18),
          publicClient.readContract({ address: tok, abi: erc20Abi, functionName: 'balanceOf', args: [address] }),
        ])
        if (cancelled) return
        setTokenSymbol(sym as string)
        setTokenDecimals(Number(dec))
        setWalletBal(bal as bigint)
        if (hasVault && vaultAddr) {
          const [vb, allow] = await Promise.all([
            publicClient.readContract({ address: tok, abi: erc20Abi, functionName: 'balanceOf', args: [vaultAddr] }),
            publicClient.readContract({ address: tok, abi: erc20Abi, functionName: 'allowance', args: [address, vaultAddr] }),
          ])
          if (cancelled) return
          setVaultBal(vb as bigint)
          setAllowance(allow as bigint)
        }
      } catch (e) {
        console.error('token fetch err', e)
      }
    })()
    return () => { cancelled = true }
  }, [publicClient, address, tokenInput, hasVault, vaultAddr, isNative])

  // ── Holdings ──
  const [holdings, setHoldings] = useState<{ symbol: string; addr: string; balance: bigint; dec: number }[]>([])
  async function refreshHoldings() {
    if (!publicClient || !vaultAddr) return
    const found: typeof holdings = []
    for (const t of TOKEN_PRESETS) {
      try {
        if (t.addr === 'NATIVE') {
          const bal = await publicClient.getBalance({ address: vaultAddr })
          if (bal > 0n) found.push({ symbol: 'MON', addr: 'NATIVE', balance: bal, dec: 18 })
        } else {
          const tok = t.addr as Address
          const [bal, dec] = await Promise.all([
            publicClient.readContract({ address: tok, abi: erc20Abi, functionName: 'balanceOf', args: [vaultAddr] }),
            publicClient.readContract({ address: tok, abi: erc20Abi, functionName: 'decimals' }).catch(() => 18),
          ])
          if ((bal as bigint) > 0n) found.push({ symbol: t.symbol, addr: t.addr, balance: bal as bigint, dec: Number(dec) })
        }
      } catch (e) { /* skip */ }
    }
    setHoldings(found)
  }
  useEffect(() => {
    if (tab === 'holdings' && hasVault) refreshHoldings()
  }, [tab, hasVault, vaultAddr])

  // ── Write actions ──
  const { writeContractAsync, isPending: isWritePending } = useWriteContract()
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
  const [statusMsg, setStatusMsg] = useState<{ kind: 'idle' | 'pending' | 'success' | 'error'; text: string }>({ kind: 'idle', text: '' })
  const { isLoading: isTxPending, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  useEffect(() => {
    if (isTxSuccess) {
      setStatusMsg({ kind: 'success', text: '✓ Confirmed' })
      // refetch state
      refetchVault()
      // re-fetch token data — toggle tokenInput then back
      const t = tokenInput
      setTokenInput('NATIVE')
      setTimeout(() => setTokenInput(t), 100)
    }
  }, [isTxSuccess])

  async function handleCreateVault() {
    if (!isHolder || !factoryDeployed) return
    try {
      setStatusMsg({ kind: 'pending', text: 'Deploying your vault…' })
      const hash = await writeContractAsync({
        address: VAULT_FACTORY_ADDRESS,
        abi: VAULT_FACTORY_ABI,
        functionName: 'createMyVault',
      })
      setTxHash(hash)
      setStatusMsg({ kind: 'pending', text: `Tx submitted: ${shortAddr(hash)}` })
    } catch (e: any) {
      setStatusMsg({ kind: 'error', text: e?.shortMessage || e?.message || 'Failed' })
    }
  }

  async function handleApprove() {
    if (!isAddress(tokenInput) || isNative || !vaultAddr) return
    try {
      setStatusMsg({ kind: 'pending', text: `Approving ${tokenSymbol}…` })
      const amt = parseUnits(amountInput || '0', tokenDecimals)
      const hash = await writeContractAsync({
        address: tokenInput as Address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [vaultAddr, amt],
      })
      setTxHash(hash)
      setStatusMsg({ kind: 'pending', text: `Approve tx: ${shortAddr(hash)}` })
    } catch (e: any) {
      setStatusMsg({ kind: 'error', text: e?.shortMessage || e?.message || 'Failed' })
    }
  }

  async function handleDeposit() {
    if (!vaultAddr || !amountInput) return
    try {
      setStatusMsg({ kind: 'pending', text: 'Depositing…' })
      let hash: `0x${string}`
      if (isNative) {
        const amt = parseUnits(amountInput, 18)
        hash = await writeContractAsync({
          address: vaultAddr,
          abi: VAULT_ABI,
          functionName: 'depositNative',
          value: amt,
        })
      } else {
        if (!isAddress(tokenInput)) throw new Error('Bad token address')
        const amt = parseUnits(amountInput, tokenDecimals)
        hash = await writeContractAsync({
          address: vaultAddr,
          abi: VAULT_ABI,
          functionName: 'deposit',
          args: [tokenInput as Address, amt],
        })
      }
      setTxHash(hash)
      setStatusMsg({ kind: 'pending', text: `Deposit tx: ${shortAddr(hash)}` })
      setAmountInput('')
    } catch (e: any) {
      setStatusMsg({ kind: 'error', text: e?.shortMessage || e?.message || 'Failed' })
    }
  }

  async function handleWithdraw() {
    if (!vaultAddr || !amountInput) return
    try {
      setStatusMsg({ kind: 'pending', text: 'Withdrawing…' })
      let hash: `0x${string}`
      if (isNative) {
        const amt = parseUnits(amountInput, 18)
        hash = await writeContractAsync({
          address: vaultAddr,
          abi: VAULT_ABI,
          functionName: 'withdrawNative',
          args: [amt],
        })
      } else {
        if (!isAddress(tokenInput)) throw new Error('Bad token address')
        const amt = parseUnits(amountInput, tokenDecimals)
        hash = await writeContractAsync({
          address: vaultAddr,
          abi: VAULT_ABI,
          functionName: 'withdraw',
          args: [tokenInput as Address, amt],
        })
      }
      setTxHash(hash)
      setStatusMsg({ kind: 'pending', text: `Withdraw tx: ${shortAddr(hash)}` })
      setAmountInput('')
    } catch (e: any) {
      setStatusMsg({ kind: 'error', text: e?.shortMessage || e?.message || 'Failed' })
    }
  }

  // Calculate if user needs approval
  const amountWei = useMemo(() => {
    try {
      if (!amountInput) return 0n
      return parseUnits(amountInput, tokenDecimals)
    } catch { return 0n }
  }, [amountInput, tokenDecimals])

  const needsApproval = !isNative && tab === 'deposit' && hasVault && amountWei > 0n && allowance < amountWei

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        html,body{margin:0;padding:0;background:#080612!important;color:#f0eeff;font-family:'Space Grotesk',sans-serif;overflow-x:hidden;}
        ::selection{background:rgba(200,255,0,0.35);color:#000;}
        @keyframes orb1{0%,100%{transform:translate(0,0);}40%{transform:translate(80px,-50px);}70%{transform:translate(-40px,30px);}}
        @keyframes orb2{0%,100%{transform:translate(0,0);}30%{transform:translate(-60px,70px);}65%{transform:translate(50px,-30px);}}
        @keyframes pulse-ring{0%,100%{box-shadow:0 0 0 0 rgba(200,255,0,0.4);}50%{box-shadow:0 0 0 14px rgba(200,255,0,0);}}
        .glow{box-shadow:0 0 60px rgba(200,255,0,0.15);}
        .h-bebas{font-family:'Bebas Neue',Impact,sans-serif;letter-spacing:.05em;}
        .h-mono{font-family:'DM Mono',monospace;}
        .btn{padding:11px 22px;border-radius:10px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.04);color:#f0eeff;font-weight:600;cursor:pointer;font-size:.9rem;transition:all .15s;font-family:inherit;}
        .btn:hover{background:rgba(255,255,255,0.08);transform:translateY(-1px);}
        .btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
        .btn-accent{background:#c8ff00;color:#000;border-color:#c8ff00;}
        .btn-accent:hover{filter:brightness(1.1);box-shadow:0 0 24px rgba(200,255,0,0.4);}
        .btn-purple{background:#9945ff;color:#fff;border-color:#9945ff;}
        .btn-purple:hover{filter:brightness(1.1);box-shadow:0 0 24px rgba(153,69,255,0.4);}
        .btn-orange{background:#ff9933;color:#000;border-color:#ff9933;}
        .input{padding:13px 16px;background:#0d0a1a;border:1px solid rgba(255,255,255,0.08);border-radius:11px;color:#f0eeff;font-family:'DM Mono',monospace;font-size:.95rem;width:100%;outline:none;transition:all .15s;}
        .input:focus{border-color:#c8ff00;box-shadow:0 0 0 3px rgba(200,255,0,0.15);}
        .preset-pill{padding:8px 14px;border-radius:9px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.04);font-size:.82rem;cursor:pointer;font-family:inherit;color:#f0eeff;font-weight:600;transition:all .15s;}
        .preset-pill:hover{background:rgba(255,255,255,0.08);}
        .preset-pill.active{background:#c8ff00;color:#000;border-color:#c8ff00;}
        .tab-btn{padding:13px;border-radius:11px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);color:rgba(240,238,255,0.6);font-family:'Bebas Neue',Impact,sans-serif;font-size:1.05rem;letter-spacing:.07em;cursor:pointer;transition:all .15s;}
        .tab-btn:hover{background:rgba(255,255,255,0.06);color:#f0eeff;}
        .tab-btn.active{background:rgba(200,255,0,0.12);color:#c8ff00;border-color:rgba(200,255,0,0.4);}
      `}</style>
      <Nav />
      <main style={{paddingTop:'90px',minHeight:'100vh',background:'radial-gradient(ellipse at 30% 0%,rgba(200,255,0,0.05),transparent 50%),radial-gradient(ellipse at 70% 80%,rgba(153,69,255,0.06),transparent 50%),#080612'}}>
        <div style={{maxWidth:'860px',margin:'0 auto',padding:'2rem 1.25rem 6rem'}}>

          {/* HERO */}
          <section style={{textAlign:'center',marginBottom:'2.5rem'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 14px',background:'rgba(200,255,0,0.08)',border:'1px solid rgba(200,255,0,0.3)',borderRadius:999,marginBottom:'1rem'}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#c8ff00'}}></span>
              <span className="h-mono" style={{fontSize:'.7rem',letterSpacing:'.15em',color:'#c8ff00',textTransform:'uppercase'}}>Hold 2M $PHUCK · Privacy Vault</span>
            </div>
            <h1 className="h-bebas" style={{fontSize:'clamp(2.5rem,6vw,4rem)',margin:0,lineHeight:1}}>
              YOUR <span style={{color:'#c8ff00',textShadow:'0 0 30px rgba(200,255,0,0.4)'}}>PRIVATE</span> VAULT
            </h1>
            <p style={{color:'rgba(240,238,255,0.6)',maxWidth:560,margin:'.75rem auto 0',fontSize:'1rem',lineHeight:1.6}}>
              Each user deploys their own unique smart contract. Hide your bag from bubble maps + casual stalkers. Only you can withdraw. No fees, no custody.
            </p>
          </section>

          {/* WALLET CHECK */}
          {!isConnected && (
            <section style={{padding:'2rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:18,textAlign:'center'}}>
              <p className="h-bebas" style={{fontSize:'1.5rem',margin:'0 0 1rem',color:'rgba(240,238,255,0.7)'}}>CONNECT WALLET TO CONTINUE</p>
              <WalletButton />
            </section>
          )}

          {/* TIER STATUS */}
          {isConnected && (
            <section style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:'1.5rem'}}>
              <div style={{padding:'1.1rem 1.25rem',background:isHolder?'rgba(200,255,0,0.08)':'rgba(255,58,94,0.08)',border:`1px solid ${isHolder?'rgba(200,255,0,0.3)':'rgba(255,58,94,0.3)'}`,borderRadius:14}}>
                <div className="h-mono" style={{fontSize:'.65rem',letterSpacing:'.15em',color:'rgba(240,238,255,0.5)',textTransform:'uppercase',marginBottom:6}}>Your $PHUCK</div>
                <div className="h-bebas" style={{fontSize:'1.5rem',color:isHolder?'#c8ff00':'#ff3a5e'}}>{phuckBalance.toLocaleString()}</div>
              </div>
              <div style={{padding:'1.1rem 1.25rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14}}>
                <div className="h-mono" style={{fontSize:'.65rem',letterSpacing:'.15em',color:'rgba(240,238,255,0.5)',textTransform:'uppercase',marginBottom:6}}>Required</div>
                <div className="h-bebas" style={{fontSize:'1.5rem',color:'#9945ff'}}>2,000,000 $PHUCK</div>
              </div>
            </section>
          )}

          {/* NOT YET DEPLOYED WARNING */}
          {isConnected && !factoryDeployed && (
            <section style={{padding:'1.25rem 1.5rem',background:'rgba(255,153,51,0.08)',border:'1px solid rgba(255,153,51,0.3)',borderRadius:14,marginBottom:'1.5rem',textAlign:'center'}}>
              <p style={{margin:0,color:'#ff9933',fontWeight:600}}>⚠️ Vault factory not yet deployed to Monad mainnet. Coming soon.</p>
            </section>
          )}

          {/* CREATE VAULT */}
          {isConnected && !hasVault && factoryDeployed && (
            <section className="glow" style={{padding:'2.5rem',background:'linear-gradient(135deg,rgba(200,255,0,0.08),rgba(153,69,255,0.08))',border:'1px solid rgba(200,255,0,0.3)',borderRadius:18,textAlign:'center',marginBottom:'1.5rem'}}>
              <div style={{fontSize:'3rem',marginBottom:'.75rem'}}>🔒</div>
              <h2 className="h-bebas" style={{fontSize:'2rem',margin:'0 0 .5rem'}}>DEPLOY YOUR VAULT</h2>
              <p style={{color:'rgba(240,238,255,0.65)',margin:'0 0 1.5rem',maxWidth:480,marginLeft:'auto',marginRight:'auto'}}>
                One-time deployment. Spawns a unique smart contract owned only by your wallet. Cost: gas only.
              </p>
              <button
                onClick={handleCreateVault}
                disabled={!isHolder || isWritePending || isTxPending}
                className="btn btn-accent h-bebas"
                style={{fontSize:'1.3rem',padding:'15px 38px',boxShadow:isHolder?'0 0 30px rgba(200,255,0,0.4)':'none',animation:isHolder?'pulse-ring 2s infinite':'none'}}
              >
                {!isHolder ? '🔒 NEED 2M $PHUCK' : isWritePending || isTxPending ? '⏳ DEPLOYING…' : '🚀 DEPLOY MY VAULT'}
              </button>
              {statusMsg.kind !== 'idle' && (
                <p style={{margin:'1rem 0 0',color:statusMsg.kind==='error'?'#ff3a5e':statusMsg.kind==='success'?'#c8ff00':'#9945ff',fontSize:'.85rem'}}>
                  {statusMsg.text}
                </p>
              )}
            </section>
          )}

          {/* VAULT INFO */}
          {isConnected && hasVault && vaultAddr && (
            <section style={{padding:'1.25rem 1.5rem',background:'rgba(200,255,0,0.04)',border:'1px dashed rgba(200,255,0,0.4)',borderRadius:14,marginBottom:'1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
              <div>
                <div className="h-mono" style={{fontSize:'.65rem',letterSpacing:'.15em',color:'rgba(240,238,255,0.5)',textTransform:'uppercase',marginBottom:4}}>Your Vault Address</div>
                <div className="h-mono" style={{fontSize:'.95rem',color:'#c8ff00'}}>{shortAddr(vaultAddr)}</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={() => navigator.clipboard.writeText(vaultAddr)} className="btn">📋 Copy</button>
                <a href={`${MONAD_EXPLORER}/address/${vaultAddr}`} target="_blank" rel="noreferrer" className="btn">🔗 Explorer</a>
              </div>
            </section>
          )}

          {/* TABS + PANELS */}
          {isConnected && hasVault && (
            <section style={{padding:'1.5rem',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:18}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:'1.25rem'}}>
                <button className={`tab-btn ${tab==='deposit'?'active':''}`} onClick={() => setTab('deposit')}>📥 DEPOSIT</button>
                <button className={`tab-btn ${tab==='withdraw'?'active':''}`} onClick={() => setTab('withdraw')}>📤 WITHDRAW</button>
                <button className={`tab-btn ${tab==='holdings'?'active':''}`} onClick={() => setTab('holdings')}>💰 HOLDINGS</button>
              </div>

              {/* DEPOSIT */}
              {tab === 'deposit' && (
                <div>
                  <label className="h-mono" style={{display:'block',fontSize:'.7rem',letterSpacing:'.15em',color:'rgba(240,238,255,0.5)',marginBottom:8,textTransform:'uppercase'}}>Pick Token</label>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
                    {TOKEN_PRESETS.map(t => (
                      <button key={t.addr} className={`preset-pill ${tokenInput===t.addr?'active':''}`} onClick={() => setTokenInput(t.addr)}>{t.label}</button>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="input"
                    value={tokenInput === 'NATIVE' ? '' : tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder={tokenInput === 'NATIVE' ? 'Native MON selected' : '0x... custom token address'}
                    disabled={isNative}
                    style={{marginBottom:14}}
                  />
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',background:'rgba(255,255,255,0.03)',borderRadius:11,marginBottom:14,fontSize:'.9rem'}}>
                    <span className="h-mono" style={{color:'rgba(240,238,255,0.5)',fontSize:'.75rem',letterSpacing:'.1em',textTransform:'uppercase'}}>Wallet Balance</span>
                    <span className="h-bebas" style={{fontSize:'1.15rem'}}>{Number(formatUnits(walletBal, tokenDecimals)).toLocaleString(undefined,{maximumFractionDigits:4})} {tokenSymbol}</span>
                  </div>
                  <label className="h-mono" style={{display:'block',fontSize:'.7rem',letterSpacing:'.15em',color:'rgba(240,238,255,0.5)',marginBottom:8,textTransform:'uppercase'}}>Amount</label>
                  <input
                    type="text"
                    className="input"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="0.0"
                    style={{marginBottom:14}}
                  />
                  {needsApproval ? (
                    <button onClick={handleApprove} disabled={isWritePending || isTxPending} className="btn btn-orange h-bebas" style={{width:'100%',padding:'15px',fontSize:'1.1rem'}}>
                      {isWritePending || isTxPending ? '⏳ APPROVING…' : `🔐 APPROVE ${tokenSymbol}`}
                    </button>
                  ) : (
                    <button onClick={handleDeposit} disabled={isWritePending || isTxPending || !amountInput} className="btn btn-accent h-bebas" style={{width:'100%',padding:'15px',fontSize:'1.1rem'}}>
                      {isWritePending || isTxPending ? '⏳ DEPOSITING…' : '🔒 DEPOSIT TO VAULT'}
                    </button>
                  )}
                  {statusMsg.kind !== 'idle' && (
                    <p style={{margin:'.75rem 0 0',color:statusMsg.kind==='error'?'#ff3a5e':statusMsg.kind==='success'?'#c8ff00':'#9945ff',fontSize:'.85rem',textAlign:'center'}}>
                      {statusMsg.text}
                    </p>
                  )}
                </div>
              )}

              {/* WITHDRAW */}
              {tab === 'withdraw' && (
                <div>
                  <label className="h-mono" style={{display:'block',fontSize:'.7rem',letterSpacing:'.15em',color:'rgba(240,238,255,0.5)',marginBottom:8,textTransform:'uppercase'}}>Pick Token</label>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
                    {TOKEN_PRESETS.map(t => (
                      <button key={t.addr} className={`preset-pill ${tokenInput===t.addr?'active':''}`} onClick={() => setTokenInput(t.addr)}>{t.label}</button>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="input"
                    value={tokenInput === 'NATIVE' ? '' : tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder={tokenInput === 'NATIVE' ? 'Native MON selected' : '0x... custom token address'}
                    disabled={isNative}
                    style={{marginBottom:14}}
                  />
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',background:'rgba(200,255,0,0.05)',borderRadius:11,marginBottom:14,fontSize:'.9rem'}}>
                    <span className="h-mono" style={{color:'rgba(240,238,255,0.5)',fontSize:'.75rem',letterSpacing:'.1em',textTransform:'uppercase'}}>Vault Balance</span>
                    <span className="h-bebas" style={{fontSize:'1.15rem',color:'#c8ff00'}}>{Number(formatUnits(vaultBal, tokenDecimals)).toLocaleString(undefined,{maximumFractionDigits:4})} {tokenSymbol}</span>
                  </div>
                  <label className="h-mono" style={{display:'block',fontSize:'.7rem',letterSpacing:'.15em',color:'rgba(240,238,255,0.5)',marginBottom:8,textTransform:'uppercase'}}>Amount</label>
                  <input
                    type="text"
                    className="input"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="0.0"
                    style={{marginBottom:14}}
                  />
                  <button onClick={handleWithdraw} disabled={isWritePending || isTxPending || !amountInput} className="btn btn-purple h-bebas" style={{width:'100%',padding:'15px',fontSize:'1.1rem'}}>
                    {isWritePending || isTxPending ? '⏳ WITHDRAWING…' : '📤 WITHDRAW FROM VAULT'}
                  </button>
                  {statusMsg.kind !== 'idle' && (
                    <p style={{margin:'.75rem 0 0',color:statusMsg.kind==='error'?'#ff3a5e':statusMsg.kind==='success'?'#c8ff00':'#9945ff',fontSize:'.85rem',textAlign:'center'}}>
                      {statusMsg.text}
                    </p>
                  )}
                </div>
              )}

              {/* HOLDINGS */}
              {tab === 'holdings' && (
                <div>
                  <button onClick={refreshHoldings} className="btn" style={{marginBottom:14}}>🔄 Refresh</button>
                  {holdings.length === 0 ? (
                    <p style={{textAlign:'center',color:'rgba(240,238,255,0.5)',padding:'2rem 0'}}>No tokens in vault yet. Deposit something!</p>
                  ) : (
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      {holdings.map((h, i) => (
                        <div key={i} style={{padding:'14px 18px',background:'rgba(200,255,0,0.04)',border:'1px solid rgba(200,255,0,0.2)',borderRadius:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <div>
                            <div className="h-bebas" style={{fontSize:'1.2rem',color:'#f0eeff'}}>{h.symbol}</div>
                            <div className="h-mono" style={{fontSize:'.7rem',color:'rgba(240,238,255,0.4)'}}>{h.addr === 'NATIVE' ? 'Native' : shortAddr(h.addr)}</div>
                          </div>
                          <div className="h-bebas" style={{fontSize:'1.4rem',color:'#c8ff00'}}>{Number(formatUnits(h.balance, h.dec)).toLocaleString(undefined,{maximumFractionDigits:4})}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* DISCLAIMER */}
          <section style={{marginTop:'2rem',padding:'1.25rem 1.5rem',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,textAlign:'center'}}>
            <p style={{margin:0,color:'rgba(240,238,255,0.55)',fontSize:'.85rem',lineHeight:1.7}}>
              <b style={{color:'#c8ff00'}}>HOW PRIVACY WORKS:</b> Your tokens move from your wallet to a unique smart contract you own. Wallet balance shows lower, vault holds the bag. <b style={{color:'#ff3a5e'}}>Privacy from casual lookups + bubble maps, NOT anonymity.</b> On-chain forensic analysis can still trace ownership via your deploy transaction.
            </p>
          </section>
        </div>
      </main>
    </>
  )
}
