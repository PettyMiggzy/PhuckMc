'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { getTop, submitScore, isGlobal, type ScoreRow } from '@/lib/leaderboard'

// buyback-run.png is 552x424, 4 columns x 3 rows = 12 frames
const COLS = 4, ROWS = 3, SHEET_W = 552, SHEET_H = 424
const FRAME_W = SHEET_W / COLS
const FRAME_H = SHEET_H / ROWS
const GAME = 'runner'

export default function RunnerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [running, setRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [over, setOver] = useState(false)
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [board, setBoard] = useState<ScoreRow[]>([])

  useEffect(() => { (async () => setBoard(await getTop(GAME, 10)))() }, [])
  useEffect(() => { setBest(Number(localStorage.getItem('phuck_best_runner')||'0')) }, [])

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height
    const groundY = H - 80

    const sloth = new Image()
    sloth.src = '/sprites/buyback-run.png'
    const coinSheet = new Image()
    coinSheet.src = '/sprites/coin-spin.png'

    let raf = 0, frameCount = 0

    type Obstacle = { type: 'rug' | 'fud'; x: number; y: number; w: number; h: number }
    type Coin = { x: number; y: number; collected: boolean }

    const state = {
      slothY: groundY,
      vy: 0,
      onGround: true,
      ducking: false,
      obstacles: [] as Obstacle[],
      coins: [] as Coin[],
      score: 0,
      coinsCollected: 0,
      speed: 5,
      alive: true,
      started: false,
      animFrame: 0,
    }

    function reset() {
      state.slothY = groundY
      state.vy = 0
      state.onGround = true
      state.ducking = false
      state.obstacles = []
      state.coins = []
      state.score = 0
      state.coinsCollected = 0
      state.speed = 5
      state.alive = true
      state.started = false
      state.animFrame = 0
    }

    function jump() {
      if (!state.alive) return
      state.started = true
      if (state.onGround) {
        state.vy = -14
        state.onGround = false
      }
    }
    function duck(on: boolean) { state.ducking = on }

    function spawn() {
      if (Math.random() < 0.012 && (state.obstacles.length === 0 || state.obstacles[state.obstacles.length-1].x < W - 240)) {
        const isLow = Math.random() > 0.65
        if (isLow) {
          // FUD - flying obstacle, must duck
          state.obstacles.push({ type: 'fud', x: W + 40, y: groundY - 90, w: 50, h: 30 })
        } else {
          // RUG - ground obstacle, must jump
          state.obstacles.push({ type: 'rug', x: W + 40, y: groundY - 30, w: 60, h: 30 })
        }
      }
      if (Math.random() < 0.018 && (state.coins.length === 0 || state.coins[state.coins.length-1].x < W - 120)) {
        state.coins.push({ x: W + 30, y: groundY - 60 - Math.random() * 80, collected: false })
      }
    }

    function drawBg() {
      ctx.fillStyle = '#06050e'
      ctx.fillRect(0, 0, W, H)
      // Distant city silhouette
      ctx.fillStyle = 'rgba(153,69,255,0.15)'
      const offset = (frameCount * 0.5) % 120
      for (let x = -offset; x < W; x += 120) {
        const h = 60 + Math.sin(x * 0.05) * 30
        ctx.fillRect(x, groundY - h, 80, h)
      }
      // Ground glow line
      ctx.strokeStyle = '#c8ff00'
      ctx.lineWidth = 2
      ctx.shadowColor = '#c8ff00'
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.moveTo(0, groundY)
      ctx.lineTo(W, groundY)
      ctx.stroke()
      ctx.shadowBlur = 0
      // Speed lines on ground
      ctx.strokeStyle = 'rgba(200,255,0,0.2)'
      ctx.lineWidth = 1
      for (let i = 0; i < 8; i++) {
        const x = (i * 100 - frameCount * state.speed * 2) % W
        if (x < 0) continue
        ctx.beginPath()
        ctx.moveTo(x, groundY + 5)
        ctx.lineTo(x + 30, groundY + 5)
        ctx.stroke()
      }
    }

    function drawObstacles() {
      for (const o of state.obstacles) {
        if (o.type === 'rug') {
          // Red rug = "RUG" text on red brick
          ctx.fillStyle = '#ff3a5e'
          ctx.shadowColor = '#ff3a5e'
          ctx.shadowBlur = 10
          ctx.fillRect(o.x, o.y, o.w, o.h)
          ctx.shadowBlur = 0
          ctx.fillStyle = '#fff'
          ctx.font = "bold 14px 'Bebas Neue', sans-serif"
          ctx.textAlign = 'center'
          ctx.fillText('RUG', o.x + o.w/2, o.y + o.h/2 + 4)
        } else {
          // FUD = floating red diamond
          ctx.fillStyle = '#ff3a5e'
          ctx.shadowColor = '#ff3a5e'
          ctx.shadowBlur = 10
          ctx.beginPath()
          ctx.moveTo(o.x + o.w/2, o.y)
          ctx.lineTo(o.x + o.w, o.y + o.h/2)
          ctx.lineTo(o.x + o.w/2, o.y + o.h)
          ctx.lineTo(o.x, o.y + o.h/2)
          ctx.closePath()
          ctx.fill()
          ctx.shadowBlur = 0
          ctx.fillStyle = '#fff'
          ctx.font = "bold 11px 'Bebas Neue', sans-serif"
          ctx.textAlign = 'center'
          ctx.fillText('FUD', o.x + o.w/2, o.y + o.h/2 + 3)
        }
      }
    }

    function drawCoins() {
      for (const c of state.coins) {
        if (c.collected) continue
        if (coinSheet.complete && coinSheet.naturalWidth > 0) {
          const fIdx = Math.floor(frameCount / 4) % 6
          const cFW = coinSheet.naturalWidth / 6
          ctx.drawImage(coinSheet, fIdx * cFW, 0, cFW, coinSheet.naturalHeight, c.x - 16, c.y - 16, 32, 32)
        } else {
          ctx.fillStyle = '#ffd700'
          ctx.beginPath(); ctx.arc(c.x, c.y, 12, 0, Math.PI*2); ctx.fill()
        }
      }
    }

    function drawSloth() {
      const targetH = state.ducking ? 50 : 90
      const aspect = FRAME_W / FRAME_H
      const targetW = targetH * aspect
      const fIdx = state.onGround ? Math.floor(state.animFrame / 4) % (COLS * ROWS) : 0
      const col = fIdx % COLS
      const row = Math.floor(fIdx / COLS)
      const sx = col * FRAME_W
      const sy = row * FRAME_H
      if (sloth.complete && sloth.naturalWidth > 0) {
        ctx.drawImage(sloth, sx, sy, FRAME_W, FRAME_H, 80 - targetW/2, state.slothY - targetH, targetW, targetH)
      } else {
        ctx.fillStyle = '#9945ff'
        ctx.fillRect(60, state.slothY - targetH, 50, targetH)
      }
    }

    function drawHUD() {
      ctx.fillStyle = '#c8ff00'
      ctx.font = "bold 28px 'Bebas Neue', sans-serif"
      ctx.textAlign = 'left'
      ctx.fillText(`SCORE ${state.score}`, 20, 36)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#ffd700'
      ctx.fillText(`🪙 ${state.coinsCollected}`, W - 20, 36)
    }

    function update() {
      frameCount++
      if (state.started && state.alive) {
        state.animFrame++
        // physics
        state.vy += 0.7
        state.slothY += state.vy
        if (state.slothY >= groundY) {
          state.slothY = groundY
          state.vy = 0
          state.onGround = true
        }
        // move world
        for (const o of state.obstacles) o.x -= state.speed
        for (const c of state.coins) c.x -= state.speed
        spawn()
        state.obstacles = state.obstacles.filter(o => o.x > -80)
        state.coins = state.coins.filter(c => c.x > -40)

        // collide
        const hbX = 80 - 30, hbW = 60
        const hbH = state.ducking ? 50 : 90
        const hbY = state.slothY - hbH
        for (const o of state.obstacles) {
          if (o.x < hbX + hbW && o.x + o.w > hbX && o.y < hbY + hbH && o.y + o.h > hbY) {
            state.alive = false
          }
        }
        for (const c of state.coins) {
          if (!c.collected && Math.abs(c.x - 80) < 24 && Math.abs(c.y - (state.slothY - 50)) < 30) {
            c.collected = true
            state.coinsCollected++
            state.score += 10
          }
        }
        // distance score
        if (frameCount % 4 === 0) state.score++
        // speed up
        if (frameCount % 600 === 0 && state.speed < 11) state.speed += 0.5
      }

      drawBg()
      drawObstacles()
      drawCoins()
      drawSloth()
      drawHUD()

      if (!state.started) {
        ctx.fillStyle = 'rgba(232,230,240,0.85)'
        ctx.font = "20px 'Space Grotesk', sans-serif"
        ctx.textAlign = 'center'
        ctx.fillText('SPACE/TAP = JUMP    ↓ = DUCK', W/2, H/2 - 80)
      }

      if (!state.alive) {
        cancelAnimationFrame(raf)
        setRunning(false)
        setOver(true)
        setScore(state.score)
        const prev = Number(localStorage.getItem('phuck_best_runner') || '0')
        if (state.score > prev) {
          localStorage.setItem('phuck_best_runner', String(state.score))
          setBest(state.score)
        }
        return
      }
      raf = requestAnimationFrame(update)
    }

    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); jump() }
      if (e.key === 'ArrowDown' || e.key === 's') duck(true)
    }
    function onKeyUp(e: KeyboardEvent) { if (e.key === 'ArrowDown' || e.key === 's') duck(false) }
    let touchStartY = 0
    function onTouchStart(e: TouchEvent) { e.preventDefault(); touchStartY = e.touches[0].clientY }
    function onTouchEnd(e: TouchEvent) {
      e.preventDefault()
      const dy = (e.changedTouches[0].clientY - touchStartY)
      if (dy > 40) duck(true)
      else jump()
    }
    function onTouchCancel() { duck(false) }

    if (running) {
      reset()
      window.addEventListener('keydown', onKey)
      window.addEventListener('keyup', onKeyUp)
      canvas.addEventListener('touchstart', onTouchStart, { passive: false })
      canvas.addEventListener('touchend', onTouchEnd, { passive: false })
      canvas.addEventListener('touchcancel', onTouchCancel)
      canvas.addEventListener('mousedown', jump)
      raf = requestAnimationFrame(update)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKeyUp)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchend', onTouchEnd)
      canvas.removeEventListener('touchcancel', onTouchCancel)
      canvas.removeEventListener('mousedown', jump)
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
        .btn{padding:10px 22px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--text);font-weight:600;cursor:pointer;font-size:.9rem;}
        .btn-accent{background:var(--accent);color:#000;border-color:var(--accent);}
        canvas{display:block;width:100%;max-width:760px;height:auto;border:1px solid var(--border);border-radius:16px;background:#06050e;touch-action:none;}
      `}</style>
      <main style={{minHeight:'100vh',padding:'1.5rem 1rem',maxWidth:820,margin:'0 auto'}}>
        <Link href="/play" style={{color:'var(--muted)',textDecoration:'none',fontSize:'.85rem'}}>← back to arcade</Link>
        <h1 className="h-bebas" style={{fontSize:'2.5rem',margin:'.5rem 0 .25rem'}}>BUYBACK <span style={{color:'var(--purple)'}}>RUNNER</span></h1>
        <p style={{color:'var(--muted)',margin:'0 0 1rem',fontSize:'.95rem'}}>Jump the rugs, duck the FUD. Each coin = 10 buyback points.</p>

        <div style={{display:'flex',justifyContent:'center',position:'relative'}}>
          <canvas ref={canvasRef} width={760} height={420} />
          {!running && !over && (
            <button onClick={() => { setRunning(true) }}
              className="btn btn-accent h-bebas"
              style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:'1.3rem',padding:'14px 32px'}}>▶ START</button>
          )}
          {over && (
            <div style={{position:'absolute',inset:0,background:'rgba(6,5,14,0.92)',borderRadius:16,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'1.5rem'}}>
              <h2 className="h-bebas" style={{margin:0,fontSize:'2.2rem',color:'var(--purple)'}}>RUG PULL</h2>
              <p style={{margin:'.25rem 0 0',fontSize:'1.6rem'}}>Score: <b>{score}</b></p>
              <p style={{margin:0,color:'var(--muted)',fontSize:'.85rem'}}>Best: {best}</p>
              {!submitted && score > 0 && (
                <div style={{display:'flex',gap:8,marginTop:'1rem'}}>
                  <input value={name} onChange={e=>setName(e.target.value)} maxLength={16} placeholder="your tag"
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'rgba(0,0,0,.3)',color:'var(--text)'}}/>
                  <button onClick={handleSubmit} className="btn btn-accent">Submit</button>
                </div>
              )}
              <button onClick={() => { setOver(false); setSubmitted(false); setRunning(true) }} className="btn btn-accent h-bebas" style={{marginTop:'1rem',fontSize:'1.1rem'}}>▶ Again</button>
            </div>
          )}
        </div>

        <section style={{marginTop:'2rem',background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:'1.25rem'}}>
          <h3 className="h-bebas" style={{margin:0,fontSize:'1.4rem'}}>LEADERBOARD <span style={{fontSize:'.7rem',color:'var(--muted)'}}>{isGlobal()?'GLOBAL':'LOCAL'}</span></h3>
          <ol style={{margin:'.75rem 0 0',padding:0,listStyle:'none'}}>
            {board.length === 0 && <li style={{color:'var(--muted)'}}>No scores yet. Be the first.</li>}
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
