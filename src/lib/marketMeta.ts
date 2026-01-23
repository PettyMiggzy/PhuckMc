import { keccak256, toHex } from "viem";

export type MarketMeta = {
  marketId: `0x${string}`;
  title: string;
  outcomeA: string; // maps to creatorSide=Higher
  outcomeB: string; // maps to creatorSide=Lower
};

const KEY = "phuckmc_market_meta_v1";

function readAll(): Record<string, MarketMeta> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeAll(obj: Record<string, MarketMeta>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(obj));
}

export function computeMarketId(title: string, outcomeA: string, outcomeB: string) {
  const s = `${title.trim()}||${outcomeA.trim()}||${outcomeB.trim()}`;
  return keccak256(toHex(s)) as `0x${string}`;
}

export function saveMarketMeta(meta: MarketMeta) {
  const all = readAll();
  all[meta.marketId.toLowerCase()] = meta;
  writeAll(all);
}

export function getMarketMeta(marketId: `0x${string}`): MarketMeta | null {
  const all = readAll();
  return all[marketId.toLowerCase()] || null;
}
