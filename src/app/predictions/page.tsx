"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { PREDICTIONS_ABI } from "@/lib/predictionsAbi";
import { PREDICTIONS_ADDRESS } from "@/lib/predictions";
import { ORACLE_CONTROLLER_ABI } from "@/lib/oracleControllerAbi";
import { ORACLE_CONTROLLER_ADDRESS } from "@/lib/oracleController";
import { getMarketMeta } from "@/lib/marketMeta";
import WalletButton from "@/components/WalletButton";

const S = {
  bg:     '#06050e',
  accent: '#c8ff00',
  purple: '#9945ff',
  card:   'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  text:   '#e8e6f0',
  muted:  'rgba(232,230,240,0.5)',
}

function shortAddr(a?: string) {
  if (!a) return "";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function statusLabel(status: number) {
  if (status === 0) return { label: "Open", color: S.accent, bg: "rgba(200,255,0,0.1)" };
  if (status === 1) return { label: "Matched", color: "#60a5fa", bg: "rgba(96,165,250,0.1)" };
  if (status === 2) return { label: "Cancelled", color: S.muted, bg: "rgba(255,255,255,0.05)" };
  if (status === 3) return { label: "Refunded", color: "#fb923c", bg: "rgba(251,146,60,0.1)" };
  if (status === 4) return { label: "Resolved", color: "#a78bfa", bg: "rgba(167,139,250,0.1)" };
  return { label: "Unknown", color: S.muted, bg: "rgba(255,255,255,0.05)" };
}

function fmtCountdown(sec: number) {
  if (sec <= 0) return "Ready";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function Nav() {
  return (
    <nav style={{position:'sticky',top:0,zIndex:100,borderBottom:`1px solid ${S.border}`,background:'rgba(6,5,14,.94)',backdropFilter:'blur(24px)',padding:'0 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',height:'64px'}}>
      <a href="/" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none'}}>
        <img src="/logo.png" alt="PHUCKMC" style={{width:34,height:34,borderRadius:9,objectFit:'cover',border:`1px solid ${S.border}`}}/>
        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.4rem',letterSpacing:'.06em',color:S.text}}>PHUCK<span style={{color:S.accent}}>MC</span></span>
      </a>
      <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
        {[['Home','/'],['Swap','/swap'],['Staking','/staking'],['Predictions','/predictions']].map(([l,h])=>(
          <a key={l} href={h} style={{padding:'7px 16px',borderRadius:999,border:`1px solid ${h==='/predictions'?S.purple:S.border}`,background:h==='/predictions'?'rgba(153,69,255,0.12)':'rgba(255,255,255,0.03)',fontSize:'.82rem',fontWeight:500,color:h==='/predictions'?'#c084fc':S.text,textDecoration:'none'}}>{l}</a>
        ))}
        <a href="https://t.me/PhuckMc" target="_blank" rel="noreferrer" style={{padding:'7px 12px',borderRadius:999,border:`1px solid ${S.border}`,background:'rgba(255,255,255,0.03)',fontSize:'.82rem',color:S.muted,textDecoration:'none'}}>✈️</a>
        <a href="https://t.me/PhuckMc/74931" target="_blank" rel="noreferrer" style={{padding:'7px 12px',borderRadius:999,border:`1px solid ${S.border}`,background:'rgba(255,255,255,0.03)',fontSize:'.82rem',color:S.muted,textDecoration:'none'}}>𝕏</a>
        <WalletButton />
      </div>
    </nav>
  )
}

function StatusBadge({ status }: { status: number }) {
  const { label, color, bg } = statusLabel(status)
  return (
    <span style={{padding:'4px 12px',borderRadius:999,border:`1px solid ${color}40`,background:bg,color,fontSize:'.75rem',fontWeight:600,letterSpacing:'.06em'}}>{label}</span>
  )
}

function PredictionCard({ id, p, d, bond, oracleParams, isResolver, isConnected, onPropose, onChallenge, onFinalize, onResolve, onMatch, now }: any) {
  const pot = p.creatorEscrow + p.opponentEscrow
  const meta = getMarketMeta(p.marketId)
  const title = meta?.title || "Unknown market"
  const outcomeA = meta?.outcomeA || "Outcome A"
  const outcomeB = meta?.outcomeB || "Outcome B"
  const creatorPick = p.creatorSide === 0 ? `A: ${outcomeA}` : `B: ${outcomeB}`
  const opponentPick = p.creatorSide === 0 ? `B: ${outcomeB}` : `A: ${outcomeA}`
  const matched = p.status === 1
  const expired = now >= p.expiry
  const hasProposal = d.exists
  const challenged = d.challenged
  const finalized = d.finalized
  const challengeEnd = hasProposal && oracleParams ? d.proposedAt + oracleParams.challengeWindow : 0
  const secondsLeft = hasProposal ? challengeEnd - now : 0

  return (
    <div style={{borderRadius:20,border:`1px solid ${S.border}`,background:S.card,overflow:'hidden',transition:'border-color .2s',position:'relative'}}>
      {/* Top accent line based on status */}
      <div style={{height:3,background:p.status===0?S.accent:p.status===1?'#60a5fa':p.status===4?S.purple:'rgba(255,255,255,0.1)'}}/>

      <div style={{padding:'1.5rem'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:'1.2rem'}}>
          <div>
            <div style={{fontSize:'.7rem',letterSpacing:'.14em',color:S.muted,fontWeight:600,marginBottom:4}}>PREDICTION #{id}</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.4rem',letterSpacing:'.04em',lineHeight:1.1}}>{title}</div>
          </div>
          <StatusBadge status={matched && expired ? 4 : p.status} />
        </div>

        {/* Outcomes */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:'1.2rem'}}>
          <div style={{padding:'10px 14px',borderRadius:12,border:`1px solid ${p.creatorSide===0?S.accent+'50':S.border}`,background:p.creatorSide===0?'rgba(200,255,0,0.06)':S.card}}>
            <div style={{fontSize:'.65rem',letterSpacing:'.12em',color:p.creatorSide===0?S.accent:S.muted,fontWeight:600,marginBottom:3}}>OUTCOME A {p.creatorSide===0?'◆ Creator':''}</div>
            <div style={{fontSize:'.9rem',fontWeight:600,color:S.text}}>{outcomeA}</div>
          </div>
          <div style={{padding:'10px 14px',borderRadius:12,border:`1px solid ${p.creatorSide===1?S.accent+'50':S.border}`,background:p.creatorSide===1?'rgba(200,255,0,0.06)':S.card}}>
            <div style={{fontSize:'.65rem',letterSpacing:'.12em',color:p.creatorSide===1?S.accent:S.muted,fontWeight:600,marginBottom:3}}>OUTCOME B {p.creatorSide===1?'◆ Creator':''}</div>
            <div style={{fontSize:'.9rem',fontWeight:600,color:S.text}}>{outcomeB}</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{display:'flex',gap:8,marginBottom:'1.2rem',flexWrap:'wrap'}}>
          <div style={{padding:'8px 14px',borderRadius:10,border:`1px solid ${S.border}`,background:'rgba(255,255,255,0.02)',flex:1,minWidth:80}}>
            <div style={{fontSize:'.65rem',letterSpacing:'.1em',color:S.muted,fontWeight:600}}>POT</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.3rem',color:S.accent,letterSpacing:'.04em'}}>{formatEther(pot)} MON</div>
          </div>
          <div style={{padding:'8px 14px',borderRadius:10,border:`1px solid ${S.border}`,background:'rgba(255,255,255,0.02)',flex:1,minWidth:80}}>
            <div style={{fontSize:'.65rem',letterSpacing:'.1em',color:S.muted,fontWeight:600}}>CREATOR</div>
            <div style={{fontSize:'.85rem',fontWeight:600,color:S.text,marginTop:2}}>{shortAddr(p.creator)}</div>
          </div>
          {p.opponent !== '0x0000000000000000000000000000000000000000' && (
            <div style={{padding:'8px 14px',borderRadius:10,border:`1px solid ${S.border}`,background:'rgba(255,255,255,0.02)',flex:1,minWidth:80}}>
              <div style={{fontSize:'.65rem',letterSpacing:'.1em',color:S.muted,fontWeight:600}}>OPPONENT</div>
              <div style={{fontSize:'.85rem',fontWeight:600,color:S.text,marginTop:2}}>{shortAddr(p.opponent)}</div>
            </div>
          )}
        </div>

        {/* Take other side (open) */}
        {p.status === 0 && (
          <div>
            <button
              style={{width:'100%',padding:'13px',borderRadius:12,background:S.accent,color:'#000',fontWeight:700,fontSize:'.95rem',border:'none',cursor:'pointer',marginBottom:8,transition:'opacity .15s'}}
              disabled={!isConnected}
              onClick={() => onMatch(id, p.creatorEscrow)}
            >
              ⬡ Take Other Side — Stake {formatEther(p.creatorEscrow)} MON
            </button>
            <div style={{fontSize:'.78rem',color:S.muted,textAlign:'center'}}>
              You take: <strong style={{color:S.text}}>{opponentPick}</strong>
            </div>
          </div>
        )}

        {/* Resolution flow (matched + expired) */}
        {matched && expired && (
          <div style={{borderTop:`1px solid ${S.border}`,paddingTop:'1.2rem',marginTop:'.2rem'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <div style={{fontSize:'.75rem',letterSpacing:'.12em',color:S.muted,fontWeight:600}}>RESOLUTION</div>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:'.75rem',color:S.muted}}>Bond: {formatEther(bond)} MON</span>
            </div>

            {!hasProposal ? (
              <>
                <div style={{fontSize:'.85rem',color:S.muted,marginBottom:12}}>No proposal yet. Anyone can propose the outcome.</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  <button style={{padding:'11px',borderRadius:10,border:`1px solid ${S.accent}40`,background:'rgba(200,255,0,0.08)',color:S.accent,fontWeight:600,fontSize:'.85rem',cursor:'pointer'}} disabled={!isConnected} onClick={() => onPropose(id, true, bond)}>
                    Propose A Wins
                  </button>
                  <button style={{padding:'11px',borderRadius:10,border:`1px solid ${S.purple}40`,background:'rgba(153,69,255,0.08)',color:'#c084fc',fontWeight:600,fontSize:'.85rem',cursor:'pointer'}} disabled={!isConnected} onClick={() => onPropose(id, false, bond)}>
                    Propose B Wins
                  </button>
                </div>
              </>
            ) : (
              <div>
                <div style={{padding:'10px 14px',borderRadius:10,border:`1px solid ${S.border}`,background:'rgba(255,255,255,0.02)',marginBottom:10,fontSize:'.85rem'}}>
                  <span style={{color:S.muted}}>Proposed: </span>
                  <strong style={{color:S.text}}>{d.proposedCreatorWins ? "Outcome A wins" : "Outcome B wins"}</strong>
                  <span style={{color:S.muted}}> by {shortAddr(d.proposer)}</span>
                  {!finalized && !challenged && (
                    <span style={{color:S.muted}}> · Challenge ends in <strong style={{color:S.accent}}>{fmtCountdown(secondsLeft)}</strong></span>
                  )}
                  {challenged && !finalized && <span style={{color:'#fca5a5'}}> · Challenged</span>}
                  {finalized && <span style={{color:'#6ee7b7'}}> · Finalized ✔</span>}
                </div>
                {!finalized && !challenged && (
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    <button style={{padding:'11px',borderRadius:10,border:`1px solid ${S.border}`,background:S.card,color:S.text,fontWeight:600,fontSize:'.85rem',cursor:'pointer'}} disabled={!isConnected} onClick={() => onChallenge(id, bond)}>
                      Challenge
                    </button>
                    <button style={{padding:'11px',borderRadius:10,border:`1px solid ${S.accent}40`,background:'rgba(200,255,0,0.08)',color:S.accent,fontWeight:600,fontSize:'.85rem',cursor:'pointer'}} disabled={!isConnected} onClick={() => onFinalize(id)}>
                      Finalize
                    </button>
                  </div>
                )}
                {challenged && !finalized && isResolver && (
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    <button style={{padding:'11px',borderRadius:10,border:`1px solid ${S.accent}40`,background:'rgba(200,255,0,0.08)',color:S.accent,fontWeight:600,fontSize:'.85rem',cursor:'pointer'}} onClick={() => onResolve(id, true)}>Resolve: A Wins</button>
                    <button style={{padding:'11px',borderRadius:10,border:`1px solid ${S.purple}40`,background:'rgba(153,69,255,0.08)',color:'#c084fc',fontWeight:600,fontSize:'.85rem',cursor:'pointer'}} onClick={() => onResolve(id, false)}>Resolve: B Wins</button>
                  </div>
                )}
                {challenged && !finalized && !isResolver && (
                  <div style={{fontSize:'.8rem',color:S.muted,textAlign:'center',padding:'8px'}}>Dispute pending team resolver</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PredictionsPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const now = Math.floor(Date.now() / 1000);
  const RESOLVER = "0xC022B75D302AF292328cc0C056c7310552E74c8E".toLowerCase();
  const isResolver = address?.toLowerCase() === RESOLVER;
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [oracleParams, setOracleParams] = useState<{ challengeWindow: number; minBondWei: bigint; bondBpsOfPot: number } | null>(null);
  const [filter, setFilter] = useState<'all'|'open'|'matched'|'resolved'>('all')

  function unpackPrediction(p: any) {
    return {
      creator: p[0] as `0x${string}`, opponent: p[1] as `0x${string}`,
      creatorEscrow: p[2] as bigint, opponentEscrow: p[3] as bigint,
      createdAt: Number(p[4]), matchDeadline: Number(p[5]), expiry: Number(p[6]),
      creatorSide: Number(p[7]), targetPrice: p[8] as bigint,
      marketId: p[9] as `0x${string}`, status: Number(p[10]), winner: p[11] as `0x${string}`,
    };
  }

  async function write(address_: `0x${string}`, abi: any, fn: string, args: any[] = [], value?: bigint) {
    if (!walletClient) throw new Error("Connect wallet");
    const hash = await walletClient.writeContract({ address: address_, abi, functionName: fn as any, args, value });
    await publicClient?.waitForTransactionReceipt({ hash });
    await refresh();
  }

  async function refresh() {
    if (!publicClient) return;
    setLoading(true);
    try {
      const [challengeWindow, minBondWei, bondBpsOfPot] = await Promise.all([
        publicClient.readContract({ address: ORACLE_CONTROLLER_ADDRESS, abi: ORACLE_CONTROLLER_ABI, functionName: "challengeWindow" }),
        publicClient.readContract({ address: ORACLE_CONTROLLER_ADDRESS, abi: ORACLE_CONTROLLER_ABI, functionName: "minBondWei" }),
        publicClient.readContract({ address: ORACLE_CONTROLLER_ADDRESS, abi: ORACLE_CONTROLLER_ABI, functionName: "bondBpsOfPot" }),
      ]) as [bigint, bigint, bigint];
      setOracleParams({ challengeWindow: Number(challengeWindow), minBondWei, bondBpsOfPot: Number(bondBpsOfPot) });
      const nextId = await publicClient.readContract({ address: PREDICTIONS_ADDRESS, abi: PREDICTIONS_ABI, functionName: "nextId" }) as bigint;
      const maxId = Number(nextId) - 1;
      if (maxId <= 0) { setRows([]); return; }
      const ids: number[] = [];
      for (let i = maxId; i >= Math.max(1, maxId - 29); i--) ids.push(i);
      const data = await Promise.all(ids.map(async (id) => {
        const [pRaw, dRaw, bond] = await Promise.all([
          publicClient.readContract({ address: PREDICTIONS_ADDRESS, abi: PREDICTIONS_ABI, functionName: "predictions", args: [BigInt(id)] }),
          publicClient.readContract({ address: ORACLE_CONTROLLER_ADDRESS, abi: ORACLE_CONTROLLER_ABI, functionName: "disputes", args: [BigInt(id)] }),
          publicClient.readContract({ address: ORACLE_CONTROLLER_ADDRESS, abi: ORACLE_CONTROLLER_ABI, functionName: "requiredBond", args: [BigInt(id)] }),
        ]);
        const p = unpackPrediction(pRaw);
        const tuple = dRaw as readonly [boolean, boolean, `0x${string}`, bigint, bigint, boolean, `0x${string}`, bigint, boolean];
        const d = { exists: tuple[0], proposedCreatorWins: tuple[1], proposer: tuple[2], proposerBond: tuple[3], proposedAt: Number(tuple[4]), challenged: tuple[5], challenger: tuple[6], challengerBond: tuple[7], finalized: tuple[8] };
        return { id, p, d, bond: bond as bigint };
      }));
      setRows(data);
    } finally { setLoading(false); }
  }

  useEffect(() => { refresh(); }, [publicClient]);

  const filtered = rows.filter(({ p }) => {
    if (filter === 'open') return p.status === 0
    if (filter === 'matched') return p.status === 1
    if (filter === 'resolved') return p.status === 4
    return true
  })

  const propose = (id: number, creatorWins: boolean, bond: bigint) =>
    write(ORACLE_CONTROLLER_ADDRESS, ORACLE_CONTROLLER_ABI, "proposeOutcome", [BigInt(id), creatorWins], bond);
  const challenge = (id: number, bond: bigint) =>
    write(ORACLE_CONTROLLER_ADDRESS, ORACLE_CONTROLLER_ABI, "challengeOutcome", [BigInt(id)], bond);
  const finalize = (id: number) =>
    write(ORACLE_CONTROLLER_ADDRESS, ORACLE_CONTROLLER_ABI, "finalizeIfUnchallenged", [BigInt(id)]);
  const resolveDispute = (id: number, creatorWins: boolean) =>
    write(ORACLE_CONTROLLER_ADDRESS, ORACLE_CONTROLLER_ABI, "resolveDispute", [BigInt(id), creatorWins]);
  const matchPrediction = (id: number, value: bigint) =>
    write(PREDICTIONS_ADDRESS, PREDICTIONS_ABI, "matchPrediction", [BigInt(id)], value);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        body { background: #06050e !important; font-family: 'Space Grotesk', sans-serif; color: #e8e6f0; }
      `}</style>
      <div style={{background:S.bg, minHeight:'100vh'}}>
        <Nav />

        {/* Hero */}
        <div style={{background:'linear-gradient(135deg, rgba(153,69,255,0.08) 0%, rgba(6,5,14,0) 60%)', borderBottom:`1px solid ${S.border}`, padding:'2.5rem 2rem'}}>
          <div style={{maxWidth:1200, margin:'0 auto'}}>
            <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1.5rem'}}>
              <div>
                <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'4px 14px',borderRadius:999,border:'1px solid rgba(153,69,255,0.4)',background:'rgba(153,69,255,0.1)',marginBottom:'1rem'}}>
                  <span style={{width:7,height:7,borderRadius:'50%',background:S.purple,boxShadow:`0 0 8px ${S.purple}`,display:'inline-block'}}/>
                  <span style={{fontSize:'.75rem',fontWeight:600,letterSpacing:'.1em',color:'#c084fc'}}>P2P PREDICTION MARKET</span>
                </div>
                <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(2.5rem,6vw,4.5rem)',letterSpacing:'.03em',lineHeight:.9,margin:'0 0 .8rem'}}>
                  PHUCKMC <span style={{color:'#c084fc'}}>PREDICTIONS</span>
                </h1>
                <p style={{color:S.muted, fontSize:'.95rem', maxWidth:520, lineHeight:1.6}}>
                  1% fees fuel buybacks • No match in 7 days → refund • Min bet: <strong style={{color:S.text}}>100 MON</strong>
                </p>
                {oracleParams && (
                  <div style={{display:'flex',gap:8,marginTop:'1rem',flexWrap:'wrap'}}>
                    {[
                      {l:'Min Bond', v: formatEther(oracleParams.minBondWei) + ' MON'},
                      {l:'Bond', v: oracleParams.bondBpsOfPot/100 + '% of pot'},
                      {l:'Challenge Window', v: Math.round(oracleParams.challengeWindow/3600) + 'h'},
                    ].map(({l,v}) => (
                      <div key={l} style={{padding:'6px 14px',borderRadius:999,border:`1px solid ${S.border}`,background:'rgba(255,255,255,0.04)',fontSize:'.8rem'}}>
                        <span style={{color:S.muted}}>{l}: </span><strong style={{color:S.text}}>{v}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
                <Link href="/predictions/how-it-works" style={{padding:'11px 20px',borderRadius:12,border:`1px solid ${S.border}`,background:S.card,color:S.text,textDecoration:'none',fontWeight:600,fontSize:'.9rem'}}>
                  How it works
                </Link>
                <Link href="/predictions/create" style={{padding:'11px 22px',borderRadius:12,background:S.purple,color:'#fff',textDecoration:'none',fontWeight:700,fontSize:'.9rem',boxShadow:'0 0 24px rgba(153,69,255,0.35)'}}>
                  + Create Prediction
                </Link>
                <button onClick={refresh} style={{padding:'11px 18px',borderRadius:12,border:`1px solid ${S.border}`,background:S.card,color:S.muted,fontWeight:600,fontSize:'.9rem',cursor:'pointer'}}>
                  {loading ? '⏳' : '↺'} {loading ? 'Loading…' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{borderBottom:`1px solid ${S.border}`, padding:'0 2rem'}}>
          <div style={{maxWidth:1200, margin:'0 auto', display:'flex', gap:0}}>
            {([['all','All'],['open','Open'],['matched','Matched'],['resolved','Resolved']] as const).map(([key,label]) => (
              <button key={key} onClick={() => setFilter(key)} style={{
                padding:'14px 20px', border:'none', background:'transparent', cursor:'pointer',
                fontWeight:600, fontSize:'.85rem', color: filter===key ? S.accent : S.muted,
                borderBottom: filter===key ? `2px solid ${S.accent}` : '2px solid transparent',
                transition:'all .15s'
              }}>
                {label}
                <span style={{marginLeft:6, padding:'2px 8px', borderRadius:999, background:'rgba(255,255,255,0.06)', fontSize:'.75rem', color:S.muted}}>
                  {key==='all' ? rows.length : rows.filter(r=>key==='open'?r.p.status===0:key==='matched'?r.p.status===1:r.p.status===4).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{maxWidth:1200, margin:'0 auto', padding:'2rem'}}>
          {loading && rows.length === 0 ? (
            <div style={{textAlign:'center', padding:'5rem', color:S.muted}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.5rem',letterSpacing:'.1em',marginBottom:8}}>LOADING PREDICTIONS</div>
              <div style={{fontSize:'.85rem'}}>Fetching from Monad…</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{textAlign:'center', padding:'5rem', border:`1px solid ${S.border}`, borderRadius:20, background:S.card}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'2rem', letterSpacing:'.08em', marginBottom:8, color:S.muted}}>
                {filter === 'all' ? 'NO PREDICTIONS YET' : `NO ${filter.toUpperCase()} PREDICTIONS`}
              </div>
              <div style={{color:S.muted, fontSize:'.9rem', marginBottom:'1.5rem'}}>
                {filter === 'all' ? 'Be the first to create a prediction!' : 'Try a different filter'}
              </div>
              {filter === 'all' && (
                <Link href="/predictions/create" style={{display:'inline-block',padding:'12px 24px',borderRadius:12,background:S.purple,color:'#fff',textDecoration:'none',fontWeight:700}}>
                  Create First Prediction
                </Link>
              )}
            </div>
          ) : (
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(480px, 1fr))', gap:'1.5rem'}}>
              {filtered.map(({ id, p, d, bond }) => (
                <PredictionCard
                  key={id} id={id} p={p} d={d} bond={bond}
                  oracleParams={oracleParams} isResolver={isResolver}
                  isConnected={isConnected} now={now}
                  onPropose={propose} onChallenge={challenge}
                  onFinalize={finalize} onResolve={resolveDispute}
                  onMatch={(id: number, val: bigint) => matchPrediction(id, val)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
