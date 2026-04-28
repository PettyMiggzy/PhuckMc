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
