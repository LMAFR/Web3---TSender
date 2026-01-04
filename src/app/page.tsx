"use client";

import { HomeContent } from "@/components/HomeContent";
import { useConnection } from "wagmi";

export default function Home() {
  const { isConnected } = useConnection();
  return (
  <main className="px-8 py-4">
        {!isConnected ? (
          <div>Please connect your wallet.</div>
        ) : (
          <div>
            <HomeContent />
          </div>
        )}
      </main>
  );
}
