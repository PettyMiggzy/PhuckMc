export const runtime = "nodejs";

export async function GET() {
  // TEMP “LIVE” DATA PIPELINE
  // Replace this later with:
  // - onchain reads (viem)
  // - indexer
  // - your backend
  // But this ships the premium staking page TODAY.

  const data = {
    totalStakedAll: "384,220,000",
    rewardsPool: "12,840,000",
    activeStakers: "8,942",
    lockedSupplyPct: "42",
    buybackWallet: "0xC77A81C4Cf1Dce5006141996D1c6B84E16621aD6",

    // Per-wallet (until contract exists, UI shows “—” if not connected)
    userStake: "12,000,000",
    pendingRewards: "482,390",
    timeWeight: "1.68",
    lockEndsAtUnix: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 38 // ~38 days from now
  };

  return Response.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
