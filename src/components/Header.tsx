"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
  return (
    <header className="w-full border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-black text-white dark:bg-white dark:text-black">
            T
          </span>
          <span>TSender</span>
        </Link>

        <div className="flex items-center">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
