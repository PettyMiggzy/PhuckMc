"use client";

import * as React from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  "https://rpc.ankr.com/monad_mainnet/26f6f2883def29abe34433943f7ad734e312ded1e3c25da0a2f31a5ed92150b8";

const WC_PROJECT_ID =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID || "cc1358b5e311a1f844c1d6482633c78d";

const monad = {
  id: 143,
  name: "Monad",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: [RPC_URL] },
    public:  { http: [RPC_URL] },
  },
} as const;

const config = createConfig({
  chains: [monad],
  connectors: [
    injected({ shimDisconnect: true }),
    walletConnect({ projectId: WC_PROJECT_ID }),
  ],
  transports: {
    [monad.id]: http(RPC_URL),
  },
  ssr: false,
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
