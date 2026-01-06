import { test, expect } from "@playwright/test";
import { createPublicClient, http } from "viem";
import { anvil } from "viem/chains";
import { ethereumMockInitScript } from "../e2e/ethereumMock";
import { anvil1Address, anvil2Address, mockTokenAddress } from "../test-constants";

const rpcUrl = process.env.NEXT_PUBLIC_ANVIL_RPC_URL || "http://127.0.0.1:8545";
const chainIdHex = "0x7a69"; // 31337

const erc20BalanceOfAbi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript({
    content: ethereumMockInitScript({
      rpcUrl,
      chainIdHex,
      accounts: [anvil1Address],
    }),
  });
});

test("connect wallet shows address", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Please connect your wallet.")).toBeVisible();

  await page.getByTestId("e2e-connect").click();
  await expect(page.getByTestId("e2e-connected-address")).toHaveText(anvil1Address);
});

test("send tokens changes receiver balance", async ({ page }) => {
  test.setTimeout(120_000);
  const client = createPublicClient({
    chain: anvil,
    transport: http(rpcUrl),
  });

  const before = (await client.readContract({
    address: mockTokenAddress as `0x${string}`,
    abi: erc20BalanceOfAbi,
    functionName: "balanceOf",
    args: [anvil2Address as `0x${string}`],
  })) as bigint;

  await page.goto("/");
  await page.getByTestId("e2e-connect").click();
  await expect(page.getByTestId("e2e-connected-address")).toHaveText(anvil1Address);

  await page.getByLabel("Token address").fill(mockTokenAddress);
  await page.getByLabel("Recipients").fill(anvil2Address);
  // Use a JS-safe integer amount to avoid float precision issues in the app.
  await page.getByLabel("Amounts").fill("100");

  await page.getByRole("button", { name: "Send Tokens" }).click();
  // The UI confirmation text is not guaranteed (depends on hook timing across approve+airdrop).
  // Deterministic assertion: receiver balance increases by the expected amount on-chain.
  await expect
    .poll(
      async () => {
        const after = (await client.readContract({
          address: mockTokenAddress as `0x${string}`,
          abi: erc20BalanceOfAbi,
          functionName: "balanceOf",
          args: [anvil2Address as `0x${string}`],
        })) as bigint;
        return after - before;
      },
      { timeout: 90_000 },
    )
    .toBe(BigInt(100));
});