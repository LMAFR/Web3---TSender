"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { anvil, zksync } from "wagmi/chains";

const isE2E = process.env.NEXT_PUBLIC_E2E === "true";

export default isE2E
  ? createConfig({
      chains: [anvil],
      connectors: [injected()],
      transports: {
        [anvil.id]: http(process.env.NEXT_PUBLIC_ANVIL_RPC_URL || "http://127.0.0.1:8545"),
      },
      ssr: false,
    })
  : getDefaultConfig({
      appName: "TSender",
      projectId: (() => {
        const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
        if (!projectId) {
          throw new Error(
            "Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID. Set it in .env.local (or run E2E mode with NEXT_PUBLIC_E2E=true).",
          );
        }
        return projectId;
      })(),
      chains: [anvil, zksync],
      // Ensure WalletConnect storage is handled safely during SSR.
      ssr: false,
    });