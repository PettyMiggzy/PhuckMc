# PhuckMC Arcade — Drop-in Games

6 fully-playable canvas games plus arcade hub. All use your sloth sprite art. Self-contained, no extra dependencies.

## What's included

```
public/sprites/                 ← drop these into /public/sprites/
  banner-gun.png
  buyback-run.png
  coin-purple.png
  coin-spin.png
  diamond-hands.png
  flap.png
  hero-rip.png
  jump-fly.png
  pump-victory.png
  sloth-angry.png
  sloth-pump.png

src/lib/
  leaderboard.ts                ← shared leaderboard (localStorage / Supabase)

src/app/play/
  page.tsx                      ← arcade hub (replaces existing)
  chart/page.tsx                ← Phuck the Chart (Flappy Bird)
  runner/page.tsx               ← Buyback Runner
  moon/page.tsx                 ← Moon Mission
  diamond/page.tsx              ← Diamond Hands
  pump/page.tsx                 ← Pump or Dump
  plinko/page.tsx               ← Liquidity Plinko
```

## How to install (no terminal needed)

### Option A — GitHub web UI (phone or desktop)
1. Go to `github.com/PettyMiggzy/PhuckMc`
2. For each file in this folder:
   - Click **Add file → Upload files** OR navigate to the matching folder and click **Add file → Create new file**
   - Paste contents (or drag the file)
   - Commit
3. Vercel auto-deploys when you push to `main`

### Option B — Codespace
1. Open the repo in Codespace
2. Drag the `public/sprites/` folder and `src/` files into matching paths
3. Use the "Source Control" panel: stage all → commit → sync (push)

### Option C — Local clone
```
git clone https://github.com/PettyMiggzy/PhuckMc
cd PhuckMc
# copy this folder's contents over preserving paths
git add . && git commit -m "feat: arcade with 6 games" && git push
```

## Verify locally

```bash
npm install
npm run dev
# open http://localhost:3000/play
```

You should see the arcade hub. Click any game tile.

## Leaderboards

Default: **localStorage** — top 10 saved per game per browser. Works immediately.

To upgrade to **global leaderboards** with Supabase (free tier, 5 minutes):

1. Sign in to your Supabase account → New project (use your existing org's free slot)
2. SQL Editor → run:

```sql
create table scores (
  id uuid primary key default gen_random_uuid(),
  game text not null,
  name text not null,
  score int not null,
  created_at timestamptz default now()
);
create index on scores(game, score desc);
alter table scores enable row level security;
create policy "anyone reads" on scores for select using (true);
create policy "anyone writes" on scores for insert with check (true);
```

3. Settings → API → copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. In Vercel project → Settings → Environment Variables → add both
5. Redeploy

That's it. No code changes needed. The leaderboard library auto-detects the env vars and switches over.

### Free tier notes
- Free Supabase = 2 projects per org, 500MB DB, 5GB egress/month
- Free projects auto-pause after 7 days of zero traffic — restore is one click
- For the volume PhuckMC will see, free tier is fine indefinitely

## Game specs

| Game | Controls | Sprite |
|------|----------|--------|
| Phuck the Chart | tap / space = flap | `flap.png` |
| Buyback Runner | tap / space = jump, swipe down = duck | `buyback-run.png` |
| Moon Mission | ← → arrows / tap left or right side | `jump-fly.png` |
| Diamond Hands | hold press = HODL, tap paper hands | `diamond-hands.png` |
| Pump or Dump | tap green pumps, avoid red | `sloth-pump.png` + `sloth-angry.png` |
| Liquidity Plinko | tap top = drop coin | `coin-spin.png` |

All games:
- Touch + keyboard input
- Top 10 leaderboard
- Game-over screen with name submission
- Mobile-responsive canvas
- Use the project's existing color palette + fonts
