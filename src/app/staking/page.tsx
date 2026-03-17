'use client'

import Image from 'next/image'
import StakingPanel from '@/components/StakingPanel'
import WalletButton from '@/components/WalletButton'

function Nav() {
  return (
    <nav style={{position:'sticky',top:0,zIndex:100,borderBottom:'1px solid rgba(255,255,255,0.08)',background:'rgba(6,5,14,.92)',backdropFilter:'blur(20px)',padding:'0 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',height:'64px'}}>
      <a href="/" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none'}}>
        <img src="/logo.png" alt="PHUCKMC" style={{width:32,height:32,borderRadius:8,objectFit:'cover'}}/>
        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.3rem',letterSpacing:'.06em',color:'#e8e6f0'}}>PHUCK<span style={{color:'#c8ff00'}}>MC</span></span>
      </a>
      <div style={{display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
        {([['Home','/'],['Swap','/swap'],['Staking','/staking'],['Predictions','/predictions']] as const).map(([l,h])=>(
          <a key={l} href={h} style={{padding:'6px 14px',borderRadius:999,border:'1px solid rgba(255,255,255,0.08)',background:h==='/staking'?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.03)',fontSize:'.8rem',fontWeight:500,color:'#e8e6f0',textDecoration:'none'}}>{l}</a>
        ))}
        {([['\u2708\ufe0f','https://t.me/PhuckMc'],['𝕏','https://t.me/PhuckMc/74931']] as const).map(([i,h])=>(
          <a key={h} href={h} target="_blank" rel="noreferrer" style={{padding:'6px 10px',borderRadius:999,border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.03)',fontSize:'.8rem',color:'rgba(232,230,240,0.55)',textDecoration:'none'}}>{i}</a>
        ))}
        <WalletButton />
      </div>
    </nav>
  )
}

export default function StakingPage() {
  return (
    <div style={{background:'#06050e',minHeight:'100vh'}}>
      <div className="fixed inset-0 -z-10">
        <Image src="/hero.png" alt="PHUCKMC" fill priority sizes="100vw" style={{objectFit:'cover'}}/>
        <div className="absolute inset-0 bg-black/60"/>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70"/>
      </div>
      <Nav />
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-20">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Stake <span className="text-purple-300">PHUCKMC</span>
        </h1>
        <p className="mt-3 text-white/80 max-w-2xl">
          Time-weighted staking. Longer locks earn more. Early exits feed the reward pool.
        </p>
        <div className="mt-10"><StakingPanel /></div>
      </section>
    </div>
  )
}
