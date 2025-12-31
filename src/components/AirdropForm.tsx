"use client";

import InputField from "@/components/ui/InputField";
import TextField from "@/components/ui/TextField";
import { useMemo, useState } from "react";
import { tsenderAbi, erc20Abi, chainsToTSender } from "@/constants";
import { useChainId, useConfig, useConnection } from "wagmi";
import { readContract } from "@wagmi/core";
import { toast } from "react-toastify";
import { calculateTotal } from "@/utils/calculateTotal/calculateTotal";

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [recipients, setRecipients] = useState("");
  const [amounts, setAmounts] = useState("");
  const [memo, setMemo] = useState("");
  // Use wagmi to get chain ID for the chain that has been connected to by the user.
  const chainId = useChainId();
  // As we wrapped our app in Providers and providers includes the config we need, we can use useConfig to get it. We could also directly import the config from rainbowKitConfig.tsx but wagmi already provides it to us this way, so we are going to use wagmi way.
  const config = useConfig(); 
  // use connected account:
  const account = useConnection();
  // We will use useMemo to calculate the total amount to be airdropped whenever the amounts state changes (avoiding unnecessary recalculationswhen, for example, other field changes).   
  const total: number = useMemo(() => calculateTotal(amounts), [amounts]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // 1a. If already approved, move to step 2.
    // 1b. Approve our tsender contract to send our tokens.
    // 2. Call the airdrop function on the tsender contract.
    // 3. Wait for the transaction to be mined.
    // Use chainsToTSender to get the TSender address for the current chain (property tsender in constants.ts. We are not going to use no_check property here).
    const tsenderAdress = chainsToTSender[chainId]["tsender"];
    const approvedAmount = await getApprovedAmount(tsenderAdress);
    toast.info(`Approved amount: ${approvedAmount}`);
  }

    async function getApprovedAmount(tsenderAdress: string | null): Promise<number> {
        if (!tsenderAdress) {
            toast.error("TSender address not found for this chain");
            return 0;
        }

        // We do not use useReadContract here because we do not need to store the result as a state nor refresh the page when we run the function or similar. We just need to read a contract and get the result.
        const response = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "allowance",
            args: [account.address, tsenderAdress as `0x${string}`],
        });

        if (response) {
            return response as number;
        } else {
            console.log(response)
            toast.error("Failed to fetch approved amount");
        }

        return 0;
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
