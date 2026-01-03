This project consists of an airdrop form that allows the user to send tokens from his connected account to another account (recipient).

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites

- Node.js (recommended: latest LTS)
- A package manager: `pnpm` (recommended), `npm`, or `yarn`

### WalletConnect Project ID

This project uses RainbowKit/Wagmi and expects a WalletConnect Project ID.

Create a `.env.local` file at the repo root:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID
```

## Running the app locally

Install dependencies:

```bash
pnpm install
# or: npm install
```

Start the dev server:

```bash
pnpm dev
# or: npm run dev
```

Then open:

- http://localhost:3000

## Running Anvil locally (local blockchain)

This app is configured to include the `anvil` chain. If you see errors like:

- `POST http://127.0.0.1:8545/ net::ERR_CONNECTION_REFUSED`

it means Anvil is not running.

### Install Foundry (macOS)

Foundry includes `anvil`.

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Start Anvil

In a separate terminal:

```bash
anvil
```

Or:

```bash
anvil --load-state ./tsender-deployed.json --port 8545 --host 127.0.0.1
```

Defaults:

- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`

Keep Anvil running while you use the app.

### Optional: Custom port

```bash
anvil --port 8545
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
