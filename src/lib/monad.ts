export const MONAD = {
  chainId: 10143, // Monad mainnet chain id (if you use a different one, change it)
  chainIdHex: "0x279f",
  chainName: "Monad",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: ["https://rpc.monad.xyz"], // use THIS, not rpc.monad.xyz
  blockExplorerUrls: ["https://monadscan.com"], // if you use a different explorer, change it
} as const;
