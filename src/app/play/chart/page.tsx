'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { getTop, submitScore, isGlobal, type ScoreRow } from '@/lib/leaderboard'

const SHEET_FRAMES = 8
const FRAME_W = 624 / 8     // sprite sheet is 624px wide, 8 frames
const FRAME_H = 129          // sprite sheet height (tight crop)
const GAME = 'chart'

export default function ChartGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [running, setRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [over, setOver] = useState(false)
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [board, setBoard] = useState<ScoreRow[]>([])

  useEffect(() => { (async () => setBoard(await getTop(GAME, 10)))() }, [])
  useEffect(() => {
    const b = Number(localStorage.getItem('phuck_best_chart') || '0')
    setBest(b)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height

    const sloth = new Image()
    sloth.src = '/sprites/flap.png'

    let raf = 0
    let frameCount = 0

    const state = {
      y: H / 2,
      vy: 0,
      candles: [] as { x: number; gapY: number; passed: boolean; bullish: boolean }[],
      score: 0,
      flapPhase: 0,
      alive: true,
      started: false,
    }

    function reset() {
      state.y = H / 2
      state.vy = 0
      state.candles = []
      state.score = 0
      state.flapPhase = 0
      state.alive = true
      state.started = false
    }

    function flap() {
      if (!state.alive) return
      state.vy = -7
      state.flapPhase = 6
      state.started = true
    }

    function spawn() {
      const minGap = 140
      const gapY = 80 + Math.random() * (H - 160 - minGap)
      state.candles.push({ x: W + 40, gapY, passed: false, bullish: Math.random() > 0.4 })
    }

    function drawBg() {
      // Animated chart-grid background
      ctx.fillStyle = '#06050e'
      ctx.fillRect(0, 0, W, H)
      ctx.strokeStyle = 'rgba(200,255,0,0.06)'
      ctx.lineWidth = 1
      const offset = (frameCount * 1.5) % 40
      for (let x = -offset; x < W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }
      // Wavy chart line in bg
      ctx.strokeStyle = 'rgba(153,69,255,0.25)'
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let x = 0; x < W; x += 8) {
        const y = H / 2 + Math.sin((x + frameCount * 2) * 0.02) * 60 + Math.cos((x + frameCount) * 0.01) * 30
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    function drawCandles() {
      const w = 64
      const minGap = 140
      for (const c of state.candles) {
        const color = c.bullish ? '#c8ff00' : '#ff3a5e'
        ctx.fillStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = 12
        // Top candle
        ctx.fillRect(c.x, 0, w, c.gapY)
        // Bottom candle
        ctx.fillRect(c.x, c.gapY + minGap, w, H - c.gapY - minGap)
        ctx.shadowBlur = 0
        // Wick details
        ctx.fillStyle = 'rgba(0,0,0,0.4)'
        ctx.fillRect(c.x + w / 2 - 3, 0, 6, c.gapY)
        ctx.fillRect(c.x + w / 2 - 3, c.gapY + minGap, 6, H - c.gapY - minGap)
      }
    }

    function drawSloth() {
      // Cycle through 8 frames at slow rate, except boost frames during flap
      const frameIdx = state.flapPhase > 0
        ? (state.flapPhase % SHEET_FRAMES)
        : Math.floor(frameCount / 6) % SHEET_FRAMES
      const targetH = 80
      const aspect = FRAME_W / FRAME_H
      const targetW = targetH * aspect
      const sx = frameIdx * FRAME_W
      const tilt = Math.max(-0.4, Math.min(0.6, state.vy * 0.05))
      ctx.save()
      ctx.translate(120, state.y)
      ctx.rotate(tilt)
      if (sloth.complete && sloth.naturalWidth > 0) {
        ctx.drawImage(sloth, sx, 0, FRAME_W, FRAME_H, -targetW / 2, -targetH / 2, targetW, targetH)
      } else {
        ctx.fillStyle = '#9945ff'
        ctx.beginPath()
        ctx.arc(0, 0, 24, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

    function update() {
      frameCount++
      if (state.started && state.alive) {
        state.vy += 0.4
        state.y += state.vy
        if (state.flapPhase > 0) state.flapPhase--

        // spawn
        if (state.candles.length === 0 || state.candles[state.candles.length - 1].x < W - 220) {
          spawn()
        }
        // move
        for (const c of state.candles) c.x -= 3.2

        // collisions + score
        const minGap = 140
        const slothR = 28
        for (const c of state.candles) {
          if (c.x < 120 + slothR && c.x + 64 > 120 - slothR) {
            if (state.y - slothR < c.gapY || state.y + slothR > c.gapY + minGap) {
              state.alive = false
            }
          }
          if (!c.passed && c.x + 64 < 120 - slothR) {
            c.passed = true
            state.score++
          }
        }
        // remove offscreen
        state.candles = state.candles.filter(c => c.x > -80)
        // floor / ceiling
        if (state.y > H - slothR || state.y < slothR) state.alive = false
      }

      drawBg()
      drawCandles()
      drawSloth()

      // HUD
      ctx.fillStyle = '#c8ff00'
      ctx.font = "bold 32px 'Bebas Neue', sans-serif"
      ctx.textAlign = 'center'
      ctx.fillText(String(state.score), W / 2, 50)

      if (!state.started) {
        ctx.fillStyle = 'rgba(232,230,240,0.85)'
        ctx.font = "20px 'Space Grotesk', sans-serif"
        ctx.fillText('TAP / SPACE TO FLAP', W / 2, H / 2 - 60)
      }

      if (!state.alive) {
        cancelAnimationFrame(raf)
        setRunning(false)
        setOver(true)
        const finalScore = state.score
        setScore(finalScore)
        const prev = Number(localStorage.getItem('phuck_best_chart') || '0')
        if (finalScore > prev) {
          localStorage.setItem('phuck_best_chart', String(finalScore))
          setBest(finalScore)
        }
        return
      }
      raf = requestAnimationFrame(update)
    }

    function onKey(e: KeyboardEvent) { if (e.code === 'Space' || e.key === 'ArrowUp') { e.preventDefault(); flap() } }
    function onTouch(e: TouchEvent) { e.preventDefault(); flap() }
    function onClick() { flap() }

    if (running) {
      reset()
      window.addEventListener('keydown', onKey)
      canvas.addEventListener('touchstart', onTouch, { passive: false })
      canvas.addEventListener('mousedown', onClick)
      raf = requestAnimationFrame(update)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      canvas.removeEventListener('touchstart', onTouch)
      canvas.removeEventListener('mousedown', onClick)
    }
  }, [running])

  async function handleSubmit() {
    if (submitted || score === 0) return
    await submitScore(GAME, name || 'anon', score)
    setSubmitted(true)
    setBoard(await getTop(GAME, 10))
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        :root{--accent:#c8ff00;--purple:#9945ff;--bg:#06050e;--card:rgba(255,255,255,0.03);--border:rgba(255,255,255,0.08);--text:#e8e6f0;--muted:rgba(232,230,240,0.55);}
        body{background:var(--bg)!important;color:var(--text);font-family:'Space Grotesk',sans-serif;margin:0;}
        .h-bebas{font-family:'Bebas Neue',sans-serif;letter-spacing:.05em;}
        .btn{padding:10px 22px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--text);font-weight:600;cursor:pointer;font-size:.9rem;transition:all .15s;}
        .btn:hover{background:rgba(255,255,255,0.08);}
        .btn-accent{background:var(--accent);color:#000;border-color:var(--accent);}
        .btn-accent:hover{filter:brightness(1.1);}
        canvas{display:block;width:100%;max-width:600px;height:auto;border:1px solid var(--border);border-radius:16px;background:#06050e;touch-action:none;}
      `}</style>
      <main style={{minHeight:'100vh',padding:'1.5rem 1rem',maxWidth:760,margin:'0 auto'}}>
        <Link href="/play" style={{color:'var(--muted)',textDecoration:'none',fontSize:'.85rem'}}>← back to arcade</Link>
        <h1 className="h-bebas" style={{fontSize:'2.5rem',margin:'.5rem 0 .25rem'}}>PHUCK THE <span style={{color:'var(--accent)'}}>CHART</span></h1>
        <p style={{color:'var(--muted)',margin:'0 0 1rem',fontSize:'.95rem'}}>Tap or hit space to flap. Dodge the candles. Don&apos;t paper hand the floor.</p>

        <div style={{display:'flex',justifyContent:'center',position:'relative'}}>
          <canvas ref={canvasRef} width={600} height={500} />
          {!running && !over && (
            <button onClick={() => { setOver(false); setSubmitted(false); setRunning(true) }}
              className="btn btn-accent h-bebas"
              style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:'1.3rem',padding:'14px 32px'}}>
              ▶ START
            </button>
          )}
          {over && (
            <div style={{position:'absolute',inset:0,background:'rgba(6,5,14,0.92)',borderRadius:16,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'1.5rem'}}>
              <h2 className="h-bebas" style={{margin:0,fontSize:'2.2rem',color:'var(--accent)'}}>RUGGED</h2>
              <p style={{margin:'.25rem 0 0',fontSize:'1.6rem'}}>Score: <b>{score}</b></p>
              <p style={{margin:0,color:'var(--muted)',fontSize:'.85rem'}}>Best: {best}</p>
              {!submitted && score > 0 && (
                <div style={{display:'flex',gap:8,marginTop:'1rem'}}>
                  <input value={name} onChange={e=>setName(e.target.value)} maxLength={16} placeholder="your tag"
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'rgba(0,0,0,.3)',color:'var(--text)'}}/>
                  <button onClick={handleSubmit} className="btn btn-accent">Submit</button>
                </div>
              )}
              <button onClick={() => { setOver(false); setSubmitted(false); setRunning(true) }} className="btn btn-accent h-bebas" style={{marginTop:'1rem',fontSize:'1.1rem'}}>
                ▶ Again
              </button>
            </div>
          )}
        </div>

        <section style={{marginTop:'2rem',background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:'1.25rem'}}>
          <h3 className="h-bebas" style={{margin:0,fontSize:'1.4rem'}}>
            LEADERBOARD <span style={{fontSize:'.7rem',color:'var(--muted)'}}>{isGlobal()?'GLOBAL':'LOCAL'}</span>
          </h3>
          <ol style={{margin:'.75rem 0 0',padding:0,listStyle:'none'}}>
            {board.length === 0 && <li style={{color:'var(--muted)'}}>No scores yet. Be the first.</li>}
            {board.map((r, i) => (
              <li key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--border)',fontSize:'.9rem'}}>
                <span><b style={{color:'var(--accent)',marginRight:8}}>#{i+1}</b>{r.name}</span>
                <span>{r.score}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  )
}
