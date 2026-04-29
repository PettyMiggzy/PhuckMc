'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { getTop, submitScore, isGlobal, type ScoreRow } from '@/lib/leaderboard'

// diamond-hands.png = 624x385, 2x2 grid
const COLS = 2, ROWS = 2, SHEET_W = 624, SHEET_H = 385
const FRAME_W = SHEET_W / COLS
const FRAME_H = SHEET_H / ROWS
const GAME = 'diamond'

export default function DiamondGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [running, setRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [over, setOver] = useState(false)
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [board, setBoard] = useState<ScoreRow[]>([])

  useEffect(() => { (async () => setBoard(await getTop(GAME, 10)))() }, [])
  useEffect(() => { setBest(Number(localStorage.getItem('phuck_best_diamond')||'0')) }, [])

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height

    const sloth = new Image()
    sloth.src = '/sprites/diamond-hands.png'

    let raf = 0, frameCount = 0

    type PaperHand = { x: number; y: number; vx: number; vy: number; angle: number; angVel: number; alive: boolean }

    const state = {
      hands: [] as PaperHand[],
      score: 0,
      hp: 100,
      shake: 0,
      panicLevel: 1,
      alive: true,
      started: false,
      pressing: false,
      candles: [] as { x: number; v: number; bull: boolean }[],
    }

    function reset() {
      state.hands = []
      state.score = 0
      state.hp = 100
      state.shake = 0
      state.panicLevel = 1
      state.alive = true
      state.started = false
      state.pressing = false
      state.candles = []
      for (let i = 0; i < 12; i++) {
        state.candles.push({ x: i * 50 + 20, v: 50 + Math.random() * 50, bull: Math.random() > 0.4 })
      }
    }

    function tap(cx: number, cy: number) {
      // hit a paper hand
      for (const h of state.hands) {
        if (!h.alive) continue
        const d = Math.hypot(h.x - cx, h.y - cy)
        if (d < 40) {
          h.alive = false
          state.score += 5
          state.hp = Math.min(100, state.hp + 2)
        }
      }
    }

    function spawnHand() {
      const side = Math.floor(Math.random() * 4)
      let x = 0, y = 0
      if (side === 0) { x = Math.random() * W; y = -30 }
      if (side === 1) { x = W + 30; y = Math.random() * H }
      if (side === 2) { x = Math.random() * W; y = H + 30 }
      if (side === 3) { x = -30; y = Math.random() * H }
      const dx = W/2 - x, dy = H/2 - y
      const len = Math.hypot(dx, dy)
      const speed = 1 + state.panicLevel * 0.4
      state.hands.push({
        x, y,
        vx: (dx/len) * speed,
        vy: (dy/len) * speed,
        angle: Math.random() * Math.PI * 2,
        angVel: (Math.random() - 0.5) * 0.1,
        alive: true,
      })
    }

    function drawBg() {
      ctx.fillStyle = '#06050e'
      ctx.fillRect(0, 0, W, H)
      // Chart in bg dropping in panic mode
      ctx.strokeStyle = state.panicLevel > 2 ? 'rgba(255,58,94,0.4)' : 'rgba(200,255,0,0.2)'
      ctx.lineWidth = 2
      ctx.beginPath()
      for (const c of state.candles) {
        const x = c.x
        const y = H - 40 - c.v
        ctx.lineTo(x, y)
      }
      ctx.stroke()
      // Candles
      for (const c of state.candles) {
        const x = c.x
        const top = H - 40 - c.v
        ctx.fillStyle = c.bull ? '#c8ff00' : '#ff3a5e'
        ctx.fillRect(x - 8, top, 16, c.v)
      }
      // Vignette pulse on panic
      if (state.panicLevel > 1) {
        const alpha = 0.1 + Math.sin(frameCount * 0.1) * 0.05 * state.panicLevel
        ctx.fillStyle = `rgba(255,58,94,${alpha})`
        ctx.fillRect(0, 0, W, H)
      }
    }

    function drawSloth() {
      const fIdx = Math.floor(frameCount / 30) % 4
      const col = fIdx % COLS
      const row = Math.floor(fIdx / COLS)
      const targetH = 220
      const targetW = targetH * (FRAME_W / FRAME_H)
      ctx.save()
      ctx.translate(W/2, H/2 + 40)
      // pulsing scale on press
      const pulse = state.pressing ? 1.05 + Math.sin(frameCount*0.3) * 0.03 : 1
      ctx.scale(pulse, pulse)
      if (sloth.complete && sloth.naturalWidth > 0) {
        ctx.drawImage(sloth, col * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H, -targetW/2, -targetH/2, targetW, targetH)
      } else {
        ctx.fillStyle = '#9945ff'
        ctx.fillRect(-50, -100, 100, 200)
      }
      ctx.restore()
    }

    function drawHands() {
      for (const h of state.hands) {
        if (!h.alive) continue
        ctx.save()
        ctx.translate(h.x, h.y)
        ctx.rotate(h.angle)
        // Paper hand emoji-ish
        ctx.fillStyle = '#fff'
        ctx.shadowColor = '#fff'
        ctx.shadowBlur = 10
        ctx.font = "bold 36px sans-serif"
        ctx.textAlign = 'center'
        ctx.fillText('🧻', 0, 12)
        ctx.shadowBlur = 0
        ctx.restore()
      }
    }

    function drawHUD() {
      // HP bar
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(20, 20, 200, 14)
      ctx.fillStyle = state.hp > 40 ? '#c8ff00' : '#ff3a5e'
      ctx.fillRect(22, 22, (196 * state.hp/100), 10)
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.strokeRect(20, 20, 200, 14)
      ctx.fillStyle = '#fff'
      ctx.font = "bold 11px 'Bebas Neue', sans-serif"
      ctx.textAlign = 'left'
      ctx.fillText(`CONVICTION ${Math.round(state.hp)}%`, 22, 32)
      // Score
      ctx.font = "bold 32px 'Bebas Neue', sans-serif"
      ctx.fillStyle = '#c8ff00'
      ctx.textAlign = 'right'
      ctx.fillText(String(state.score), W - 20, 40)
      ctx.font = "10px 'Space Grotesk', sans-serif"
      ctx.fillStyle = 'rgba(232,230,240,0.5)'
      ctx.fillText('HOLDING SECONDS', W - 20, 54)
    }

    function update() {
      frameCount++
      ctx.save()
      if (state.started && state.alive) {
        // Score = time held + tap bonuses
        if (frameCount % 15 === 0 && state.pressing) state.score += 1
        // Conviction drains over time, faster in panic, regen if pressing
        const drainRate = 0.04 + state.panicLevel * 0.04
        if (!state.pressing) state.hp -= drainRate * 2
        else state.hp -= drainRate * 0.4
        state.hp = Math.max(0, Math.min(100, state.hp))
        if (state.hp <= 0) state.alive = false

        // Increase panic with time
        state.panicLevel = 1 + Math.floor(state.score / 30)
        // Spawn hands
        const spawnRate = 0.015 + state.panicLevel * 0.008
        if (Math.random() < spawnRate) spawnHand()
        // move hands
        for (const h of state.hands) {
          if (!h.alive) continue
          h.x += h.vx; h.y += h.vy; h.angle += h.angVel
          // damage if reach center
          if (Math.hypot(h.x - W/2, h.y - H/2 - 40) < 70) {
            h.alive = false
            state.hp -= 8
          }
        }
        state.hands = state.hands.filter(h => h.alive && h.x > -60 && h.x < W + 60 && h.y > -60 && h.y < H + 60)

        // chart panics: dump candles down
        for (const c of state.candles) {
          if (state.panicLevel > 1 && Math.random() < 0.005 * state.panicLevel) {
            c.bull = false
            c.v = Math.max(20, c.v - 3)
          }
        }

        // Screen shake during panic
        state.shake = state.panicLevel * 1.5
      }

      const dx = (Math.random() - 0.5) * state.shake
      const dy = (Math.random() - 0.5) * state.shake
      ctx.translate(dx, dy)

      drawBg()
      drawSloth()
      drawHands()
      ctx.restore()
      drawHUD()

      if (!state.started) {
        ctx.fillStyle = 'rgba(232,230,240,0.85)'
        ctx.font = "20px 'Space Grotesk', sans-serif"
        ctx.textAlign = 'center'
        ctx.fillText('HOLD MOUSE / FINGER = HODL', W/2, H/2 - 130)
        ctx.fillText('TAP paper hands 🧻 before they reach you', W/2, H/2 - 100)
      }

      if (!state.alive) {
        cancelAnimationFrame(raf)
        setRunning(false)
        setOver(true)
        setScore(state.score)
        const prev = Number(localStorage.getItem('phuck_best_diamond') || '0')
        if (state.score > prev) {
          localStorage.setItem('phuck_best_diamond', String(state.score))
          setBest(state.score)
        }
        return
      }
      raf = requestAnimationFrame(update)
    }

    function getCoords(e: MouseEvent | TouchEvent) {
      const rect = canvas.getBoundingClientRect()
      const t = 'touches' in e ? e.touches[0] || (e as TouchEvent).changedTouches[0] : e
      const sx = canvas.width / rect.width
      const sy = canvas.height / rect.height
      return { x: (t.clientX - rect.left) * sx, y: (t.clientY - rect.top) * sy }
    }
    function onDown(e: MouseEvent | TouchEvent) {
      e.preventDefault()
      state.started = true
      state.pressing = true
      const c = getCoords(e); tap(c.x, c.y)
    }
    function onMove(e: MouseEvent | TouchEvent) {
      if (!state.pressing) return
      e.preventDefault()
      const c = getCoords(e); tap(c.x, c.y)
    }
    function onUp(e: MouseEvent | TouchEvent) { e.preventDefault(); state.pressing = false }

    if (running) {
      reset()
      canvas.addEventListener('mousedown', onDown)
      canvas.addEventListener('mousemove', onMove)
      canvas.addEventListener('mouseup', onUp)
      canvas.addEventListener('mouseleave', onUp)
      canvas.addEventListener('touchstart', onDown, { passive: false })
      canvas.addEventListener('touchmove', onMove, { passive: false })
      canvas.addEventListener('touchend', onUp, { passive: false })
      raf = requestAnimationFrame(update)
    }

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('mousedown', onDown)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseup', onUp)
      canvas.removeEventListener('mouseleave', onUp)
      canvas.removeEventListener('touchstart', onDown)
      canvas.removeEventListener('touchmove', onMove)
      canvas.removeEventListener('touchend', onUp)
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
        canvas{display:block;width:100%;max-width:600px;height:auto;border:1px solid var(--border);border-radius:16px;background:#06050e;touch-action:none;cursor:grab;}
        canvas:active{cursor:grabbing;}
      `}</style>
      <main style={{minHeight:'100vh',padding:'1.5rem 1rem',maxWidth:760,margin:'0 auto'}}>
        <Link href="/play" style={{color:'var(--muted)',textDecoration:'none',fontSize:'.85rem'}}>← back to arcade</Link>
        <h1 className="h-bebas" style={{fontSize:'2.5rem',margin:'.5rem 0 .25rem'}}>DIAMOND <span style={{color:'var(--purple)'}}>HANDS</span></h1>
        <p style={{color:'var(--muted)',margin:'0 0 1rem',fontSize:'.95rem'}}>Hold your finger down to HODL. Tap paper hands 🧻 to swat them. Conviction drains over time.</p>

        <div style={{display:'flex',justifyContent:'center',position:'relative'}}>
          <canvas ref={canvasRef} width={600} height={500} />
          {!running && !over && (
            <button onClick={() => setRunning(true)}
              className="btn btn-accent h-bebas"
              style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:'1.3rem',padding:'14px 32px'}}>▶ START</button>
          )}
          {over && (
            <div style={{position:'absolute',inset:0,background:'rgba(6,5,14,0.92)',borderRadius:16,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'1.5rem'}}>
              <h2 className="h-bebas" style={{margin:0,fontSize:'2.2rem',color:'#ff3a5e'}}>PAPER HANDED</h2>
              <p style={{margin:'.25rem 0 0',fontSize:'1.4rem'}}>Score: <b>{score}</b></p>
              <p style={{margin:0,color:'var(--muted)',fontSize:'.85rem'}}>Best: {best}</p>
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
                <span><b style={{color:'var(--purple)',marginRight:8}}>#{i+1}</b>{r.name}</span>
                <span>{r.score}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  )
}
