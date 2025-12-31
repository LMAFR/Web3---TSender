"use client";

import InputField from "@/components/ui/InputField";
import TextField from "@/components/ui/TextField";
import { useState } from "react";

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [recipients, setRecipients] = useState("");
  const [amounts, setAmounts] = useState("");
  const [memo, setMemo] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    console.log("Submitting form with data:", {
      tokenAddress,
      recipients,
      amounts,
      memo,
    });
  }

  return (
    <form className="w-full" onSubmit={handleSubmit}>
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
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
          />

          <TextField
            id="amounts"
            name="amounts"
            label="Amounts"
            placeholder="100,200,300,..."
            rows={4}
            value={amounts}
            onChange={(e) => setAmounts(e.target.value)}
          />

          <TextField
            id="memo"
            name="memo"
            label="Memo"
            placeholder="Optional note"
            rows={3}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
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
