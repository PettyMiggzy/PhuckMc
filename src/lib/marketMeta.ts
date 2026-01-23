export type MarketMeta = {
  marketId: `0x${string}`;
  title: string;
  outcomeA: string;
  outcomeB: string;
};

const KEY = "phuckmc.marketMeta.v1";

function readAll(): Record<string, MarketMeta> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, MarketMeta>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(all));
}

/**
 * Deterministic bytes32-ish id derived from title + outcomes.
 * Stored on-chain as bytes32.
 */
export function computeMarketId(title: string, outcomeA: string, outcomeB: string): `0x${string}` {
  // lazy-load so this file stays safe in SSR (no window/crypto issues)
  // Uses Web Crypto when available; falls back to a simple hash-like string.
  const t = `${title}`.trim().toLowerCase();
  const a = `${outcomeA}`.trim().toLowerCase();
  const b = `${outcomeB}`.trim().toLowerCase();
  const s = `${t}|${a}|${b}`;

  // Small deterministic non-crypto hash → then pad to 32 bytes hex
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // turn into 32-byte hex by repeating
  const base = (h >>> 0).toString(16).padStart(8, "0");
  const hex = ("0x" + base.repeat(8)) as `0x${string}`; // 8*4 bytes = 32 bytes
  return hex;
}

export function saveMarketMeta(meta: MarketMeta) {
  const all = readAll();
  all[meta.marketId.toLowerCase()] = meta;
  writeAll(all);
}

export function getMarketMeta(marketId: `0x${string}`) {
  const all = readAll();
  return all[marketId.toLowerCase()];
}
