'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState, useEffect, useRef } from 'react'
import { useReadContracts } from 'wagmi'
import { formatUnits } from 'viem'
import { BUYBACK_WALLET, ERC20_ABI, STAKING_ABI, STAKING_ADDRESS, TOKEN_ADDRESS } from '@/lib/contracts'

function fmtCompact(n: number) {
  if (!Number.isFinite(n) || n === 0) return '0'
  return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(n)
}

const MONAD_CA  = TOKEN_ADDRESS
const SOLANA_CA = 'DKSL2G7YSiMVXZX8iFgkoqVDA7r1ZGtWDQaKf95vpump'
const TICKER_ITEMS = ['CALM MONEY','LOUD MEMES','PHUCK THE CHART','BUY THE DIP','HOLD FOREVER','MULTI-CHAIN','BUYBACK MACHINE','MONAD + SOLANA','CALM MONEY','LOUD MEMES','PHUCK THE CHART','BUY THE DIP']

export default function HomePage() {
  const [copiedMonad, setCopiedMonad]   = useState(false)
  const [copiedSolana, setCopiedSolana] = useState(false)
  const [manifesto, setManifesto]       = useState(false)
  const manifestoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = manifestoRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setManifesto(true) }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  function copy(text: string, which: 'monad' | 'solana') {
    navigator.clipboard.writeText(text).catch(() => {})
    if (which === 'monad') { setCopiedMonad(true); setTimeout(() => setCopiedMonad(false), 1500) }
    else { setCopiedSolana(true); setTimeout(() => setCopiedSolana(false), 1500) }
  }

  const contracts = useMemo(() => [
    { address: TOKEN_ADDRESS,   abi: ERC20_ABI,   functionName: 'decimals' as const },
    { address: TOKEN_ADDRESS,   abi: ERC20_ABI,   functionName: 'symbol' as const },
    { address: TOKEN_ADDRESS,   abi: ERC20_ABI,   functionName: 'totalSupply' as const },
    { address: TOKEN_ADDRESS,   abi: ERC20_ABI,   functionName: 'balanceOf' as const, args: [BUYBACK_WALLET] as const },
    { address: STAKING_ADDRESS, abi: STAKING_ABI, functionName: 'totalStaked' as const },
    { address: STAKING_ADDRESS, abi: STAKING_ABI, functionName: 'rewardsFundedTotal' as const },
  ], [])

  const { data } = useReadContracts({ contracts, query: { refetchInterval: 30_000 } })

  const decimals    = Number(data?.[0]?.result  ?? 18)
  const symbol      = String(data?.[1]?.result  ?? 'PHUCK')
  const totalSupply = (data?.[2]?.result ?? 0n) as bigint
  const buybackBal  = (data?.[3]?.result ?? 0n) as bigint
  const totalStaked = (data?.[4]?.result ?? 0n) as bigint
  const fundedTotal = (data?.[5]?.result ?? 0n) as bigint
  const buybackNum  = Number(formatUnits(buybackBal, decimals))
  const fundedNum   = Number(formatUnits(fundedTotal, decimals))
  const lockedPct   = totalSupply > 0n ? Number((totalStaked * 10000n) / totalSupply) / 100 : 0
  const loaded      = !!data

  const stats = [
    { label: 'Buyback Wallet', value: loaded ? `${fmtCompact(buybackNum)} ${symbol}` : '…', note: 'PHUCK accumulated' },
    { label: 'Rewards Funded', value: loaded ? `${fmtCompact(fundedNum)} ${symbol}`  : '…', note: 'lifetime funded' },
    { label: 'Supply Locked',  value: loaded ? `${lockedPct.toFixed(2)}%`              : '…', note: 'staked / supply' },
    { label: 'Active Chains',  value: '2',                                                           note: 'Monad + Solana' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        :root{--accent:#c8ff00;--purple:#9945ff;--bg:#06050e;--card:rgba(255,255,255,0.03);--border:rgba(255,255,255,0.08);--text:#e8e6f0;--muted:rgba(232,230,240,0.55);}
        html{scroll-behavior:smooth;}
        body{background:var(--bg)!important;color:var(--text);font-family:'Space Grotesk',sans-serif;}
        header.site-header{display:none!important;}
        @keyframes ticker{from{transform:translateX(0);}to{transform:translateX(-50%);}}
        .ticker-track{animation:ticker 28s linear infinite;}
        .ticker-track:hover{animation-play-state:paused;}
        .m-line{opacity:0;transform:translateY(18px);transition:opacity .5s ease,transform .5s ease;}
        .m-line.lit{opacity:1;transform:none;}
        .ca-addr{font-family:'DM Mono',monospace;font-size:.78rem;word-break:break-all;color:var(--muted);}
        .chain-monad{border-color:var(--accent)!important;}
        .chain-solana{border-color:var(--purple)!important;}
        @keyframes glowMon{0%,100%{box-shadow:0 0 18px rgba(200,255,0,.25);}50%{box-shadow:0 0 35px rgba(200,255,0,.55);}}
        @keyframes glowSol{0%,100%{box-shadow:0 0 18px rgba(153,69,255,.25);}50%{box-shadow:0 0 35px rgba(153,69,255,.55);}}
        .btn-monad{animation:glowMon 3s ease-in-out infinite;}
        .btn-solana{animation:glowSol 3s ease-in-out infinite;}
      `}</style>
      <div style={{background:'var(--bg)',minHeight:'100vh'}}>
        <nav style={{position:'sticky',top:0,zIndex:100,borderBottom:'1px solid var(--border)',background:'rgba(6,5,14,.88)',backdropFilter:'blur(20px)',padding:'0 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',height:'64px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{width:36,height:36,borderRadius:10,background:'var(--card)',border:'1px solid var(--border)',overflow:'hidden',position:'relative',flexShrink:0}}>
              <Image src="/logo.png" alt="PHUCKMC" fill sizes="36px" style={{objectFit:'cover'}}/>
            </div>
            <div style={{fontFamily:'Bebas Neue',fontSize:'1.4rem',letterSpacing:'.06em'}}>PHUCK<span style={{color:'var(--accent)'}}>MC</span></div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
            {[{label:'Home',href:'/'},{label:'Swap',href:'/swap'},{label:'Staking',href:'/staking'},{label:'Predictions',href:'/predictions'},{label:'Play',href:'/play'}].map(l=>(
              <Link key={l.label} href={l.href} style={{padding:'6px 14px',borderRadius:999,border:'1px solid var(--border)',background:'var(--card)',fontSize:'.8rem',fontWeight:500,color:'var(--text)',textDecoration:'none'}}>{l.label}</Link>
            ))}
            {[{icon:'✈️',label:'TG',href:'https://t.me/PhuckMc'},{icon:'▶',label:'YT',href:'https://youtube.com/@phuckmc-w8k'},{icon:'♪',label:'TT',href:'https://tiktok.com/@phuckmc'}].map(s=>(
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" style={{padding:'6px 12px',borderRadius:999,border:'1px solid var(--border)',background:'var(--card)',fontSize:'.8rem',color:'var(--muted)',textDecoration:'none'}}>{s.icon}</a>
            ))}
          </div>
        </nav>
        <div style={{overflow:'hidden',borderBottom:'1px solid var(--border)',background:'rgba(200,255,0,.04)',padding:'10px 0'}}>
          <div className="ticker-track" style={{display:'flex',gap:'3rem',whiteSpace:'nowrap',width:'max-content'}}>
            {[...TICKER_ITEMS,...TICKER_ITEMS].map((item,i)=>(
              <span key={i} style={{fontFamily:'Bebas Neue',fontSize:'1rem',letterSpacing:'.12em',color:i%3===0?'var(--accent)':'var(--muted)'}}>
                {item} <span style={{color:'var(--border)',margin:'0 .5rem'}}>◆</span>
              </span>
            ))}
          </div>
        </div>
        <section style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',gap:'2.5rem',maxWidth:1200,margin:'0 auto',padding:'5rem 2rem 3rem',alignItems:'center'}}>
          <div style={{position:'relative',borderRadius:24,overflow:'hidden',aspectRatio:'1/1'}}>
            <Image src="/pill.png" alt="PHUCKMC mascot" fill priority sizes="(max-width:768px) 100vw, 50vw" style={{objectFit:'cover'}}/>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,var(--bg) 0%,transparent 40%)'}}/>
          </div>
          <div>
            <div style={{display:'inline-block',padding:'4px 14px',borderRadius:999,border:'1px solid var(--accent)',color:'var(--accent)',fontSize:'.75rem',fontWeight:600,letterSpacing:'.1em',marginBottom:'1.2rem'}}>MULTI-CHAIN MEME TOKEN</div>
            <h1 style={{fontFamily:'Bebas Neue',fontSize:'clamp(4rem,9vw,7rem)',lineHeight:.92,letterSpacing:'.02em',margin:'0 0 1rem'}}>PHUCK<span style={{color:'var(--accent)'}}>MC</span></h1>
            <p style={{color:'var(--muted)',fontSize:'1.05rem',lineHeight:1.6,marginBottom:'2rem'}}>Calm money. Loud memes.<br/><strong style={{color:'var(--text)'}}>Phuck what the chart says.</strong></p>
            <div style={{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'2rem'}}>
              <a href={`https://nad.fun/tokens/${MONAD_CA}`} target="_blank" rel="noreferrer" className="btn-monad" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'14px 28px',borderRadius:12,background:'var(--accent)',color:'#000',fontWeight:700,fontSize:'.95rem',textDecoration:'none'}}><span style={{fontSize:'1.1em'}}>⬡</span> Buy on Monad</a>
              <a href="https://join.pump.fun/HSag/5uk0701t" target="_blank" rel="noreferrer" className="btn-solana" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'14px 28px',borderRadius:12,background:'var(--purple)',color:'#fff',fontWeight:700,fontSize:'.95rem',textDecoration:'none'}}>◎ Buy on Solana</a>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {[{chain:'MONAD CA',ca:MONAD_CA,which:'monad' as const,copied:copiedMonad,color:'var(--accent)'},{chain:'SOLANA CA',ca:SOLANA_CA,which:'solana' as const,copied:copiedSolana,color:'var(--purple)'}].map(({chain,ca,which,copied,color})=>(
                <div key={chain} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px',padding:'12px 16px',borderRadius:12,border:'1px solid var(--border)',background:'var(--card)'}}>
                  <div><div style={{fontSize:'.65rem',letterSpacing:'.12em',color,marginBottom:4,fontWeight:600}}>{chain}</div><div className="ca-addr">{ca}</div></div>
                  <button onClick={()=>copy(ca,which)} style={{flexShrink:0,padding:'7px 16px',borderRadius:8,border:`1px solid ${color}40`,background:'transparent',color,fontSize:'.78rem',fontWeight:600,cursor:'pointer'}}>{copied?'✓ Copied':'Copy'}</button>
                </div>
              ))}
            </div>
          </div>
        </section>
        <div style={{borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',background:'rgba(200,255,0,.03)',padding:'2rem'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1.5rem',maxWidth:1200,margin:'0 auto'}}>
            {stats.map(s=>(
              <div key={s.label} style={{textAlign:'center'}}>
                <div style={{fontSize:'.7rem',letterSpacing:'.12em',color:'var(--muted)',marginBottom:6,fontWeight:600}}>{s.label.toUpperCase()}</div>
                <div style={{fontFamily:'Bebas Neue',fontSize:'2rem',letterSpacing:'.04em',color:'var(--accent)'}}>{s.value}</div>
                <div style={{fontSize:'.7rem',color:'var(--muted)',marginTop:2}}>{s.note}</div>
              </div>
            ))}
          </div>
        </div>
        <section style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',gap:'3rem',maxWidth:1200,margin:'0 auto',padding:'5rem 2rem',alignItems:'center'}}>
          <div>
            <div style={{fontFamily:'Bebas Neue',fontSize:'3rem',letterSpacing:'.04em',marginBottom:'1.5rem',lineHeight:1}}>WHO IS<br/><span style={{color:'var(--accent)'}}>PHUCKMC</span>?</div>
            <p style={{color:'var(--muted)',lineHeight:1.8,marginBottom:'1.2rem'}}>PHUCKMC isn’t just a token — it’s a statement. While others chase pumps and pray for listings, we built a machine: multi-chain, self-sustaining, backed by real mechanics.</p>
            <p style={{color:'var(--muted)',lineHeight:1.8}}>Buybacks. Staking rewards. A community that actually holds. Calm money. Loud memes.</p>
            <div style={{display:'flex',gap:'12px',marginTop:'1.5rem',flexWrap:'wrap'}}>
              <Link href="/staking" style={{padding:'10px 22px',borderRadius:10,border:'1px solid var(--accent)',color:'var(--accent)',fontWeight:600,fontSize:'.9rem',textDecoration:'none'}}>Stake PHUCK →</Link>
              <Link href="/predictions" style={{padding:'10px 22px',borderRadius:10,border:'1px solid var(--border)',color:'var(--muted)',fontWeight:600,fontSize:'.9rem',textDecoration:'none'}}>Predictions →</Link>
            </div>
          </div>
          <div style={{position:'relative',borderRadius:24,overflow:'hidden',aspectRatio:'16/9',border:'1px solid var(--border)'}}>
            <Image src="/banner.png" alt="PHUCKMC banner" fill sizes="(max-width:768px) 100vw, 50vw" style={{objectFit:'cover'}}/>
          </div>
        </section>
        <section style={{maxWidth:1200,margin:'0 auto',padding:'2rem 2rem 5rem'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>
            <div className="chain-monad" style={{borderRadius:20,border:'1px solid',padding:'2rem',background:'rgba(200,255,0,.04)'}}>
              <div style={{fontFamily:'Bebas Neue',fontSize:'1.8rem',color:'var(--accent)',marginBottom:'1rem',letterSpacing:'.06em'}}>⬡ Monad</div>
              <p style={{color:'var(--muted)',lineHeight:1.7,marginBottom:'1.5rem',fontSize:'.9rem'}}>High-speed EVM chain. Full staking, buyback mechanics, and predictions market.</p>
              <div style={{marginBottom:'1.5rem'}}><div style={{fontSize:'.65rem',letterSpacing:'.12em',color:'var(--accent)',marginBottom:6,fontWeight:600}}>CONTRACT</div><div className="ca-addr">{MONAD_CA}</div></div>
              <a href={`https://nad.fun/tokens/${MONAD_CA}`} target="_blank" rel="noreferrer" style={{display:'inline-block',padding:'12px 24px',borderRadius:10,background:'var(--accent)',color:'#000',fontWeight:700,fontSize:'.85rem',textDecoration:'none'}}>Buy on Nad.fun →</a>
            </div>
            <div className="chain-solana" style={{borderRadius:20,border:'1px solid',padding:'2rem',background:'rgba(153,69,255,.04)'}}>
              <div style={{fontFamily:'Bebas Neue',fontSize:'1.8rem',color:'var(--purple)',marginBottom:'1rem',letterSpacing:'.06em'}}>◎ Solana</div>
              <p style={{color:'var(--muted)',lineHeight:1.7,marginBottom:'1.5rem',fontSize:'.9rem'}}>Fast, cheap, and live. Same PHUCK energy on a different chain.</p>
              <div style={{marginBottom:'1.5rem'}}><div style={{fontSize:'.65rem',letterSpacing:'.12em',color:'var(--purple)',marginBottom:6,fontWeight:600}}>CONTRACT</div><div className="ca-addr">{SOLANA_CA}</div></div>
              <a href="https://join.pump.fun/HSag/5uk0701t" target="_blank" rel="noreferrer" style={{display:'inline-block',padding:'12px 24px',borderRadius:10,background:'var(--purple)',color:'#fff',fontWeight:700,fontSize:'.85rem',textDecoration:'none'}}>Buy on Pump.fun →</a>
            </div>
          </div>
        </section>
        <section style={{borderTop:'1px solid var(--border)',background:'rgba(255,255,255,.02)',padding:'3rem 2rem'}}>
          <div style={{maxWidth:1200,margin:'0 auto'}}>
            <div style={{fontFamily:'Bebas Neue',fontSize:'.75rem',letterSpacing:'.2em',color:'var(--muted)',marginBottom:'1.5rem'}}>UTILITIES</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem'}}>
              {[{label:'Swap',desc:'Buy PHUCK via fee router. 1% fuels buybacks.',href:'/swap',color:'var(--accent)'},{label:'Staking',desc:'Time-weighted staking. Longer locks earn more.',href:'/staking',color:'var(--purple)'},{label:'Predictions',desc:'P2P prediction market. 1% fee to buyback.',href:'/predictions',color:'#ff6b6b'}].map(u=>(
                <Link key={u.label} href={u.href} style={{display:'block',padding:'1.5rem',borderRadius:16,border:'1px solid var(--border)',background:'var(--card)',textDecoration:'none'}}>
                  <div style={{fontFamily:'Bebas Neue',fontSize:'1.4rem',color:u.color,marginBottom:8,letterSpacing:'.04em'}}>{u.label}</div>
                  <div style={{color:'var(--muted)',fontSize:'.85rem',lineHeight:1.5}}>{u.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section ref={manifestoRef} style={{maxWidth:900,margin:'0 auto',padding:'5rem 2rem 6rem',textAlign:'center'}}>
          <div style={{fontFamily:'Bebas Neue',fontSize:'.8rem',letterSpacing:'.2em',color:'var(--accent)',marginBottom:'2rem'}}>THE MANIFESTO</div>
          {["WE DON'T CHASE PUMPS.",'WE BUILD MACHINES.','PHUCK THE NOISE.','HOLD ANYWAY.','CALM MONEY. LOUD MEMES.','THIS IS PHUCKMC.'].map((line,i)=>(
            <div key={i} className={`m-line${manifesto?' lit':''}`} style={{fontFamily:'Bebas Neue',fontSize:'clamp(2rem,5vw,3.5rem)',letterSpacing:'.04em',lineHeight:1.1,color:i%2===0?'var(--text)':'var(--accent)',transitionDelay:`${i*120}ms`}}>{line}</div>
          ))}
        </section>
        <footer style={{borderTop:'1px solid var(--border)',padding:'3rem 2rem',textAlign:'center'}}>
          <div style={{fontFamily:'Bebas Neue',fontSize:'2rem',letterSpacing:'.06em',marginBottom:'1.5rem'}}>PHUCK<span style={{color:'var(--accent)'}}>MC</span></div>
          <div style={{display:'flex',justifyContent:'center',gap:'1.5rem',marginBottom:'2rem',flexWrap:'wrap'}}>
            {[{label:'Telegram',href:'https://t.me/PhuckMc'},{label:'Play',href:'/play'},{label:'YouTube',href:'https://youtube.com/@phuckmc-w8k'},{label:'TikTok',href:'https://tiktok.com/@phuckmc'},{label:'Staking',href:'/staking'},{label:'Predictions',href:'/predictions'},{label:'Play',href:'/play'}].map(l=>(
              <a key={l.label} href={l.href} target={l.href.startsWith('http')?'_blank':undefined} rel={l.href.startsWith('http')?'noreferrer':undefined} style={{color:'var(--muted)',textDecoration:'none',fontSize:'.9rem'}}
                onMouseEnter={e=>(e.currentTarget.style.color='var(--accent)')} onMouseLeave={e=>(e.currentTarget.style.color='var(--muted)')}
              >{l.label}</a>
            ))}
          </div>
          <div style={{fontSize:'.75rem',color:'rgba(232,230,240,.3)'}}>© 2026 PHUCKMC. Not financial advice. PHUCK the chart.</div>
        </footer>
      </div>
    </>
  )
}
