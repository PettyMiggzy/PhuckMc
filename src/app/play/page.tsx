'use client'

import Link from 'next/link'

const GAMES = [
  { slug: 'chart',   title: 'PHUCK THE CHART',   tag: 'flappy bird, but trading',     emoji: '📈', accent: '#c8ff00', sprite: '/sprites/flap.png' },
  { slug: 'runner',  title: 'BUYBACK RUNNER',     tag: 'endless runner, dodge rugs',    emoji: '🏃', accent: '#9945ff', sprite: '/sprites/buyback-run.png' },
  { slug: 'moon',    title: 'MOON MISSION',       tag: 'jump arc to the moon',          emoji: '🚀', accent: '#c8ff00', sprite: '/sprites/jump-fly.png' },
  { slug: 'diamond', title: 'DIAMOND HANDS',      tag: 'survive the dump',              emoji: '💎', accent: '#9945ff', sprite: '/sprites/diamond-hands.png' },
  { slug: 'pump',    title: 'PUMP OR DUMP',       tag: 'reflex test, tap fast',         emoji: '⚡', accent: '#c8ff00', sprite: '/sprites/sloth-pump.png' },
  { slug: 'plinko',  title: 'LIQUIDITY PLINKO',   tag: 'drop a coin, pray',             emoji: '🪙', accent: '#9945ff', sprite: '/sprites/coin-spin.png' },
]

export default function PlayHub() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        :root{--accent:#c8ff00;--purple:#9945ff;--bg:#06050e;--card:rgba(255,255,255,0.03);--border:rgba(255,255,255,0.08);--text:#e8e6f0;--muted:rgba(232,230,240,0.55);}
        body{background:var(--bg)!important;color:var(--text);font-family:'Space Grotesk',sans-serif;margin:0;}
        .h-bebas{font-family:'Bebas Neue',sans-serif;letter-spacing:.05em;}
        .game-card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:1.5rem;text-decoration:none;color:var(--text);display:flex;flex-direction:column;gap:.75rem;transition:all .2s;position:relative;overflow:hidden;min-height:220px;}
        .game-card:hover{transform:translateY(-4px);border-color:var(--accent);}
        .game-card::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 70% 30%,var(--card-glow),transparent 60%);opacity:.4;pointer-events:none;}
        .hero-banner{background:linear-gradient(135deg,rgba(153,69,255,.15),rgba(200,255,0,.1));border:1px solid var(--border);border-radius:24px;padding:2rem;margin-bottom:2rem;display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;}
        .hero-banner img{max-width:280px;border-radius:16px;}
      `}</style>

      <main style={{minHeight:'100vh',padding:'2.5rem 1.25rem',maxWidth:1200,margin:'0 auto'}}>
        <div className="hero-banner">
          <img src="/sprites/hero-rip.png" alt="PhuckMC arcade" />
          <div style={{flex:1,minWidth:240}}>
            <h1 className="h-bebas" style={{fontSize:'clamp(2rem,5vw,3.5rem)',margin:0,lineHeight:1}}>
              PHUCK<span style={{color:'var(--accent)'}}>ARCADE</span>
            </h1>
            <p style={{color:'var(--muted)',margin:'.75rem 0 0',fontSize:'1rem'}}>
              Six games. Zero pay-to-win. Top scores live forever (or until your browser cache clears).
            </p>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1.25rem'}}>
          {GAMES.map(g => (
            <Link
              key={g.slug}
              href={`/play/${g.slug}`}
              className="game-card"
              style={{ ['--card-glow' as string]: g.accent + '33' } as React.CSSProperties}
            >
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:'2rem'}}>{g.emoji}</span>
                <span className="h-bebas" style={{fontSize:'.85rem',color:'var(--muted)',letterSpacing:'.1em'}}>PLAY ▶</span>
              </div>
              <h3 className="h-bebas" style={{margin:0,fontSize:'1.5rem',color:g.accent}}>{g.title}</h3>
              <p style={{color:'var(--muted)',margin:0,fontSize:'.9rem',flex:1}}>{g.tag}</p>
              <div style={{height:80,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                <img src={g.sprite} alt="" style={{maxHeight:80,maxWidth:'100%',objectFit:'contain'}} />
              </div>
            </Link>
          ))}
        </div>

        <p style={{textAlign:'center',color:'var(--muted)',fontSize:'.85rem',marginTop:'2.5rem'}}>
          All games run on-device. No wallet connection required to play.
        </p>
      </main>
    </>
  )
}
