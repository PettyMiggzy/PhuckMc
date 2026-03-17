'use client'

import Image from 'next/image'
import StakingPanel from '@/components/StakingPanel'
import WalletButton from '@/components/WalletButton'

const S = {
  bg:     '#06050e',
  accent: '#c8ff00',
  purple: '#9945ff',
  card:   'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  text:   '#e8e6f0',
  muted:  'rgba(232,230,240,0.5)',
}

function Nav() {
  return (
    <nav style={{position:'sticky',top:0,zIndex:100,borderBottom:`1px solid ${S.border}`,background:'rgba(6,5,14,.92)',backdropFilter:'blur(20px)',padding:'0 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',height:'64px'}}>
      <a href="/" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none'}}>
        <img src="/logo.png" alt="PHUCKMC" style={{width:34,height:34,borderRadius:9,objectFit:'cover',border:`1px solid ${S.border}`}}/>
        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.4rem',letterSpacing:'.06em',color:S.text}}>PHUCK<span style={{color:S.accent}}>MC</span></span>
      </a>
      <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
        {[['Home','/'],['Swap','/swap'],['Staking','/staking'],['Predictions','/predictions']].map(([l,h])=>(
          <a key={l} href={h} style={{padding:'7px 16px',borderRadius:999,border:`1px solid ${h==='/staking'?S.purple:S.border}`,background:h==='/staking'?'rgba(153,69,255,0.12)':'rgba(255,255,255,0.03)',fontSize:'.82rem',fontWeight:500,color:h==='/staking'?'#c084fc':S.text,textDecoration:'none'}}>{l}</a>
        ))}
        <a href="https://t.me/PhuckMc" target="_blank" rel="noreferrer" style={{padding:'7px 12px',borderRadius:999,border:`1px solid ${S.border}`,background:'rgba(255,255,255,0.03)',fontSize:'.82rem',color:S.muted,textDecoration:'none'}}>✈️</a>
        <a href="https://t.me/PhuckMc/74931" target="_blank" rel="noreferrer" style={{padding:'7px 12px',borderRadius:999,border:`1px solid ${S.border}`,background:'rgba(255,255,255,0.03)',fontSize:'.82rem',color:S.muted,textDecoration:'none'}}>𝕏</a>
        <WalletButton />
      </div>
    </nav>
  )
}

export default function StakingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        body { background: #06050e !important; font-family: 'Space Grotesk', sans-serif; color: #e8e6f0; }
      `}</style>
      <div style={{background:S.bg, minHeight:'100vh', position:'relative'}}>
        {/* Background hero image */}
        <div style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}>
          <Image src="/hero.png" alt="" fill priority sizes="100vw" style={{objectFit:'cover',opacity:0.35}}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom, rgba(6,5,14,0.5) 0%, rgba(6,5,14,0.7) 50%, rgba(6,5,14,0.95) 100%)'}}/>
        </div>

        <div style={{position:'relative', zIndex:1}}>
          <Nav />

          {/* Hero header */}
          <div style={{padding:'3rem 2rem 2rem', maxWidth:1200, margin:'0 auto'}}>
            <div style={{display:'inline-flex', alignItems:'center', gap:8, padding:'4px 14px', borderRadius:999, border:`1px solid ${S.purple}60`, background:'rgba(153,69,255,0.1)', marginBottom:'1rem'}}>
              <span style={{width:7, height:7, borderRadius:'50%', background:S.purple, boxShadow:`0 0 8px ${S.purple}`, display:'inline-block'}}/>
              <span style={{fontSize:'.75rem', fontWeight:600, letterSpacing:'.1em', color:'#c084fc'}}>MONAD MAINNET</span>
            </div>
            <h1 style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(3rem,7vw,5.5rem)', letterSpacing:'.03em', lineHeight:.9, margin:'0 0 .8rem'}}>
              STAKE <span style={{color:'#c084fc'}}>PHUCK</span>MC
            </h1>
            <p style={{color:S.muted, fontSize:'1rem', maxWidth:520, lineHeight:1.6}}>
              Time-weighted staking. Longer locks earn more. Early exits feed the reward pool.
            </p>
            {/* Stats pills */}
            <div style={{display:'flex', gap:10, marginTop:'1.5rem', flexWrap:'wrap'}}>
              {[
                {label:'Lock Tiers', value:'30 / 60 / 90 / 365 days'},
                {label:'Early Exit Penalty', value:'10%'},
                {label:'Penalty Split', value:'60% pool, 40% buyback'},
              ].map(({label,value}) => (
                <div key={label} style={{padding:'8px 16px', borderRadius:999, border:`1px solid ${S.border}`, background:'rgba(255,255,255,0.04)', fontSize:'.8rem'}}>
                  <span style={{color:S.muted}}>{label}: </span>
                  <span style={{color:S.text, fontWeight:600}}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Staking panel */}
          <div style={{padding:'0 2rem 4rem', maxWidth:1200, margin:'0 auto'}}>
            <StakingPanel />
          </div>
        </div>
      </div>
    </>
  )
}
