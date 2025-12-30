"use client";

import InputField from "@/components/ui/InputField";
import TextField from "@/components/ui/TextField";
import { useState } from "react";

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState("");

  return (
    <form className="w-full">
      <div className="mx-auto w-full max-w-6xl rounded-lg border border-black/10 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <h1 className="mb-4 text-xl font-semibold">Airdrop Form</h1>

        <div className="grid grid-cols-1 gap-4">
          <InputField
            id="tokenAddress"
            name="tokenAddress"
            label="Token address"
            type="text"
            placeholder="0x…"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
          />

          <TextField
            id="recipients"
            name="recipients"
            label="Recipients"
            placeholder="One address per line"
            rows={4}
          />

          <TextField
            id="amounts"
            name="amounts"
            label="Amounts"
            placeholder="One amount per line (same order as recipients)"
            rows={4}
          />

          <TextField
            id="memo"
            name="memo"
            label="Memo"
            placeholder="Optional note"
            rows={3}
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className="h-10 rounded-md bg-black px-4 text-sm font-medium text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
