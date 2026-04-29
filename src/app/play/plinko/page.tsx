'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { getTop, submitScore, isGlobal, type ScoreRow } from '@/lib/leaderboard'

const GAME = 'plinko'
// coin-spin.png = 624x119 (tight-cropped), 6 frames horizontal
const COIN_FRAMES = 6
const COIN_FW = 624 / 6
const COIN_FH = 119

export default function PlinkoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [running, setRunning] = useState(false)
  const [bank, setBank] = useState(100)
  const [bestBank, setBestBank] = useState(100)
  const [over, setOver] = useState(false)
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [board, setBoard] = useState<ScoreRow[]>([])

  useEffect(() => { (async () => setBoard(await getTop(GAME, 10)))() }, [])
  useEffect(() => { setBestBank(Number(localStorage.getItem('phuck_best_plinko')||'100')) }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height

    const coin = new Image(); coin.src = '/sprites/coin-spin.png'

    let raf = 0, frameCount = 0

    type Peg = { x: number; y: number; flash: number }
    type Coin = { x: number; y: number; vx: number; vy: number; trail: { x: number; y: number }[]; settled: boolean; landedSlot?: number; spinFrame: number }
    type FloatText = { x: number; y: number; text: string; color: string; until: number }

    const pegRows = 10
    const pegs: Peg[] = []
    for (let r = 0; r < pegRows; r++) {
      const cols = r + 3
      const spacing = (W - 80) / (cols + 1)
      for (let c = 0; c < cols; c++) {
        pegs.push({ x: 40 + spacing * (c + 1) + (r % 2 ? 0 : spacing / 2), y: 80 + r * 40, flash: 0 })
      }
    }

    // Slots at the bottom — multipliers
    const SLOTS = 9
    const SLOT_MULTS = [10, 3, 1, 0.5, 0.2, 0.5, 1, 3, 10] // symmetric, edges win big
    const slotW = W / SLOTS
    const slotY = H - 60

    let coinObj: Coin | null = null
    const floatTexts: FloatText[] = []
    let internalBank = bank

    function addFloat(x: number, y: number, text: string, color: string) {
      floatTexts.push({ x, y, text, color, until: performance.now() + 1100 })
    }

    function dropCoin(startX: number, betAmount: number) {
      if (coinObj || internalBank < betAmount) return
      internalBank -= betAmount
      setBank(internalBank)
      coinObj = {
        x: startX, y: 30,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0,
        trail: [],
        settled: false,
        spinFrame: 0,
      }
    }

    function drawBg() {
      ctx.fillStyle = '#06050e'
      ctx.fillRect(0, 0, W, H)
      // Soft glow background
      const grad = ctx.createRadialGradient(W/2, H/2, 50, W/2, H/2, W)
      grad.addColorStop(0, 'rgba(153,69,255,0.08)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
    }

    function drawPegs() {
      const now = performance.now()
      for (const p of pegs) {
        const flashAlpha = p.flash > now ? Math.min(1, (p.flash - now) / 200) : 0
        ctx.fillStyle = flashAlpha > 0 ? `rgba(200,255,0,${0.5 + flashAlpha*0.5})` : 'rgba(232,230,240,0.7)'
        ctx.shadowColor = '#c8ff00'
        ctx.shadowBlur = flashAlpha > 0 ? 14 : 4
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill()
      }
      ctx.shadowBlur = 0
    }

    function drawSlots() {
      for (let i = 0; i < SLOTS; i++) {
        const x = i * slotW
        const m = SLOT_MULTS[i]
        const intensity = m >= 10 ? 1 : m >= 3 ? 0.7 : m >= 1 ? 0.4 : 0.2
        const color = m >= 1 ? `rgba(200,255,0,${intensity})` : `rgba(255,58,94,${intensity})`
        ctx.fillStyle = color
        ctx.fillRect(x + 4, slotY, slotW - 8, 56)
        ctx.fillStyle = '#fff'
        ctx.font = "bold 14px 'Bebas Neue', sans-serif"
        ctx.textAlign = 'center'
        ctx.fillText(`${m}×`, x + slotW/2, slotY + 30)
      }
    }

    function drawCoin() {
      if (!coinObj) return
      // Trail
      for (let i = 0; i < coinObj.trail.length; i++) {
        const t = coinObj.trail[i]
        const a = i / coinObj.trail.length * 0.4
        ctx.fillStyle = `rgba(200,255,0,${a})`
        ctx.beginPath(); ctx.arc(t.x, t.y, 6 - i * 0.4, 0, Math.PI*2); ctx.fill()
      }
      // Coin
      const fIdx = Math.floor(coinObj.spinFrame) % COIN_FRAMES
      const size = 28
      if (coin.complete && coin.naturalWidth > 0) {
        ctx.drawImage(coin, fIdx * COIN_FW, 0, COIN_FW, COIN_FH, coinObj.x - size/2, coinObj.y - size/2, size, size)
      } else {
        ctx.fillStyle = '#ffd700'
        ctx.shadowColor = '#ffd700'
        ctx.shadowBlur = 12
        ctx.beginPath(); ctx.arc(coinObj.x, coinObj.y, size/2, 0, Math.PI*2); ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    function drawFloats() {
      const now = performance.now()
      for (const t of floatTexts) {
        const left = (t.until - now) / 1100
        if (left <= 0) continue
        ctx.globalAlpha = left
        ctx.fillStyle = t.color
        ctx.font = "bold 22px 'Bebas Neue', sans-serif"
        ctx.textAlign = 'center'
        ctx.fillText(t.text, t.x, t.y - (1 - left) * 40)
      }
      ctx.globalAlpha = 1
    }

    function drawHUD() {
      ctx.fillStyle = '#c8ff00'
      ctx.font = "bold 28px 'Bebas Neue', sans-serif"
      ctx.textAlign = 'left'
      ctx.fillText(`🪙 ${Math.floor(internalBank)}`, 20, 40)
      ctx.font = "11px 'Space Grotesk', sans-serif"
      ctx.fillStyle = 'rgba(232,230,240,0.6)'
      ctx.fillText('LIQUIDITY', 20, 54)
    }

    function update() {
      frameCount++
      drawBg()
      drawPegs()
      drawSlots()

      if (coinObj && !coinObj.settled) {
        coinObj.vy += 0.25
        coinObj.x += coinObj.vx
        coinObj.y += coinObj.vy
        coinObj.spinFrame += Math.abs(coinObj.vx) * 0.5 + 0.2
        coinObj.trail.push({ x: coinObj.x, y: coinObj.y })
        if (coinObj.trail.length > 8) coinObj.trail.shift()
        // peg collisions
        for (const p of pegs) {
          const dx = coinObj.x - p.x
          const dy = coinObj.y - p.y
          const d = Math.hypot(dx, dy)
          const minD = 4 + 12
          if (d < minD) {
            const nx = dx / (d || 1)
            const ny = dy / (d || 1)
            // push out
            coinObj.x = p.x + nx * minD
            coinObj.y = p.y + ny * minD
            // reflect velocity with damping
            const dot = coinObj.vx * nx + coinObj.vy * ny
            coinObj.vx = (coinObj.vx - 2 * dot * nx) * 0.7
            coinObj.vy = (coinObj.vy - 2 * dot * ny) * 0.7
            // a tiny random kick to keep it interesting
            coinObj.vx += (Math.random() - 0.5) * 0.6
            p.flash = performance.now() + 300
          }
        }
        // walls
        if (coinObj.x < 12) { coinObj.x = 12; coinObj.vx = Math.abs(coinObj.vx) * 0.6 }
        if (coinObj.x > W - 12) { coinObj.x = W - 12; coinObj.vx = -Math.abs(coinObj.vx) * 0.6 }
        // landed in slot
        if (coinObj.y >= slotY) {
          coinObj.settled = true
          const slot = Math.max(0, Math.min(SLOTS - 1, Math.floor(coinObj.x / slotW)))
          coinObj.landedSlot = slot
          const mult = SLOT_MULTS[slot]
          const winnings = Math.round(10 * mult)  // bet was 10 fixed
          internalBank += winnings
          setBank(internalBank)
          const color = mult >= 1 ? '#c8ff00' : '#ff3a5e'
          addFloat(coinObj.x, slotY - 20, `${mult}× ${winnings > 0 ? '+' : ''}${winnings}`, color)
          if (internalBank > bestBank) {
            localStorage.setItem('phuck_best_plinko', String(internalBank))
            setBestBank(internalBank)
          }
          if (internalBank <= 0) {
            // Game over
            setOver(true)
            setRunning(false)
          }
          // remove coin after delay
          setTimeout(() => { coinObj = null }, 600)
        }
      }

      drawCoin()
      drawFloats()
      drawHUD()

      raf = requestAnimationFrame(update)
    }

    function getCoords(e: MouseEvent | TouchEvent) {
      const rect = canvas.getBoundingClientRect()
      const t = 'touches' in e ? (e as TouchEvent).touches[0] || (e as TouchEvent).changedTouches[0] : (e as MouseEvent)
      const sx = canvas.width / rect.width
      return { x: (t.clientX - rect.left) * sx }
    }
    function onClick(e: MouseEvent | TouchEvent) {
      e.preventDefault()
      const { x } = getCoords(e)
      dropCoin(x, 10)
    }

    if (running) {
      canvas.addEventListener('mousedown', onClick)
      canvas.addEventListener('touchstart', onClick, { passive: false })
      raf = requestAnimationFrame(update)
    }

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('mousedown', onClick)
      canvas.removeEventListener('touchstart', onClick)
    }
  }, [running, bestBank])

  function startGame() {
    setBank(100)
    setOver(false)
    setSubmitted(false)
    setRunning(true)
  }

  async function handleSubmit() {
    if (submitted || bank === 0) return
    await submitScore(GAME, name || 'anon', bank)
    setSubmitted(true)
    setBoard(await getTop(GAME, 10))
  }

  function cashOut() {
    setRunning(false)
    setOver(true)
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
        .btn-purple{background:var(--purple);color:#fff;border-color:var(--purple);}
        canvas{display:block;width:100%;max-width:560px;height:auto;border:1px solid var(--border);border-radius:16px;background:#06050e;touch-action:none;cursor:crosshair;}
      `}</style>
      <main style={{minHeight:'100vh',padding:'1.5rem 1rem',maxWidth:620,margin:'0 auto'}}>
        <Link href="/play" style={{color:'var(--muted)',textDecoration:'none',fontSize:'.85rem'}}>← back to arcade</Link>
        <h1 className="h-bebas" style={{fontSize:'2.5rem',margin:'.5rem 0 .25rem'}}>LIQUIDITY <span style={{color:'var(--purple)'}}>PLINKO</span></h1>
        <p style={{color:'var(--muted)',margin:'0 0 1rem',fontSize:'.95rem'}}>Tap anywhere on the top to drop a coin (10 🪙). Land in slots = win multiplier. Edges pay 10×.</p>

        <div style={{display:'flex',justifyContent:'center',position:'relative'}}>
          <canvas ref={canvasRef} width={560} height={620} />
          {!running && !over && (
            <button onClick={startGame}
              className="btn btn-accent h-bebas"
              style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:'1.3rem',padding:'14px 32px'}}>▶ START (100 🪙)</button>
          )}
          {over && (
            <div style={{position:'absolute',inset:0,background:'rgba(6,5,14,0.92)',borderRadius:16,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'1.5rem'}}>
              <h2 className="h-bebas" style={{margin:0,fontSize:'2.2rem',color:bank > 100 ? 'var(--accent)' : '#ff3a5e'}}>
                {bank > 100 ? 'PROFIT' : 'WRECKED'}
              </h2>
              <p style={{margin:'.25rem 0 0',fontSize:'1.4rem'}}>Final: <b>{bank} 🪙</b></p>
              <p style={{margin:0,color:'var(--muted)',fontSize:'.85rem'}}>Best: {bestBank} 🪙</p>
              {!submitted && bank > 0 && (
                <div style={{display:'flex',gap:8,marginTop:'1rem'}}>
                  <input value={name} onChange={e=>setName(e.target.value)} maxLength={16} placeholder="your tag"
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'rgba(0,0,0,.3)',color:'var(--text)'}}/>
                  <button onClick={handleSubmit} className="btn btn-accent">Submit</button>
                </div>
              )}
              <button onClick={startGame} className="btn btn-accent h-bebas" style={{marginTop:'1rem'}}>▶ Again</button>
            </div>
          )}
        </div>

        {running && (
          <div style={{display:'flex',justifyContent:'center',marginTop:'1rem'}}>
            <button onClick={cashOut} className="btn btn-purple">CASH OUT</button>
          </div>
        )}

        <section style={{marginTop:'2rem',background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:'1.25rem'}}>
          <h3 className="h-bebas" style={{margin:0,fontSize:'1.4rem'}}>LEADERBOARD <span style={{fontSize:'.7rem',color:'var(--muted)'}}>{isGlobal()?'GLOBAL':'LOCAL'}</span></h3>
          <ol style={{margin:'.75rem 0 0',padding:0,listStyle:'none'}}>
            {board.length === 0 && <li style={{color:'var(--muted)'}}>No scores yet.</li>}
            {board.map((r, i) => (
              <li key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--border)',fontSize:'.9rem'}}>
                <span><b style={{color:'var(--purple)',marginRight:8}}>#{i+1}</b>{r.name}</span>
                <span>{r.score} 🪙</span>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  )
}
