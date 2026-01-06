"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

function isE2EEnabled() {
  if (process.env.NEXT_PUBLIC_E2E === "true") return true;
  if (typeof window !== "undefined" && (window as any).__E2E__ === true) return true;
  return false;
}

export default function E2EConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (!isE2EEnabled()) return null;

  const injectedConnector =
    connectors.find((c) => c.id === "injected") ||
    connectors.find((c) => c.name.toLowerCase().includes("injected")) ||
    connectors[0];

  if (!isConnected) {
    return (
      <button
        type="button"
        data-testid="e2e-connect"
        className="rounded-md border border-black/10 px-3 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
        onClick={() => injectedConnector && connect({ connector: injectedConnector })}
        disabled={isPending || !injectedConnector}
      >
        {isPending ? "Connecting…" : "Connect"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div data-testid="e2e-connected-address" className="font-mono text-xs">
        {address}
      </div>
      <button
        type="button"
        data-testid="e2e-disconnect"
        className="rounded-md border border-black/10 px-2 py-1 text-xs hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
        onClick={() => disconnect()}
      >
        Disconnect
      </button>
    </div>
  );
}
