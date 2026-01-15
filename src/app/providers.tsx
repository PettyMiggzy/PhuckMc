"use client";

import * as React from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { injected, walletConnect } from "wagmi/connectors";
import "@rainbow-me/rainbowkit/styles.css";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "";
const rpcUrl = process.env.NEXT_PUBLIC_MONAD_RPC ?? "https://rpc.monad.xyz";

// NOTE: if Monad chainId differs in your wallet/network, change id here.
const monad = {
  id: 20143,
  name: "Monad",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
  blockExplorers: { default: { name: "MonadScan", url: "https://monadscan.com" } },
} as const;

const config = createConfig({
  chains: [monad],
  transports: {
    [monad.id]: http(rpcUrl),
  },
  connectors: [
    injected(),
    walletConnect({
      projectId,
      metadata: {
        name: "PHUCKMC",
        description: "PHUCKMC Staking",
        url: "https://phuckmc.com",
        icons: ["https://phuckmc.com/icon.png"],
      },
    }),
  ],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#7c3aed",
            accentColorForeground: "white",
            borderRadius: "large",
          })}
          initialChain={monad}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
