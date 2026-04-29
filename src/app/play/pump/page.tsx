'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { getTop, submitScore, isGlobal, type ScoreRow } from '@/lib/leaderboard'

const GAME = 'pump'
const COLS = 3, ROWS = 3

type Cell = { type: 'pump' | 'dump' | null; until: number; born: number }

export default function PumpGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [running, setRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [over, setOver] = useState(false)
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [board, setBoard] = useState<ScoreRow[]>([])

  useEffect(() => { (async () => setBoard(await getTop(GAME, 10)))() }, [])
  useEffect(() => { setBest(Number(localStorage.getItem('phuck_best_pump')||'0')) }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height
    const padding = 20
    const cellW = (W - padding * 2) / COLS
    const cellH = (H - padding * 2 - 60) / ROWS  // 60 reserved for HUD

    const pumpImg = new Image(); pumpImg.src = '/sprites/sloth-pump.png'
    const dumpImg = new Image(); dumpImg.src = '/sprites/sloth-angry.png'

    let raf = 0, frameCount = 0, startTime = 0

    const cells: Cell[] = Array.from({ length: COLS * ROWS }, () => ({ type: null, until: 0, born: 0 }))
    const state = {
      score: 0,
      lives: 3,
      combo: 0,
      lastTapTime: 0,
      alive: true,
      started: false,
      msg: '',
      msgUntil: 0,
    }

    function reset() {
      state.score = 0; state.lives = 3; state.combo = 0
      state.alive = true; state.started = false
      state.msg = ''; state.msgUntil = 0
      cells.forEach(c => { c.type = null; c.until = 0 })
      startTime = performance.now()
    }

    function spawn(now: number) {
      const empty = cells.map((c, i) => c.type === null ? i : -1).filter(i => i >= 0)
      if (empty.length === 0) return
      const idx = empty[Math.floor(Math.random() * empty.length)]
      const elapsed = (now - startTime) / 1000
      const speedFactor = 1 + Math.min(2, elapsed / 30)
      const lifetime = (1400 - Math.min(800, elapsed * 25)) / speedFactor
      // proportion of dumps grows over time
      const dumpChance = 0.25 + Math.min(0.35, elapsed / 60)
      cells[idx] = {
        type: Math.random() < dumpChance ? 'dump' : 'pump',
        until: now + lifetime,
        born: now,
      }
    }

    function indexAt(x: number, y: number): number {
      if (y < padding + 60) return -1
      const col = Math.floor((x - padding) / cellW)
      const row = Math.floor((y - padding - 60) / cellH)
      if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return -1
      return row * COLS + col
    }

    function tap(x: number, y: number) {
      const idx = indexAt(x, y)
      if (idx < 0) return
      const c = cells[idx]
      if (!c.type) return
      const now = performance.now()
      if (c.type === 'pump') {
        const reactionMs = now - c.born
        const bonus = Math.max(0, Math.floor(20 - reactionMs / 50))
        state.combo++
        const points = 10 + bonus + Math.floor(state.combo / 3) * 5
        state.score += points
        state.msg = state.combo >= 3 ? `+${points} ×${state.combo}` : `+${points}`
        state.msgUntil = now + 500
      } else {
        state.lives--
        state.combo = 0
        state.msg = '−1 LIFE'
        state.msgUntil = now + 700
        if (state.lives <= 0) state.alive = false
      }
      cells[idx] = { type: null, until: 0, born: 0 }
    }

    function drawBg() {
      ctx.fillStyle = '#06050e'
      ctx.fillRect(0, 0, W, H)
    }

    function drawCell(i: number, c: Cell, now: number) {
      const col = i % COLS
      const row = Math.floor(i / COLS)
      const x = padding + col * cellW
      const y = padding + 60 + row * cellH
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.strokeRect(x + 4, y + 4, cellW - 8, cellH - 8)
      if (!c.type) return
      const remaining = (c.until - now) / (c.until - c.born)
      const scale = remaining < 0.3 ? 0.85 + Math.sin(now * 0.02) * 0.05 : 1
      const img = c.type === 'pump' ? pumpImg : dumpImg
      const targetH = (cellH - 16) * scale
      const aspect = img.naturalWidth ? img.naturalWidth / img.naturalHeight : 1.5
      const targetW = Math.min(cellW - 16, targetH * aspect)
      const cx = x + cellW / 2, cy = y + cellH / 2
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, cx - targetW/2, cy - targetH/2, targetW, targetH)
      } else {
        ctx.fillStyle = c.type === 'pump' ? '#c8ff00' : '#ff3a5e'
        ctx.fillRect(cx - 30, cy - 30, 60, 60)
      }
      // urgency ring
      ctx.strokeStyle = c.type === 'pump' ? '#c8ff00' : '#ff3a5e'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(cx, cy, Math.min(cellW, cellH) / 2 - 10, -Math.PI/2, -Math.PI/2 + Math.PI*2*remaining)
      ctx.stroke()
    }

    function drawHUD(now: number) {
      ctx.fillStyle = '#c8ff00'
      ctx.font = "bold 30px 'Bebas Neue', sans-serif"
      ctx.textAlign = 'left'
      ctx.fillText(String(state.score), 20, 42)
      ctx.font = "12px 'Space Grotesk', sans-serif"
      ctx.fillStyle = 'rgba(232,230,240,0.5)'
      ctx.fillText('SCORE', 20, 56)
      // Lives
      ctx.font = "20px 'Bebas Neue', sans-serif"
      ctx.fillStyle = '#ff3a5e'
      ctx.textAlign = 'right'
      ctx.fillText('❤'.repeat(state.lives) + '·'.repeat(3 - state.lives), W - 20, 42)
      // Combo
      if (state.combo >= 3) {
        ctx.fillStyle = '#c8ff00'
        ctx.font = "bold 18px 'Bebas Neue', sans-serif"
        ctx.textAlign = 'center'
        ctx.fillText(`COMBO ×${state.combo}`, W/2, 42)
      }
      // Message
      if (state.msg && now < state.msgUntil) {
        ctx.fillStyle = state.msg.startsWith('-') || state.msg.startsWith('−') ? '#ff3a5e' : '#c8ff00'
        ctx.font = "bold 22px 'Bebas Neue', sans-serif"
        ctx.textAlign = 'center'
        ctx.fillText(state.msg, W/2, H/2)
      }
    }

    function update() {
      const now = performance.now()
      frameCount++
      drawBg()
      if (state.started && state.alive) {
        // expire old
        for (let i = 0; i < cells.length; i++) {
          if (cells[i].type && cells[i].until < now) {
            // pump expired = combo reset, no penalty
            if (cells[i].type === 'pump') state.combo = 0
            cells[i] = { type: null, until: 0, born: 0 }
          }
        }
        // spawn
        const elapsed = (now - startTime) / 1000
        const spawnChance = 0.025 + Math.min(0.04, elapsed / 100)
        if (Math.random() < spawnChance) spawn(now)
      }
      for (let i = 0; i < cells.length; i++) drawCell(i, cells[i], now)
      drawHUD(now)

      if (!state.started) {
        ctx.fillStyle = 'rgba(232,230,240,0.85)'
        ctx.font = "20px 'Space Grotesk', sans-serif"
        ctx.textAlign = 'center'
        ctx.fillText('TAP green PUMPs', W/2, H - 60)
        ctx.fillText('AVOID red DUMPs', W/2, H - 35)
      }

      if (!state.alive) {
        cancelAnimationFrame(raf)
        setRunning(false)
        setOver(true)
        setScore(state.score)
        const prev = Number(localStorage.getItem('phuck_best_pump') || '0')
        if (state.score > prev) {
          localStorage.setItem('phuck_best_pump', String(state.score))
          setBest(state.score)
        }
        return
      }
      raf = requestAnimationFrame(update)
    }

    function getCoords(e: MouseEvent | TouchEvent) {
      const rect = canvas.getBoundingClientRect()
      const t = 'touches' in e ? (e as TouchEvent).touches[0] || (e as TouchEvent).changedTouches[0] : (e as MouseEvent)
      const sx = canvas.width / rect.width
      const sy = canvas.height / rect.height
      return { x: (t.clientX - rect.left) * sx, y: (t.clientY - rect.top) * sy }
    }
    function onDown(e: MouseEvent | TouchEvent) {
      e.preventDefault()
      state.started = true
      const { x, y } = getCoords(e)
      tap(x, y)
    }

    if (running) {
      reset()
      canvas.addEventListener('mousedown', onDown)
      canvas.addEventListener('touchstart', onDown, { passive: false })
      raf = requestAnimationFrame(update)
    }

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('mousedown', onDown)
      canvas.removeEventListener('touchstart', onDown)
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
        canvas{display:block;width:100%;max-width:560px;height:auto;border:1px solid var(--border);border-radius:16px;background:#06050e;touch-action:none;cursor:pointer;}
      `}</style>
      <main style={{minHeight:'100vh',padding:'1.5rem 1rem',maxWidth:620,margin:'0 auto'}}>
        <Link href="/play" style={{color:'var(--muted)',textDecoration:'none',fontSize:'.85rem'}}>← back to arcade</Link>
        <h1 className="h-bebas" style={{fontSize:'2.5rem',margin:'.5rem 0 .25rem'}}>PUMP OR <span style={{color:'#ff3a5e'}}>DUMP</span></h1>
        <p style={{color:'var(--muted)',margin:'0 0 1rem',fontSize:'.95rem'}}>Tap pumps for points. Don&apos;t touch dumps. 3 lives. Combos boost score.</p>

        <div style={{display:'flex',justifyContent:'center',position:'relative'}}>
          <canvas ref={canvasRef} width={560} height={620} />
          {!running && !over && (
            <button onClick={() => setRunning(true)}
              className="btn btn-accent h-bebas"
              style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:'1.3rem',padding:'14px 32px'}}>▶ START</button>
          )}
          {over && (
            <div style={{position:'absolute',inset:0,background:'rgba(6,5,14,0.92)',borderRadius:16,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'1.5rem'}}>
              <h2 className="h-bebas" style={{margin:0,fontSize:'2.2rem',color:'#ff3a5e'}}>LIQUIDATED</h2>
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
