'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { getTop, submitScore, isGlobal, type ScoreRow } from '@/lib/leaderboard'

// jump-fly.png = 552x360, 3 cols x 2 rows = 6 frames
// Frames: 0=takeoff, 1=ascending, 2=apex/fly, 3=descending, 4=pre-landing, 5=land
const COLS = 3, ROWS = 2, SHEET_W = 552, SHEET_H = 360
const FRAME_W = SHEET_W / COLS
const FRAME_H = SHEET_H / ROWS
const GAME = 'moon'

export default function MoonGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [running, setRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [over, setOver] = useState(false)
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [board, setBoard] = useState<ScoreRow[]>([])

  useEffect(() => { (async () => setBoard(await getTop(GAME, 10)))() }, [])
  useEffect(() => { setBest(Number(localStorage.getItem('phuck_best_moon')||'0')) }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height

    const sloth = new Image()
    sloth.src = '/sprites/jump-fly.png'

    let raf = 0, frameCount = 0

    type Platform = { x: number; y: number; w: number; type: 'green' | 'red' }
    const state = {
      x: W/2, y: H - 100, vx: 0, vy: 0,
      platforms: [] as Platform[],
      score: 0,
      maxHeight: 0,
      alive: true,
      started: false,
      facing: 1,
    }

    function reset() {
      state.x = W/2; state.y = H - 100; state.vx = 0; state.vy = 0
      state.platforms = []
      state.score = 0; state.maxHeight = 0
      state.alive = true; state.started = false; state.facing = 1
      // Initial platforms
      for (let i = 0; i < 8; i++) {
        state.platforms.push({
          x: Math.random() * (W - 80) + 40,
          y: H - 60 - i * 80,
          w: 80,
          type: i === 0 ? 'green' : (Math.random() < 0.15 ? 'red' : 'green'),
        })
      }
    }

    function jumpStart() { state.started = true }

    function move(dir: number) { state.vx = dir * 5 }

    function drawBg() {
      // gradient: ground → space
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, '#0a0418')
      grad.addColorStop(1, '#06050e')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
      // stars (parallax)
      ctx.fillStyle = '#fff'
      for (let i = 0; i < 30; i++) {
        const x = (i * 73 + frameCount * 0.3) % W
        const y = (i * 41 + state.maxHeight * 0.2) % H
        const size = (i % 3) === 0 ? 2 : 1
        ctx.globalAlpha = 0.3 + (i % 5) * 0.1
        ctx.fillRect(x, y, size, size)
      }
      ctx.globalAlpha = 1
      // moon at high altitude
      if (state.maxHeight > 1000) {
        const moonY = Math.max(60, 200 - (state.maxHeight - 1000) * 0.05)
        ctx.fillStyle = '#fffce8'
        ctx.shadowColor = '#fffce8'
        ctx.shadowBlur = 20
        ctx.beginPath(); ctx.arc(W - 80, moonY, 40, 0, Math.PI*2); ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    function drawPlatforms() {
      for (const p of state.platforms) {
        const color = p.type === 'green' ? '#c8ff00' : '#ff3a5e'
        ctx.fillStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = 8
        ctx.fillRect(p.x, p.y, p.w, 12)
        ctx.shadowBlur = 0
        // candle wick
        ctx.fillStyle = 'rgba(0,0,0,0.4)'
        ctx.fillRect(p.x + p.w/2 - 1, p.y - 4, 2, 4)
        ctx.fillRect(p.x + p.w/2 - 1, p.y + 12, 2, 4)
      }
    }

    function drawSloth() {
      let frameIdx: number
      if (state.vy < -8) frameIdx = 0          // takeoff
      else if (state.vy < -3) frameIdx = 1     // ascending
      else if (state.vy < 1) frameIdx = 2      // apex
      else if (state.vy < 5) frameIdx = 3      // descending
      else if (state.vy < 10) frameIdx = 4     // pre-landing
      else frameIdx = 5                          // land/squash
      const col = frameIdx % COLS
      const row = Math.floor(frameIdx / COLS)
      const sx = col * FRAME_W, sy = row * FRAME_H
      const targetH = 80
      const targetW = targetH * (FRAME_W / FRAME_H)
      ctx.save()
      ctx.translate(state.x, state.y)
      if (state.facing < 0) ctx.scale(-1, 1)
      if (sloth.complete && sloth.naturalWidth > 0) {
        ctx.drawImage(sloth, sx, sy, FRAME_W, FRAME_H, -targetW/2, -targetH, targetW, targetH)
      } else {
        ctx.fillStyle = '#9945ff'
        ctx.fillRect(-25, -targetH, 50, targetH)
      }
      ctx.restore()
    }

    function drawHUD() {
      ctx.fillStyle = '#c8ff00'
      ctx.font = "bold 32px 'Bebas Neue', sans-serif"
      ctx.textAlign = 'left'
      ctx.fillText(`${state.score}m`, 20, 40)
      // Altitude marker right side
      ctx.font = "12px 'Space Grotesk', sans-serif"
      ctx.textAlign = 'right'
      ctx.fillStyle = 'var(--muted)'
      ctx.fillStyle = 'rgba(232,230,240,0.5)'
      ctx.fillText(state.maxHeight > 2000 ? 'STRATOSPHERE' : state.maxHeight > 1000 ? 'EXOSPHERE' : 'TROPOSPHERE', W - 20, 30)
    }

    function update() {
      frameCount++
      if (state.started && state.alive) {
        // physics
        state.vy += 0.4
        state.x += state.vx
        state.y += state.vy
        if (state.vx !== 0) state.facing = state.vx > 0 ? 1 : -1
        // wrap horizontal
        if (state.x < -20) state.x = W + 20
        if (state.x > W + 20) state.x = -20

        // platform collision (only when falling)
        if (state.vy > 0) {
          for (const p of state.platforms) {
            if (state.x > p.x - 5 && state.x < p.x + p.w + 5 &&
                state.y > p.y && state.y < p.y + 16 + state.vy) {
              if (p.type === 'green') {
                state.vy = -13
              } else {
                state.alive = false  // red = dump
              }
            }
          }
        }

        // scroll up when sloth above mid
        const midY = H * 0.4
        if (state.y < midY) {
          const dy = midY - state.y
          state.y = midY
          state.maxHeight += dy
          for (const p of state.platforms) p.y += dy
          state.score = Math.floor(state.maxHeight / 10)
        }
        // remove off-screen, spawn new
        state.platforms = state.platforms.filter(p => p.y < H + 20)
        while (state.platforms.length < 10) {
          const topY = Math.min(...state.platforms.map(p => p.y))
          state.platforms.push({
            x: Math.random() * (W - 80) + 40,
            y: topY - 60 - Math.random() * 60,
            w: 80,
            type: Math.random() < (0.1 + Math.min(0.2, state.maxHeight/8000)) ? 'red' : 'green',
          })
        }
        // fell
        if (state.y > H + 60) state.alive = false
      }

      drawBg()
      drawPlatforms()
      drawSloth()
      drawHUD()

      if (!state.started) {
        ctx.fillStyle = 'rgba(232,230,240,0.85)'
        ctx.font = "20px 'Space Grotesk', sans-serif"
        ctx.textAlign = 'center'
        ctx.fillText('← → MOVE', W/2, 100)
        ctx.fillText('Bounce on green. Avoid red.', W/2, 130)
      }

      if (!state.alive) {
        cancelAnimationFrame(raf)
        setRunning(false)
        setOver(true)
        setScore(state.score)
        const prev = Number(localStorage.getItem('phuck_best_moon') || '0')
        if (state.score > prev) {
          localStorage.setItem('phuck_best_moon', String(state.score))
          setBest(state.score)
        }
        return
      }
      raf = requestAnimationFrame(update)
    }

    let leftHeld = false, rightHeld = false
    function update2() { state.vx = (rightHeld ? 5 : 0) - (leftHeld ? 5 : 0) }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' || e.key === 'a') { leftHeld = true; update2(); jumpStart() }
      if (e.key === 'ArrowRight' || e.key === 'd') { rightHeld = true; update2(); jumpStart() }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' || e.key === 'a') { leftHeld = false; update2() }
      if (e.key === 'ArrowRight' || e.key === 'd') { rightHeld = false; update2() }
    }
    function onTouch(e: TouchEvent) {
      e.preventDefault()
      jumpStart()
      const rect = canvas.getBoundingClientRect()
      const x = e.touches[0].clientX - rect.left
      const cx = rect.width / 2
      if (x < cx) move(-1); else move(1)
    }
    function onTouchEnd(e: TouchEvent) { e.preventDefault(); state.vx = 0 }

    if (running) {
      reset()
      window.addEventListener('keydown', onKey)
      window.addEventListener('keyup', onKeyUp)
      canvas.addEventListener('touchstart', onTouch, { passive: false })
      canvas.addEventListener('touchend', onTouchEnd, { passive: false })
      raf = requestAnimationFrame(update)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKeyUp)
      canvas.removeEventListener('touchstart', onTouch)
      canvas.removeEventListener('touchend', onTouchEnd)
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
        .btn{padding:10px 22px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--text);font-weight:600;cursor:pointer;}
        .btn-accent{background:var(--accent);color:#000;border-color:var(--accent);}
        canvas{display:block;width:100%;max-width:480px;height:auto;border:1px solid var(--border);border-radius:16px;background:#06050e;touch-action:none;}
      `}</style>
      <main style={{minHeight:'100vh',padding:'1.5rem 1rem',maxWidth:560,margin:'0 auto'}}>
        <Link href="/play" style={{color:'var(--muted)',textDecoration:'none',fontSize:'.85rem'}}>← back to arcade</Link>
        <h1 className="h-bebas" style={{fontSize:'2.5rem',margin:'.5rem 0 .25rem'}}>MOON <span style={{color:'var(--accent)'}}>MISSION</span></h1>
        <p style={{color:'var(--muted)',margin:'0 0 1rem',fontSize:'.95rem'}}>Bounce up green candles to the moon. Red candles dump you.</p>

        <div style={{display:'flex',justifyContent:'center',position:'relative'}}>
          <canvas ref={canvasRef} width={480} height={640} />
          {!running && !over && (
            <button onClick={() => setRunning(true)}
              className="btn btn-accent h-bebas"
              style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:'1.3rem',padding:'14px 32px'}}>▶ START</button>
          )}
          {over && (
            <div style={{position:'absolute',inset:0,background:'rgba(6,5,14,0.92)',borderRadius:16,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'1.5rem'}}>
              <h2 className="h-bebas" style={{margin:0,fontSize:'2.2rem',color:'#ff3a5e'}}>SPLATTED</h2>
              <p style={{margin:'.25rem 0 0',fontSize:'1.4rem'}}>Altitude: <b>{score}m</b></p>
              <p style={{margin:0,color:'var(--muted)',fontSize:'.85rem'}}>Best: {best}m</p>
              {!submitted && score > 0 && (
                <div style={{display:'flex',gap:8,marginTop:'1rem'}}>
                  <input value={name} onChange={e=>setName(e.target.value)} maxLength={16} placeholder="your tag"
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'rgba(0,0,0,.3)',color:'var(--text)'}}/>
                  <button onClick={handleSubmit} className="btn btn-accent">Submit</button>
                </div>
              )}
              <button onClick={() => { setOver(false); setSubmitted(false); setRunning(true) }} className="btn btn-accent h-bebas" style={{marginTop:'1rem'}}>▶ Again</button>
            </div>
          )}
        </div>

        <section style={{marginTop:'2rem',background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:'1.25rem'}}>
          <h3 className="h-bebas" style={{margin:0,fontSize:'1.4rem'}}>LEADERBOARD <span style={{fontSize:'.7rem',color:'var(--muted)'}}>{isGlobal()?'GLOBAL':'LOCAL'}</span></h3>
          <ol style={{margin:'.75rem 0 0',padding:0,listStyle:'none'}}>
            {board.length === 0 && <li style={{color:'var(--muted)'}}>No scores yet.</li>}
            {board.map((r, i) => (
              <li key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--border)',fontSize:'.9rem'}}>
                <span><b style={{color:'var(--accent)',marginRight:8}}>#{i+1}</b>{r.name}</span>
                <span>{r.score}m</span>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  )
}
