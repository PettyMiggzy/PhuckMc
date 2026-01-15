export const PHUCK = {
  name: "PHUCKMC",
  ca: "0x148a3a811979e5BF8366FC279B2d67742Fe17777",
  buyUrl: "https://nad.fun/tokens/0x148a3a811979e5BF8366FC279B2d67742Fe17777",
  tgUrl: "https://t.me/PhuckMc",
};

export const mock = {
  // staking stats (fake now, real later)
  totalStaked: 384_220_000,        // tokens
  totalStakers: 2_417,
  rewardsPool: 12_840_000,         // tokens
  apr: 84.2,                       // %
  yourStaked: 10_000_000,          // tokens (UI only)
  yourRewards: 214_500,            // tokens (UI only)

  // swap stats (fake now, real later)
  phuckSwapFeeBps: 30,             // 0.30%
  fees24h: 38_200,                 // $ value
  buyback24h: 19_100,              // $ value
  rewards24h: 19_100,              // $ value

  // vibe stats (fake)
  holders: 8_942,
  circulatingSupply: 1_000_000_000,
  lastBuyback: "2h ago",
  nextRewardDrop: "in 5h 12m",
};
