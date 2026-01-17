import { MONAD } from "./monad";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function switchToMonad(): Promise<{ ok: boolean; reason?: string }> {
  const eth = window.ethereum;
  if (!eth?.request) return { ok: false, reason: "No wallet found" };

  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: MONAD.chainIdHex }],
    });
    return { ok: true };
  } catch (err: any) {
    // 4902 = chain not added
    if (err?.code === 4902) {
      // DO NOT auto-add (causes scam warning). Tell the user.
      return { ok: false, reason: "Monad network not added in wallet" };
    }
    return { ok: false, reason: err?.message || "Failed to switch network" };
  }
}
