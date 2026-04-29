// Leaderboard abstraction layer.
// Works with localStorage out-of-the-box. Drop in NEXT_PUBLIC_SUPABASE_URL +
// NEXT_PUBLIC_SUPABASE_ANON_KEY env vars to upgrade to global leaderboards.
//
// Supabase setup (when ready):
// 1) Create new project at supabase.com (free tier, allows 2 projects per org)
// 2) In SQL editor, run:
//      create table scores (
//        id uuid primary key default gen_random_uuid(),
//        game text not null,
//        name text not null,
//        score int not null,
//        created_at timestamptz default now()
//      );
//      create index on scores(game, score desc);
//      alter table scores enable row level security;
//      create policy "anyone reads" on scores for select using (true);
//      create policy "anyone writes" on scores for insert with check (true);
// 3) Settings -> API -> copy URL + anon public key into .env.local:
//      NEXT_PUBLIC_SUPABASE_URL=...
//      NEXT_PUBLIC_SUPABASE_ANON_KEY=...
// 4) npm install @supabase/supabase-js
// 5) Done — leaderboards become global automatically.

export type ScoreRow = { name: string; score: number; created_at?: string }

const URL  = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL  : undefined
const KEY  = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined
const HAS_SUPABASE = !!(URL && KEY)

const lsKey = (game: string) => `phuck_lb_${game}`

async function supabaseFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: KEY!,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) throw new Error(`supabase ${res.status}`)
  return res
}

export async function getTop(game: string, limit = 10): Promise<ScoreRow[]> {
  if (HAS_SUPABASE) {
    try {
      const r = await supabaseFetch(
        `scores?game=eq.${encodeURIComponent(game)}&order=score.desc&limit=${limit}`,
        { headers: { Prefer: 'count=none' } }
      )
      return await r.json()
    } catch {
      // fall through to local
    }
  }
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(lsKey(game))
  const list: ScoreRow[] = raw ? JSON.parse(raw) : []
  return list.slice(0, limit)
}

export async function submitScore(game: string, name: string, score: number) {
  const clean = (name || 'anon').slice(0, 16).replace(/[^\w \-.]/g, '') || 'anon'
  if (HAS_SUPABASE) {
    try {
      await supabaseFetch('scores', {
        method: 'POST',
        body: JSON.stringify({ game, name: clean, score }),
      })
      return
    } catch {
      // fall through to local
    }
  }
  if (typeof window === 'undefined') return
  const raw = localStorage.getItem(lsKey(game))
  const list: ScoreRow[] = raw ? JSON.parse(raw) : []
  list.push({ name: clean, score, created_at: new Date().toISOString() })
  list.sort((a, b) => b.score - a.score)
  localStorage.setItem(lsKey(game), JSON.stringify(list.slice(0, 50)))
}

export function isGlobal() {
  return HAS_SUPABASE
}
