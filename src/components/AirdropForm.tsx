"use client";

import InputField from "@/components/ui/InputField";
import Spinner from "@/components/ui/Spinner";
import TextField from "@/components/ui/TextField";
import { useEffect, useMemo, useState } from "react";
import { tsenderAbi, erc20Abi, chainsToTSender } from "@/constants";
import { useChainId, useConfig, useConnection, useWriteContract, useReadContracts, useWaitForTransactionReceipt } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { toast } from "react-toastify";
import { calculateTotal, formatTokenAmount } from "@/utils";

interface AirdropFormProps {
    isUnsafeMode: boolean
    onModeChange: (unsafe: boolean) => void
}

export default function AirdropForm({ isUnsafeMode, onModeChange }: AirdropFormProps) {
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


        async function handleSubmit(e?: React.FormEvent) {
            e?.preventDefault();
      const contractType = isUnsafeMode ? "no_check" : "tsender"
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

  function getButtonContent() {
        if (isPending)
            return (
                <div className="flex items-center justify-center gap-2 w-full">
                    <Spinner size={20} />
                    <span>Confirming in wallet...</span>
                </div>
            )
        if (isConfirming)
            return (
                <div className="flex items-center justify-center gap-2 w-full">
                    <Spinner size={20} />
                    <span>Waiting for transaction to be included...</span>
                </div>
            )
        if (error || isError) {
            console.log(error)
            return (
                <div className="flex items-center justify-center gap-2 w-full">
                    <span>Error, see console.</span>
                </div>
            )
        }
        if (isConfirmed) {
            return "Transaction confirmed."
        }
        return isUnsafeMode ? "Send Tokens (Unsafe)" : "Send Tokens"
    }

    useEffect(() => {
        const savedTokenAddress = localStorage.getItem('tokenAddress')
        const savedRecipients = localStorage.getItem('recipients')
        const savedAmounts = localStorage.getItem('amounts')

        if (savedTokenAddress) setTokenAddress(savedTokenAddress)
        if (savedRecipients) setRecipients(savedRecipients)
        if (savedAmounts) setAmounts(savedAmounts)
    }, [])

    useEffect(() => {
        localStorage.setItem('tokenAddress', tokenAddress)
    }, [tokenAddress])

    useEffect(() => {
        localStorage.setItem('recipients', recipients)
    }, [recipients])

    useEffect(() => {
        localStorage.setItem('amounts', amounts)
    }, [amounts])

    useEffect(() => {
        if (tokenAddress && total > 0 && tokenData?.[2]?.result as number !== undefined) {
            const userBalance = tokenData?.[2].result as number;
            setHasEnoughTokens(userBalance >= total);
        } else {
            setHasEnoughTokens(true);
        }
    }, [tokenAddress, total, tokenData]);

  return (
    <form className="w-full" onSubmit={(e) => void handleSubmit(e)}>
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

          <div className="bg-white border border-zinc-300 rounded-lg p-4">
              <h3 className="text-sm font-medium text-zinc-900 mb-3">Transaction Details</h3>
              <div className="space-y-2">
                  <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-600">Token Name:</span>
                      <span className="font-mono text-zinc-900">
                          {tokenData?.[1]?.result as string}
                      </span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-600">Amount (wei):</span>
                      <span className="font-mono text-zinc-900">{total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-600">Amount (tokens):</span>
                      <span className="font-mono text-zinc-900">
                          {formatTokenAmount(total, tokenData?.[0]?.result as number)}
                      </span>
                  </div>
              </div>
          </div>

                    <button
                        type="submit"
            className={`cursor-pointer flex items-center justify-center w-full py-3 rounded-[9px] text-white transition-colors font-semibold relative border ${isUnsafeMode
                ? "bg-red-500 hover:bg-red-600 border-red-500"
                : "bg-blue-500 hover:bg-blue-600 border-blue-500"
                } ${!hasEnoughTokens && tokenAddress ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isPending || (!hasEnoughTokens && tokenAddress !== "")}
        >
            {/* Gradient */}
            <div className="absolute w-full inset-0 bg-gradient-to-b from-white/25 via-80% to-transparent mix-blend-overlay z-10 rounded-lg" />
            {/* Inner shadow */}
            <div className="absolute w-full inset-0 mix-blend-overlay z-10 inner-shadow rounded-lg" />
            {/* White inner border */}
            <div className="absolute w-full inset-0 mix-blend-overlay z-10 border-[1.5px] border-white/20 rounded-lg" />
            {isPending || error || isConfirming
                ? getButtonContent()
                : !hasEnoughTokens && tokenAddress
                    ? "Insufficient token balance"
                    : isUnsafeMode
                        ? "Send Tokens (Unsafe)"
                        : "Send Tokens"}
        </button>
        </div>
      </div>
    </form>
  );
}
