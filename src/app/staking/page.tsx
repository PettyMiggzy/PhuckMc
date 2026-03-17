'use client'

import WalletButton from '@/components/WalletButton'
import StakingPanel from '@/components/StakingPanel'

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
        {([['Home','/'],['Swap','/swap'],['Staking','/staking'],['Predictions','/predictions']] as const).map(([l,h])=>(
          <a key={l} href={h} style={{padding:'7px 15px',borderRadius:999,border:`1px solid ${h==='/staking'?'rgba(153,69,255,0.5)':'rgba(255,255,255,0.07)'}`,background:h==='/staking'?'rgba(153,69,255,0.14)':'transparent',fontSize:'.83rem',fontWeight:600,color:h==='/staking'?'#c084fc':'rgba(240,238,255,0.65)',textDecoration:'none'}}>{l}</a>
        ))}
        <a href="https://t.me/PhuckMc" target="_blank" rel="noreferrer" style={{padding:'7px 11px',borderRadius:999,border:'1px solid rgba(255,255,255,0.07)',fontSize:'.83rem',color:'rgba(240,238,255,0.4)',textDecoration:'none'}}>✈️</a>
        <a href="https://t.me/PhuckMc/74931" target="_blank" rel="noreferrer" style={{padding:'7px 11px',borderRadius:999,border:'1px solid rgba(255,255,255,0.07)',fontSize:'.83rem',color:'rgba(240,238,255,0.4)',textDecoration:'none'}}>𝕏</a>
        <WalletButton />
      </div>
    </nav>
  )
}

const TIERS = [
  {days:30,  label:'BRONZE',  mult:'1.0×', color:'#cd7f32', bg:'rgba(205,127,50,0.08)',  border:'rgba(205,127,50,0.25)'},
  {days:60,  label:'SILVER',  mult:'1.5×', color:'#c0c0c0', bg:'rgba(192,192,192,0.08)', border:'rgba(192,192,192,0.25)'},
  {days:90,  label:'GOLD',    mult:'2.0×', color:'#ffd700', bg:'rgba(255,215,0,0.08)',   border:'rgba(255,215,0,0.25)'},
  {days:365, label:'DIAMOND', mult:'4.0×', color:'#c8ff00', bg:'rgba(200,255,0,0.08)',   border:'rgba(200,255,0,0.3)'},
]

export default function StakingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        html,body{margin:0;padding:0;background:#080612!important;color:#f0eeff;font-family:'Space Grotesk',sans-serif;overflow-x:hidden;}
        ::selection{background:rgba(153,69,255,0.35);}
        @keyframes orb1{0%,100%{transform:translate(0,0);}40%{transform:translate(80px,-50px);}70%{transform:translate(-40px,30px);}}
        @keyframes orb2{0%,100%{transform:translate(0,0);}30%{transform:translate(-60px,70px);}65%{transform:translate(50px,-30px);}}
        @keyframes orb3{0%,100%{transform:translate(0,0);}50%{transform:translate(40px,60px);}}
        @keyframes badge-pulse{0%,100%{box-shadow:0 0 0 0 rgba(153,69,255,0.5);}50%{box-shadow:0 0 0 10px rgba(153,69,255,0);}}
        @keyframes title-shimmer{0%{background-position:0% 50%;}100%{background-position:200% 50%;}}
        @keyframes scanline{0%{top:-2px;}100%{top:100vh;}}
        .tier-card{transition:transform .2s,border-color .2s,box-shadow .2s;}
        .tier-card:hover{transform:translateY(-5px);}
      `}</style>

      {/* ROOT — hard #080612, no images whatsoever */}
      <div style={{background:'#080612',minHeight:'100vh',position:'relative',overflow:'hidden'}}>

        {/* ── PURE CSS BACKGROUND ── no images ─────────── */}
        <div style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none',overflow:'hidden'}}>
          {/* Base radial */}
          <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 100% 50% at 50% -10%,rgba(100,40,200,0.22) 0%,transparent 70%)'}}/>
          {/* Orb 1 */}
          <div style={{position:'absolute',top:'0%',left:'0%',width:800,height:800,borderRadius:'50%',background:'radial-gradient(circle,rgba(110,30,220,0.14) 0%,transparent 65%)',filter:'blur(90px)',animation:'orb1 20s ease-in-out infinite'}}/>
          {/* Orb 2 */}
          <div style={{position:'absolute',bottom:'-10%',right:'0%',width:900,height:900,borderRadius:'50%',background:'radial-gradient(circle,rgba(70,20,180,0.11) 0%,transparent 65%)',filter:'blur(110px)',animation:'orb2 25s ease-in-out infinite'}}/>
          {/* Orb 3 — green tint */}
          <div style={{position:'absolute',top:'35%',right:'20%',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(200,255,0,0.04) 0%,transparent 70%)',filter:'blur(70px)',animation:'orb3 16s ease-in-out infinite'}}/>
          {/* Grid */}
          <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px)',backgroundSize:'80px 80px'}}/>
          {/* Scan line */}
          <div style={{position:'absolute',left:0,right:0,height:2,background:'linear-gradient(90deg,transparent 0%,rgba(153,69,255,0.2) 40%,rgba(200,255,0,0.15) 60%,transparent 100%)',animation:'scanline 10s linear infinite'}}/>
          {/* Vignette */}
          <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 80% 80% at 50% 50%,transparent 40%,rgba(8,6,18,0.6) 100%)'}}/>
        </div>

        <div style={{position:'relative',zIndex:1}}>
          <Nav />

          {/* ── HERO ───────────────────────────────────── */}
          <div style={{maxWidth:1320,margin:'0 auto',padding:'100px 2.5rem 0'}}>

            {/* Live badge */}
            <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 18px',borderRadius:999,border:'1px solid rgba(153,69,255,0.4)',background:'rgba(153,69,255,0.1)',marginBottom:'2rem',animation:'badge-pulse 3s ease-in-out infinite',backdropFilter:'blur(12px)'}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:'#a855f7',boxShadow:'0 0 8px 2px #a855f7',display:'inline-block'}}/>
              <span style={{fontSize:'.72rem',fontWeight:700,letterSpacing:'.15em',color:'#c084fc'}}>MONAD MAINNET • LIVE</span>
            </div>

            {/* Title */}
            <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(5rem,12vw,10rem)',letterSpacing:'.01em',lineHeight:.85,margin:'0 0 1.5rem',userSelect:'none'}}>
              <span style={{display:'block',color:'#f0eeff',textShadow:'0 0 80px rgba(192,132,252,0.2)'}}>STAKE</span>
              <span style={{display:'block',backgroundImage:'linear-gradient(105deg,#c084fc 0%,#818cf8 35%,#38bdf8 65%,#c8ff00 100%)',backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',animation:'title-shimmer 5s linear infinite'}}>PHUCKMC</span>
            </h1>

            {/* Tagline */}
            <p style={{color:'rgba(240,238,255,0.5)',fontSize:'1.05rem',lineHeight:1.8,maxWidth:480,marginBottom:'2.5rem'}}>
              Time-weighted staking rewards. Lock longer, earn higher multipliers.<br/>
              <strong style={{color:'rgba(240,238,255,0.82)',fontWeight:600}}>Early exits feed back into the pool.</strong>
            </p>

            {/* Tier cards */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',maxWidth:660,marginBottom:'3rem'}}>
              {TIERS.map(({days,label,mult,color,bg,border})=>(
                <div key={days} className="tier-card" style={{padding:'20px 14px',borderRadius:18,border:`1px solid ${border}`,background:bg,textAlign:'center'}}>
                  <div style={{fontSize:'.58rem',letterSpacing:'.2em',color,fontWeight:700,marginBottom:10}}>{label}</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'2.4rem',color:'#f0eeff',lineHeight:1}}>{days}</div>
                  <div style={{fontSize:'.62rem',color:'rgba(240,238,255,0.3)',letterSpacing:'.1em',marginBottom:12}}>DAYS</div>
                  <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'4px 12px',borderRadius:999,background:`${color}18`,border:`1px solid ${color}40`}}>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:'.82rem',color,fontWeight:500}}>{mult}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Info pills */}
            <div style={{display:'flex',gap:'10px',marginBottom:'4rem',flexWrap:'wrap'}}>
              {[{i:'⚡',t:'10% early exit penalty'},{i:'🔁',t:'60% → reward pool'},{i:'💰',t:'40% → buyback wallet'}].map(({i,t})=>(
                <div key={t} style={{display:'flex',alignItems:'center',gap:8,padding:'9px 18px',borderRadius:999,border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.04)',fontSize:'.83rem',color:'rgba(240,238,255,0.65)',backdropFilter:'blur(8px)'}}>
                  <span>{i}</span><span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{maxWidth:1320,margin:'0 auto',padding:'0 2.5rem'}}>
            <div style={{height:1,background:'linear-gradient(90deg,transparent,rgba(153,69,255,0.35) 30%,rgba(200,255,0,0.25) 70%,transparent)'}}/>
          </div>

          {/* ── PANEL ──────────────────────────────────── */}
          <div style={{maxWidth:1320,margin:'0 auto',padding:'3rem 2.5rem 8rem'}}>
            <StakingPanel />
          </div>
        </div>
      </div>
    </>
  )
}
