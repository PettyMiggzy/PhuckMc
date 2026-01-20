"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ethers } from "ethers";

// ====== Constants ======
const CHAIN_ID = 143;
const NAD_BONDING_ROUTER = "0x6F6B8F1a20703309951a5127c45B49b1CD981A22"; // Bonding Curve Router
const LENS = "0x7e78A8DE94f21804F7a17F4E8BF9EC2c872187ea";
const FEE_ROUTER = "0x60832a12f12a971Aa530beb671baB2991d4afB7f";
const PHUCKMC = "0x148a3a811979e5bf8366fc279b2d67742fe17777";

// ====== Minimal ABIs ======
const feeRouterAbi = [
  "function buyVia(address targetRouter,address tokenOut,uint256 deadline,bytes routerCalldata) payable",
] as const;

const lensAbi = [
  "function getAmountOut(address _token,uint256 _amountIn,bool _isBuy) view returns (address router,uint256 amountOut)",
] as const;

export default function SwapPage() {
  const [tokenOut, setTokenOut] = useState<string>(PHUCKMC);
  const [monIn, setMonIn] = useState<string>("0.1");
  const [status, setStatus] = useState<string>("");

  const deadline = useMemo(() => Math.floor(Date.now() / 1000) + 60 * 15, []);

  async function ensureMonad() {
    if (!(window as any).ethereum) throw new Error("No wallet found");
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const net = await provider.getNetwork();
    if (Number(net.chainId) !== CHAIN_ID) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x8f" }], // 143
        });
      } catch (e) {
        // If chain not added, user must add Monad manually in MetaMask
        throw new Error("Please switch to Monad (Chain 143) in your wallet.");
      }
    }
    return provider;
  }

 
