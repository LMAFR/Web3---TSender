"use client";

import InputField from "@/components/ui/InputField";
import TextField from "@/components/ui/TextField";
import { useMemo, useState } from "react";
import { tsenderAbi, erc20Abi, chainsToTSender } from "@/constants";
import { useChainId, useConfig, useConnection, useWriteContract, useReadContracts, useWaitForTransactionReceipt } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { toast } from "react-toastify";
import { calculateTotal } from "@/utils";

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState("")
    const [recipients, setRecipients] = useState("")
    const [amounts, setAmounts] = useState("")
    const config = useConfig()
    const account = useConnection()
    const chainId = useChainId()
    const { data: tokenData } = useReadContracts({
        contracts: [
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "decimals",
            },
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "name",
            },
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "balanceOf",
                args: [account.address],
            },
        ],
    })
    const [hasEnoughTokens, setHasEnoughTokens] = useState(true)

    const { data: hash, isPending, error, writeContractAsync } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed, isError } = useWaitForTransactionReceipt({
        confirmations: 1,
        hash,
    })

    const total: number = useMemo(() => calculateTotal(amounts), [amounts])


    async function handleSubmit() {
      const contractType = "tsender"
      const tSenderAddress = chainsToTSender[chainId][contractType]
      const result = await getApprovedAmount(tSenderAddress)

      if (result < total) {
          const approvalHash = await writeContractAsync({
              abi: erc20Abi,
              address: tokenAddress as `0x${string}`,
              functionName: "approve",
              args: [tSenderAddress as `0x${string}`, BigInt(total)],
          })
          const approvalReceipt = await waitForTransactionReceipt(config, {
              hash: approvalHash,
          })

          console.log("Approval confirmed:", approvalReceipt)

          await writeContractAsync({
              abi: tsenderAbi,
              address: tSenderAddress as `0x${string}`,
              functionName: "airdropERC20",
              args: [
                  tokenAddress,
                  // Comma or new line separated
                  recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                  amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                  BigInt(total),
              ],
          })
      } else {
          await writeContractAsync({
              abi: tsenderAbi,
              address: tSenderAddress as `0x${string}`,
              functionName: "airdropERC20",
              args: [
                  tokenAddress,
                  // Comma or new line separated
                  recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                  amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                  BigInt(total),
              ],
          },)
      }

  }

  async function getApprovedAmount(tSenderAddress: string | null): Promise<number> {
      if (!tSenderAddress) {
          alert("This chain only has the safer version!")
          return 0
      }
      const response = await readContract(config, {
          abi: erc20Abi,
          address: tokenAddress as `0x${string}`,
          functionName: "allowance",
          args: [account.address, tSenderAddress as `0x${string}`],
      })
      return response as number
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

          {/* <TextField
            id="memo"
            name="memo"
            label="Memo"
            placeholder="Optional note"
            rows={3}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          /> */}

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
