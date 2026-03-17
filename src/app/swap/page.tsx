'use client'

import * as React from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { parseEther } from 'viem'
import { FEE_ROUTER, TOKEN_ADDRESS } from '@/lib/contracts'

const FEE_ROUTER_ABI = [
  { type: 'function', name: 'buy', stateMutability: 'payable',
    inputs: [{ name: 'token', type: 'address' }, { name: 'minOut', type: 'uint256' }], outputs: [] },
] as const

const CHAIN_ID = 143
type TxStatus = 'idle' | 'pending' | 'success' | 'error'
type FeeStats = { totalEvents: number; buybackMon: string }

const S = {
  bg:      '#06050e',
  accent:  '#c8ff00',
  purple:  '#9945ff',
  card:    'rgba(255,255,255,0.04)',
  border:  'rgba(255,255,255,0.08)',
  text:    '#e8e6f0',
  muted:   'rgba(232,230,240,0.5)',
}

function Nav({ active }: { active: string }) {
  return (
    <nav style={{position:'sticky',top:0,zIndex:100,borderBottom:`1px solid ${S.border}`,background:'rgba(6,5,14,.92)',backdropFilter:'blur(20px)',padding:'0 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',height:'64px'}}>
      <a href="/" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none'}}>
        <img src="/logo.png" alt="PHUCKMC" style={{width:34,height:34,borderRadius:9,objectFit:'cover',border:`1px solid ${S.border}`}}/>
        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.4rem',letterSpacing:'.06em',color:S.text}}>PHUCK<span style={{color:S.accent}}>MC</span></span>
      </a>
      <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
        {[['Home','/'],['Swap','/swap'],['Staking','/staking'],['Predictions','/predictions']].map(([l,h])=>(
          <a key={l} href={h} style={{padding:'7px 16px',borderRadius:999,border:`1px solid ${h===active?S.accent:S.border}`,background:h===active?'rgba(200,255,0,0.1)':'rgba(255,255,255,0.03)',fontSize:'.82rem',fontWeight:500,color:h===active?S.accent:S.text,textDecoration:'none',transition:'all .15s'}}>{l}</a>
        ))}
        <a href="https://t.me/PhuckMc" target="_blank" rel="noreferrer" style={{padding:'7px 12px',borderRadius:999,border:`1px solid ${S.border}`,background:'rgba(255,255,255,0.03)',fontSize:'.82rem',color:S.muted,textDecoration:'none'}}>✈️</a>
        <a href="https://t.me/PhuckMc/74931" target="_blank" rel="noreferrer" style={{padding:'7px 12px',borderRadius:999,border:`1px solid ${S.border}`,background:'rgba(255,255,255,0.03)',fontSize:'.82rem',color:S.muted,textDecoration:'none'}}>𝕏</a>
      </div>
    </nav>
  )
}

export default function SwapPage() {
  const { isConnected, chainId } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const [monIn, setMonIn] = React.useState('0.1')
  const [status, setStatus] = React.useState<TxStatus>('idle')
  const [txHash, setTxHash] = React.useState<string | null>(null)
  const [txError, setTxError] = React.useState<string | null>(null)
  const [stats, setStats] = React.useState<FeeStats | null>(null)
  const [statsErr, setStatsErr] = React.useState<string | null>(null)

  async function loadStats() {
    try {
      const r = await fetch('/api/fees/stats', { cache: 'no-store' })
      if (!r.ok) throw new Error('HTTP ' + r.status)
      setStats(await r.json()); setStatsErr(null)
    } catch (e: any) { setStatsErr(e?.message || 'offline') }
  }
  React.useEffect(() => { loadStats(); const t = setInterval(loadStats, 15_000); return () => clearInterval(t) }, [])

  const wrongNetwork = isConnected && chainId !== CHAIN_ID

  async function onBuy() {
    if (!walletClient || !publicClient) return
    if (wrongNetwork) { setTxError('Switch to Monad Mainnet (143)'); return }
    const monWei = (() => { try { return parseEther(monIn || '0') } catch { return 0n } })()
    if (monWei <= 0n) { setTxError('Enter a valid MON amount'); return }
    setStatus('pending'); setTxHash(null); setTxError(null)
    try {
      const hash = await walletClient.writeContract({ address: FEE_ROUTER, abi: FEE_ROUTER_ABI, functionName: 'buy', args: [TOKEN_ADDRESS, 0n], value: monWei })
      setTxHash(hash)
      await publicClient.waitForTransactionReceipt({ hash })
      setStatus('success'); setTimeout(loadStats, 3000)
    } catch (e: any) {
      setTxError(e?.shortMessage || e?.message?.split('\n')[0] || 'Transaction failed')
      setStatus('error')
    }
  }

  const loading = status === 'pending'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        body { background: #06050e !important; font-family: 'Space Grotesk', sans-serif; color: #e8e6f0; }
        .swap-input { width:100%; padding:14px 18px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; color:#e8e6f0; font-size:1.1rem; outline:none; transition:border .2s; font-family:'DM Mono',monospace; }
        .swap-input:focus { border-color:rgba(200,255,0,0.4); }
        .swap-input:disabled { opacity:.5; }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 20px rgba(200,255,0,.2);} 50%{box-shadow:0 0 40px rgba(200,255,0,.5);} }
        .buy-btn { animation: pulse-glow 2.5s ease-in-out infinite; }
        .buy-btn:disabled { animation: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { display:inline-block; width:16px; height:16px; border:2px solid rgba(0,0,0,.3); border-top-color:#000; border-radius:50%; animation:spin .7s linear infinite; }
      `}</style>
      <div style={{background:S.bg, minHeight:'100vh'}}>
        <Nav active="/swap" />

        {/* Hero bar */}
        <div style={{background:'linear-gradient(135deg, rgba(200,255,0,0.06) 0%, rgba(153,69,255,0.06) 100%)', borderBottom:`1px solid ${S.border}`, padding:'2rem 2rem 1.5rem'}}>
          <div style={{maxWidth:1100, margin:'0 auto'}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2rem,5vw,3.5rem)', letterSpacing:'.04em', lineHeight:1}}>
              BUY <span style={{color:S.accent}}>PHUCK</span>MC
            </div>
            <p style={{color:S.muted, marginTop:6, fontSize:'.95rem'}}>
              Routes through fee router • 1% fuels buybacks • Remaining goes to nad.fun
            </p>
          </div>
        </div>

        <div style={{maxWidth:1100, margin:'0 auto', padding:'2.5rem 2rem', display:'grid', gridTemplateColumns:'1fr 380px', gap:'2rem', alignItems:'start'}}>

          {/* ── LEFT: SWAP BOX ──────────────────────────── */}
          <div style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>

            {wrongNetwork && (
              <div style={{padding:'14px 18px', borderRadius:14, border:'1px solid rgba(255,180,0,.3)', background:'rgba(255,180,0,.08)', color:'#ffd080', fontSize:'.9rem'}}>
                ⚠️ You’re on chain {chainId}. Switch to <strong>Monad Mainnet (143)</strong>.
              </div>
            )}

            {/* Token info */}
            <div style={{padding:'20px 22px', borderRadius:16, border:`1px solid ${S.border}`, background:S.card}}>
              <div style={{fontSize:'.7rem', letterSpacing:'.14em', color:S.muted, marginBottom:8, fontWeight:600}}>BUYING TOKEN</div>
              <div style={{display:'flex', alignItems:'center', gap:12}}>
                <div style={{width:40, height:40, borderRadius:10, background:'rgba(200,255,0,.15)', border:`1px solid ${S.accent}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0}}>⬡</div>
                <div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.3rem', letterSpacing:'.04em'}}>PHUCK<span style={{color:S.accent}}>MC</span></div>
                  <div style={{fontFamily:"'DM Mono',monospace", fontSize:'.72rem', color:S.muted, marginTop:2}}>{TOKEN_ADDRESS}</div>
                </div>
                <div style={{marginLeft:'auto', padding:'4px 12px', borderRadius:999, background:'rgba(200,255,0,.1)', border:`1px solid ${S.accent}40`, color:S.accent, fontSize:'.75rem', fontWeight:600}}>MONAD</div>
              </div>
            </div>

            {/* Amount input */}
            <div style={{padding:'20px 22px', borderRadius:16, border:`1px solid ${S.border}`, background:S.card}}>
              <div style={{fontSize:'.7rem', letterSpacing:'.14em', color:S.muted, marginBottom:12, fontWeight:600}}>AMOUNT TO SPEND</div>
              <div style={{position:'relative'}}>
                <input
                  className="swap-input"
                  value={monIn}
                  onChange={e => setMonIn(e.target.value)}
                  placeholder="0.0"
                  inputMode="decimal"
                  disabled={loading}
                />
                <div style={{position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontFamily:"'DM Mono',monospace", fontSize:'.85rem', color:S.accent, fontWeight:500}}>MON</div>
              </div>
              <div style={{display:'flex', gap:8, marginTop:10}}>
                {['0.1','0.5','1','5'].map(v => (
                  <button key={v} onClick={() => setMonIn(v)} style={{flex:1, padding:'7px 0', borderRadius:8, border:`1px solid ${monIn===v?S.accent:S.border}`, background:monIn===v?'rgba(200,255,0,.12)':'rgba(255,255,255,.03)', color:monIn===v?S.accent:S.muted, fontSize:'.8rem', cursor:'pointer', fontWeight:500, transition:'all .15s'}}>{v}</button>
                ))}
              </div>
            </div>

            {/* Buy button */}
            <button
              className="buy-btn"
              onClick={onBuy}
              disabled={!isConnected || loading || wrongNetwork}
              style={{width:'100%', padding:'18px', borderRadius:14, background:S.accent, color:'#000', fontWeight:700, fontSize:'1.05rem', border:'none', cursor:'pointer', transition:'opacity .15s', opacity:(!isConnected||loading||wrongNetwork)?0.45:1, display:'flex', alignItems:'center', justifyContent:'center', gap:10}}
            >
              {loading ? <><span className="spinner"/><span>Confirming…</span></> :
               !isConnected ? 'Connect Wallet to Buy' :
               wrongNetwork ? 'Switch to Monad' :
               `⬡ Buy PHUCKMC with ${monIn || '0'} MON`}
            </button>

            {/* TX feedback */}
            {status === 'success' && txHash && (
              <div style={{padding:'14px 18px', borderRadius:14, border:'1px solid rgba(52,211,153,.3)', background:'rgba(52,211,153,.08)', color:'#6ee7b7', fontSize:'.9rem', display:'flex', alignItems:'center', gap:10}}>
                <span style={{fontSize:'1.2rem'}}>✅</span>
                <span>Confirmed! <a href={`https://monad-mainnet.blockscout.com/tx/${txHash}`} target="_blank" rel="noreferrer" style={{color:'#34d399', textDecoration:'underline'}}>View on explorer →</a></span>
              </div>
            )}
            {txError && (
              <div style={{padding:'14px 18px', borderRadius:14, border:'1px solid rgba(248,113,113,.3)', background:'rgba(248,113,113,.08)', color:'#fca5a5', fontSize:'.9rem'}}>❌ {txError}</div>
            )}
            {status === 'pending' && txHash && (
              <div style={{padding:'14px 18px', borderRadius:14, border:`1px solid ${S.border}`, background:S.card, color:S.muted, fontSize:'.85rem', fontFamily:"'DM Mono',monospace"}}>
                ⏳ {txHash.slice(0,20)}…{txHash.slice(-8)}
              </div>
            )}

            {/* Direct DEX links */}
            <div style={{padding:'18px 22px', borderRadius:16, border:`1px solid ${S.border}`, background:S.card}}>
              <div style={{fontSize:'.7rem', letterSpacing:'.14em', color:S.muted, marginBottom:12, fontWeight:600}}>OR BUY DIRECTLY ON DEX</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                <a href={`https://nad.fun/tokens/${TOKEN_ADDRESS}`} target="_blank" rel="noreferrer"
                  style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', borderRadius:12, border:`1px solid ${S.accent}40`, background:'rgba(200,255,0,.06)', color:S.accent, textDecoration:'none', fontWeight:600, fontSize:'.9rem', transition:'background .2s'}}>
                  ⬡ Nad.fun
                </a>
                <a href="https://join.pump.fun/HSag/5uk0701t" target="_blank" rel="noreferrer"
                  style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', borderRadius:12, border:`1px solid ${S.purple}40`, background:'rgba(153,69,255,.06)', color:'#c084fc', textDecoration:'none', fontWeight:600, fontSize:'.9rem', transition:'background .2s'}}>
                  ◎ Pump.fun
                </a>
              </div>
            </div>
          </div>

          {/* ── RIGHT: STATS ────────────────────────────── */}
          <div style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>

            {/* Fee stats */}
            <div style={{padding:'22px', borderRadius:16, border:`1px solid ${S.border}`, background:S.card}}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.1rem', letterSpacing:'.06em', color:S.accent}}>FEE REVENUE</div>
                <button onClick={loadStats} style={{padding:'5px 12px', borderRadius:999, border:`1px solid ${S.border}`, background:'rgba(255,255,255,.04)', color:S.muted, fontSize:'.75rem', cursor:'pointer'}}>Refresh</button>
              </div>
              {statsErr ? (
                <div style={{padding:'16px', borderRadius:12, border:`1px solid ${S.border}`, background:'rgba(255,255,255,.02)', textAlign:'center'}}>
                  <div style={{color:S.muted, fontSize:'.85rem', marginBottom:6}}>Stats server offline</div>
                  <div style={{color:'rgba(232,230,240,0.3)', fontSize:'.75rem'}}>Set FEE_API_BASE in Vercel</div>
                </div>
              ) : (
                <div style={{display:'flex', flexDirection:'column', gap:10}}>
                  {[
                    {label:'Total Swaps', value: stats ? String(stats.totalEvents) : '—'},
                    {label:'MON Collected', value: stats ? stats.buybackMon : '—'},
                  ].map(({label, value}) => (
                    <div key={label} style={{padding:'14px 16px', borderRadius:12, border:`1px solid ${S.border}`, background:'rgba(255,255,255,.02)'}}>
                      <div style={{fontSize:'.7rem', letterSpacing:'.12em', color:S.muted, fontWeight:600}}>{label.toUpperCase()}</div>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem', color:S.accent, letterSpacing:'.04em', marginTop:4}}>{value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contracts */}
            <div style={{padding:'22px', borderRadius:16, border:`1px solid ${S.border}`, background:S.card}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.1rem', letterSpacing:'.06em', color:S.muted, marginBottom:14}}>CONTRACTS</div>
              {[{label:'PHUCKMC Token', addr: TOKEN_ADDRESS, color: S.accent},{label:'Fee Router', addr: FEE_ROUTER, color: S.muted}].map(({label,addr,color}) => (
                <div key={addr} style={{marginBottom:12}}>
                  <div style={{fontSize:'.7rem', letterSpacing:'.12em', color, fontWeight:600, marginBottom:5}}>{label.toUpperCase()}</div>
                  <div
                    style={{fontFamily:"'DM Mono',monospace", fontSize:'.72rem', color:S.muted, padding:'10px 12px', borderRadius:10, border:`1px solid ${S.border}`, background:'rgba(255,255,255,.02)', cursor:'pointer', wordBreak:'break-all'}}
                    onClick={() => navigator.clipboard.writeText(addr)}
                    title="Click to copy"
                  >{addr}</div>
                </div>
              ))}
              <div style={{fontSize:'.7rem', color:'rgba(232,230,240,.25)', marginTop:4}}>Click address to copy</div>
            </div>

            {/* How it works */}
            <div style={{padding:'22px', borderRadius:16, border:`1px solid rgba(200,255,0,.15)`, background:'rgba(200,255,0,.04)'}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.1rem', letterSpacing:'.06em', color:S.accent, marginBottom:14}}>HOW IT WORKS</div>
              {[
                {n:'1', text:'You send MON to the fee router'},
                {n:'2', text:'1% goes to the buyback wallet'},
                {n:'3', text:'99% routes to nad.fun for PHUCKMC'},
                {n:'4', text:'Tokens arrive in your wallet'},
              ].map(({n,text}) => (
                <div key={n} style={{display:'flex', gap:10, alignItems:'flex-start', marginBottom:10}}>
                  <div style={{width:22, height:22, borderRadius:999, background:'rgba(200,255,0,.2)', border:`1px solid ${S.accent}50`, color:S.accent, fontSize:'.72rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>{n}</div>
                  <div style={{color:S.muted, fontSize:'.85rem', lineHeight:1.5, paddingTop:2}}>{text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
