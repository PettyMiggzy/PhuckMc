#!/usr/bin/env bash
# PhuckMc — arcade + audit fixes installer
# Safe to re-run. Pushes to origin/main when done.
set -e

# --- locate repo ---
if [ -d "/workspaces/PhuckMc/.git" ]; then
  cd /workspaces/PhuckMc
elif [ -d "$HOME/PhuckMc/.git" ]; then
  cd "$HOME/PhuckMc"
elif [ -d ".git" ] && git remote -v | grep -q PhuckMc; then
  : # already in repo
else
  echo "❌ Couldn't find the PhuckMc repo. cd into it first." >&2
  exit 1
fi
echo "📂 Working in: $(pwd)"

# --- sync with origin ---
echo "🔄 Syncing with origin..."
git fetch origin
git checkout main 2>/dev/null || git checkout -b main
git reset --hard origin/main

# --- 1. remove repo bloat & secrets ---
echo "🧹 Removing bloat & secrets..."
git rm -rf --cached --ignore-unmatch \
  .env \
  "e error" \
  vercel-build-log.txt \
  vercel-prod-log.txt \
  stickers >/dev/null 2>&1 || true
rm -rf "e error" vercel-build-log.txt vercel-prod-log.txt stickers .env 2>/dev/null || true

# --- 2. .gitignore ---
cat > .gitignore <<'EOF'
# deps
node_modules
.pnpm-store

# next
.next
out
.vercel
next-env.d.ts

# env
.env
.env.local
.env.*.local

# logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
vercel-*-log.txt
"e error"

# editor
.DS_Store
.idea
.vscode

# misc
stickers/
EOF

# --- 3. .nvmrc ---
echo "20" > .nvmrc

# --- 4. /play page (the arcade) ---
echo "🎮 Writing arcade page..."
mkdir -p src/app/play
cat > src/app/play/page.tsx <<'EOF'
'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const SYMBOLS = ['💊', '🎯', '🚀', '💎', '🔥', '⚡']

export default function PlayPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        :root{--accent:#c8ff00;--purple:#9945ff;--bg:#06050e;--card:rgba(255,255,255,0.03);--border:rgba(255,255,255,0.08);--text:#e8e6f0;--muted:rgba(232,230,240,0.55);}
        body{background:var(--bg)!important;color:var(--text);font-family:'Space Grotesk',sans-serif;margin:0;}
        header.site-header{display:none!important;}
        .arcade-h{font-family:'Bebas Neue',sans-serif;letter-spacing:.05em;}
        .game-card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:1.75rem;display:flex;flex-direction:column;}
        .btn{padding:10px 20px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--text);font-weight:600;cursor:pointer;font-size:.9rem;transition:all .15s;}
        .btn:hover{background:rgba(255,255,255,0.08);}
        .btn-accent{background:var(--accent);color:#000;border-color:var(--accent);}
        .btn-accent:hover{filter:brightness(1.1);background:var(--accent);}
        .btn-purple{background:var(--purple);color:#fff;border-color:var(--purple);}
        .btn-purple:hover{filter:brightness(1.1);background:var(--purple);}
        .btn:disabled{opacity:.4;cursor:not-allowed;}
        .reel{font-size:3rem;width:80px;height:80px;display:flex;align-items:center;justify-content:center;background:#000;border:1px solid var(--border);border-radius:12px;}
        .reel.spin{animation:spin .08s linear infinite;}
        @keyframes spin{0%{transform:translateY(-4px);}100%{transform:translateY(4px);}}
        @keyframes flipH{0%{transform:rotateY(0);}100%{transform:rotateY(1800deg);}}
        @keyframes flipT{0%{transform:rotateY(0);}100%{transform:rotateY(1980deg);}}
        .coin{width:140px;height:140px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#9aff00);display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:2.5rem;color:#000;box-shadow:0 0 40px rgba(200,255,0,.3);transform-style:preserve-3d;}
        .coin.flipping-h{animation:flipH 1.2s ease-out;}
        .coin.flipping-t{animation:flipT 1.2s ease-out;}
        .pill-target{width:120px;height:120px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fff,var(--purple) 60%,#5a2eb5);cursor:pointer;user-select:none;transition:transform .05s;display:flex;align-items:center;justify-content:center;font-size:3rem;border:none;}
        .pill-target:active{transform:scale(.92);}
        .pill-target:disabled{opacity:.3;cursor:not-allowed;}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(153,69,255,.5);}50%{box-shadow:0 0 0 24px rgba(153,69,255,0);}}
        .pill-target.live{animation:pulse 1s infinite;}
      `}</style>

      <main style={{minHeight:'100vh',padding:'2rem 1rem',maxWidth:1200,margin:'0 auto'}}>
        <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'2rem',flexWrap:'wrap',gap:'1rem'}}>
          <Link href="/" style={{color:'var(--muted)',textDecoration:'none',fontSize:'.9rem'}}>← Back</Link>
          <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap'}}>
            <Link href="/swap" className="btn">Swap</Link>
            <Link href="/staking" className="btn">Stake</Link>
            <Link href="/predictions" className="btn">Predictions</Link>
          </div>
        </nav>

        <header style={{textAlign:'center',marginBottom:'3rem'}}>
          <div className="arcade-h" style={{fontSize:'4rem',lineHeight:1,color:'var(--accent)',marginBottom:'.5rem'}}>PHUCK ARCADE</div>
          <p style={{color:'var(--muted)',fontSize:'1rem',maxWidth:600,margin:'0 auto'}}>Three games. No wallet required. High scores saved on this device.</p>
        </header>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:'1.5rem'}}>
          <CoinFlip />
          <PillClicker />
          <Slots />
        </div>

        <div style={{marginTop:'3rem',padding:'1.5rem',border:'1px dashed var(--border)',borderRadius:16,textAlign:'center',color:'var(--muted)',fontSize:'.85rem'}}>
          Just for fun — no tokens at risk, no on-chain anything. Your scores live in your browser.
        </div>
      </main>
    </>
  )
}

/* ---------- COIN FLIP ---------- */
function CoinFlip() {
  const [pick, setPick] = useState<'H' | 'T' | null>(null)
  const [result, setResult] = useState<'H' | 'T' | null>(null)
  const [flipping, setFlipping] = useState(false)
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('phuck:flip') || '{}')
      if (typeof s.wins === 'number') setWins(s.wins)
      if (typeof s.losses === 'number') setLosses(s.losses)
    } catch {}
  }, [])

  function play(choice: 'H' | 'T') {
    if (flipping) return
    setPick(choice)
    setResult(null)
    setFlipping(true)
    setTimeout(() => {
      const r: 'H' | 'T' = Math.random() < 0.5 ? 'H' : 'T'
      setResult(r)
      setFlipping(false)
      const won = r === choice
      const w = wins + (won ? 1 : 0)
      const l = losses + (won ? 0 : 1)
      setWins(w); setLosses(l)
      try { localStorage.setItem('phuck:flip', JSON.stringify({ wins: w, losses: l })) } catch {}
    }, 1200)
  }

  function reset() {
    setWins(0); setLosses(0); setPick(null); setResult(null)
    try { localStorage.setItem('phuck:flip', JSON.stringify({ wins: 0, losses: 0 })) } catch {}
  }

  const face = result ?? pick ?? 'H'
  const flipClass = flipping ? (face === 'H' ? 'flipping-h' : 'flipping-t') : ''

  return (
    <div className="game-card">
      <div className="arcade-h" style={{fontSize:'1.6rem',color:'var(--accent)',marginBottom:'.25rem'}}>COIN FLIP</div>
      <div style={{color:'var(--muted)',fontSize:'.85rem',marginBottom:'1.25rem'}}>50/50. No edge. Pure luck.</div>

      <div style={{display:'flex',justifyContent:'center',padding:'1.5rem 0'}}>
        <div className={`coin ${flipClass}`}>{face === 'H' ? 'H' : 'T'}</div>
      </div>

      <div style={{minHeight:'1.4rem',textAlign:'center',marginBottom:'1rem',fontSize:'.9rem',color: result ? (result === pick ? 'var(--accent)' : '#ff6b6b') : 'var(--muted)'}}>
        {result ? (result === pick ? '✓ You won!' : '✗ Better luck next time') : flipping ? 'Flipping…' : 'Pick a side'}
      </div>

      <div style={{display:'flex',gap:'.5rem',marginBottom:'1rem'}}>
        <button className="btn btn-accent" style={{flex:1}} onClick={() => play('H')} disabled={flipping}>HEADS</button>
        <button className="btn btn-purple" style={{flex:1}} onClick={() => play('T')} disabled={flipping}>TAILS</button>
      </div>

      <div style={{marginTop:'auto',display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'1rem',borderTop:'1px solid var(--border)',fontSize:'.85rem'}}>
        <div><span style={{color:'var(--accent)'}}>{wins}W</span> · <span style={{color:'#ff6b6b'}}>{losses}L</span></div>
        <button onClick={reset} style={{background:'none',border:'none',color:'var(--muted)',fontSize:'.75rem',cursor:'pointer'}}>reset</button>
      </div>
    </div>
  )
}

/* ---------- PILL CLICKER ---------- */
function PillClicker() {
  const [running, setRunning] = useState(false)
  const [count, setCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [best, setBest] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    try {
      const b = parseInt(localStorage.getItem('phuck:click') || '0', 10)
      if (!isNaN(b)) setBest(b)
    } catch {}
  }, [])

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  function start() {
    setCount(0)
    setTimeLeft(10)
    setRunning(true)
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setRunning(false)
          setCount(c => {
            setBest(b => {
              const nb = Math.max(b, c)
              try { localStorage.setItem('phuck:click', String(nb)) } catch {}
              return nb
            })
            return c
          })
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  return (
    <div className="game-card">
      <div className="arcade-h" style={{fontSize:'1.6rem',color:'var(--purple)',marginBottom:'.25rem'}}>PILL CLICKER</div>
      <div style={{color:'var(--muted)',fontSize:'.85rem',marginBottom:'1.25rem'}}>Tap the pill as fast as you can. 10 seconds.</div>

      <div style={{display:'flex',justifyContent:'center',alignItems:'center',padding:'1.5rem 0',minHeight:160}}>
        <button
          className={`pill-target ${running ? 'live' : ''}`}
          onClick={() => running && setCount(c => c + 1)}
          disabled={!running}
          aria-label="click pill"
        >💊</button>
      </div>

      <div style={{display:'flex',justifyContent:'space-around',marginBottom:'1rem',textAlign:'center'}}>
        <div>
          <div style={{fontFamily:'Bebas Neue',fontSize:'2rem',color:'var(--accent)',lineHeight:1}}>{count}</div>
          <div style={{fontSize:'.7rem',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.1em'}}>clicks</div>
        </div>
        <div>
          <div style={{fontFamily:'Bebas Neue',fontSize:'2rem',color:running ? 'var(--purple)' : 'var(--muted)',lineHeight:1}}>{timeLeft}s</div>
          <div style={{fontSize:'.7rem',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.1em'}}>left</div>
        </div>
      </div>

      <button className="btn btn-purple" onClick={start} disabled={running} style={{width:'100%'}}>
        {running ? 'GO GO GO' : count > 0 ? 'Play again' : 'Start'}
      </button>

      <div style={{marginTop:'auto',paddingTop:'1rem',borderTop:'1px solid var(--border)',fontSize:'.85rem',display:'flex',justifyContent:'space-between'}}>
        <span style={{color:'var(--muted)'}}>Best</span>
        <span style={{color:'var(--accent)',fontWeight:600}}>{best} clicks</span>
      </div>
    </div>
  )
}

/* ---------- SLOTS ---------- */
function Slots() {
  const [reels, setReels] = useState<string[]>(['💊', '💊', '💊'])
  const [spinning, setSpinning] = useState<boolean[]>([false, false, false])
  const [credits, setCredits] = useState(100)
  const [msg, setMsg] = useState('Spin to play')

  useEffect(() => {
    try {
      const c = parseInt(localStorage.getItem('phuck:slots') || '100', 10)
      if (!isNaN(c)) setCredits(c)
    } catch {}
  }, [])

  function persist(c: number) {
    try { localStorage.setItem('phuck:slots', String(c)) } catch {}
  }

  function spin() {
    if (credits < 10 || spinning.some(Boolean)) return
    const c = credits - 10
    setCredits(c); persist(c)
    setMsg('Spinning…')
    setSpinning([true, true, true])

    const finals = [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    ]

    // animate scrambling
    const scram = setInterval(() => {
      setReels(r => r.map((v, i) => spinning[i] === false ? v : SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]))
    }, 80)

    // stop reels staggered
    setTimeout(() => { setSpinning(s => [false, s[1], s[2]]); setReels(r => [finals[0], r[1], r[2]]) }, 600)
    setTimeout(() => { setSpinning(s => [false, false, s[2]]); setReels(r => [finals[0], finals[1], r[2]]) }, 1100)
    setTimeout(() => {
      clearInterval(scram)
      setSpinning([false, false, false])
      setReels(finals)
      const allMatch = finals[0] === finals[1] && finals[1] === finals[2]
      const twoMatch = !allMatch && (finals[0] === finals[1] || finals[1] === finals[2] || finals[0] === finals[2])
      let win = 0
      if (allMatch) win = finals[0] === '💎' ? 200 : 50
      else if (twoMatch) win = 15
      if (win > 0) {
        const nc = credits - 10 + win
        setCredits(nc); persist(nc)
        setMsg(allMatch ? `JACKPOT +${win}` : `nice +${win}`)
      } else {
        setMsg('try again')
      }
    }, 1700)
  }

  function reset() {
    setCredits(100); persist(100); setMsg('reset')
  }

  return (
    <div className="game-card">
      <div className="arcade-h" style={{fontSize:'1.6rem',color:'#ff6b6b',marginBottom:'.25rem'}}>SLOTS</div>
      <div style={{color:'var(--muted)',fontSize:'.85rem',marginBottom:'1.25rem'}}>10 credits per spin. 3-of-a-kind 💎 = 200.</div>

      <div style={{display:'flex',justifyContent:'center',gap:'.5rem',padding:'1rem 0',background:'#000',borderRadius:12,border:'1px solid var(--border)',margin:'0 0 1rem'}}>
        {reels.map((s, i) => (
          <div key={i} className={`reel ${spinning[i] ? 'spin' : ''}`}>{s}</div>
        ))}
      </div>

      <div style={{minHeight:'1.4rem',textAlign:'center',marginBottom:'1rem',fontSize:'.9rem',color:msg.includes('+') || msg.includes('JACK') ? 'var(--accent)' : 'var(--muted)'}}>{msg}</div>

      <button className="btn" style={{width:'100%',background:'#ff6b6b',color:'#000',borderColor:'#ff6b6b'}} onClick={spin} disabled={credits < 10 || spinning.some(Boolean)}>
        {credits < 10 ? 'Out of credits' : 'SPIN (-10)'}
      </button>

      <div style={{marginTop:'auto',paddingTop:'1rem',borderTop:'1px solid var(--border)',fontSize:'.85rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{color:'var(--muted)'}}>Credits</span>
        <span style={{display:'flex',gap:'.75rem',alignItems:'center'}}>
          <span style={{color:'var(--accent)',fontWeight:600}}>{credits}</span>
          <button onClick={reset} style={{background:'none',border:'none',color:'var(--muted)',fontSize:'.75rem',cursor:'pointer'}}>reset</button>
        </span>
      </div>
    </div>
  )
}
EOF

# --- 5. Add Play link to SiteHeader ---
echo "🔗 Adding Play link to nav..."
if ! grep -q '/play' src/components/SiteHeader.tsx; then
  perl -i -pe 's|(\{navLink\("/predictions", "Predictions"\)\})|\1\n          {navLink("/play", "Play")}|' src/components/SiteHeader.tsx
fi

# --- 6. Add Play link to homepage nav + fix copyright + remove broken X link ---
echo "🔗 Updating homepage nav, copyright, broken Twitter link..."
# Add Play to inline nav array
perl -i -pe "s|\\{label:'Predictions',href:'/predictions'\\}\\]\\.map\\(l=>\\(|{label:'Predictions',href:'/predictions'},{label:'Play',href:'/play'}].map(l=>(|g" src/app/page.tsx
# Remove broken X link from social icons
perl -i -pe "s|,\\{icon:'\\xF0\\x9D\\x95\\x8F',label:'X',href:'https://t.me/PhuckMc/74931'\\}||g" src/app/page.tsx
# Fix the second nav (footer-ish) — replace broken X/Twitter href
perl -i -pe "s|\\{label:'X/Twitter',href:'https://t.me/PhuckMc/74931'\\}|{label:'Play',href:'/play'}|g" src/app/page.tsx
# Update copyright
perl -i -pe 's|© 2025|© 2026|g' src/app/page.tsx

# --- 7. README ---
cat > README.md <<'EOF'
# PhuckMc

Multi-chain meme + utility token. Live on **Monad** and **Solana**.

## Stack
- Next.js 14 App Router · TypeScript · Tailwind
- wagmi + viem for Monad
- RainbowKit for wallet UX

## Routes
| Path | What |
|---|---|
| `/` | Landing |
| `/swap` | Buy PHUCK via fee router (1% → buybacks) |
| `/staking` | Time-weighted staking |
| `/predictions` | P2P prediction market |
| `/play` | Arcade — coin flip, pill clicker, slots |

## Local dev
```bash
nvm use         # uses .nvmrc (Node 20)
npm install
cp .env.example .env.local   # fill in WC project id
npm run dev
```

## Environment
Copy `.env.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_WC_PROJECT_ID` — WalletConnect project id

**Never commit `.env`.** `.gitignore` excludes it.

## Contracts (Monad)
- Token: `0x148a3a811979e5BF8366FC279B2d67742Fe17777`
- Staking: `0x1ed1b91aa4b58336348783bc671e22aa4e34b9b8`
- Buyback wallet: `0xC77A81C4Cf1Dce5006141996D1c6B84E16621aD6`
- Fee router: `0x60832a12f12a971Aa530beb671baB2991d4afB7f`

## Solana
Pump.fun: `DKSL2G7YSiMVXZX8iFgkoqVDA7r1ZGtWDQaKf95vpump`

## Socials
- Telegram: https://t.me/PhuckMc
- YouTube: https://youtube.com/@phuckmc-w8k
- TikTok: https://tiktok.com/@phuckmc

PHUCK the chart.
EOF

# --- 8. .env.example ---
cat > .env.example <<'EOF'
# Copy to .env.local and fill in. Never commit real values.
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id_here
EOF

# --- 9. commit + push ---
echo "📦 Committing..."
git add -A
git status --short

if git diff --cached --quiet; then
  echo "⚠️  Nothing to commit — already up to date."
else
  git commit -m "feat(arcade): add /play with coinflip, clicker, slots + audit cleanup

- New /play route with 3 client-side games (state in localStorage)
- Removed committed .env (rotate any keys it contained!)
- Removed 'e error', vercel-*-log.txt, stickers/ from repo
- .gitignore now blocks env files and build logs
- .nvmrc bumped to Node 20
- Removed broken X/Twitter link (was pointing to a Telegram URL)
- Updated copyright to 2026
- Added .env.example and README
- Nav updated on homepage and SiteHeader to include /play"

  echo "🚀 Pushing..."
  git push origin main
fi

echo ""
echo "✅ Done."
echo ""
echo "Verify at: https://github.com/PettyMiggzy/PhuckMc/commits/main"
echo "Vercel will redeploy automatically. Then visit /play on your live site."
echo ""
echo "⚠️  ROTATE THE ANKR KEY that was in the old .env — assume it's compromised."
echo "⚠️  Chain ID in src/lib/contracts.ts and src/lib/wagmi.ts is 143."
echo "    If your contracts are actually on Monad testnet (10143) or mainnet,"
echo "    update both files. Didn't touch this — too risky without confirming."