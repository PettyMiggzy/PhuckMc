"use client";

import "@rainbow-me/rainbowkit/styles.css";
import * as React from "react";
import { WagmiProvider, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

/* ---------- MONAD CHAIN ---------- */
const monad = defineChain({
  id: 1337, // Monad testnet / placeholder (safe for now)
  name: "Monad",
  nativeCurrency: {
    name: "MON",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://explorer.monad.xyz",
    },
  },
});

/* ---------- WAGMI CONFIG ---------- */
const config = getDefaultConfig({
  appName: "PHUCKMC",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
  chains: [monad],
  transports: {
    [monad.id]: http("https://rpc.monad.xyz"),
  },
  ssr: true,
});

const queryClient = new QueryClient();

/* ---------- PROVIDER ---------- */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
