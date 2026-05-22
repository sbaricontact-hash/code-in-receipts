# Code-In Receipts for Web Apps

A small Next.js starter showing how web, SaaS and AI apps can create permanent, verifiable receipt proofs using **IQ Code-In** on **Solana devnet**.

It uses the official IQ Labs SDK:

```bash
@iqlabs-official/solana-sdk
```

This is not a competing SDK. It is a simple adoption template that shows one reusable pattern:

```txt
App event happens
  ↓
Create a hash-only proof payload
  ↓
Write the proof to IQ Code-In
  ↓
Store a local receipt index
  ↓
Show a public verification page
```

---

## What this demo includes

- Next.js App Router
- Real IQ Code-In writes on Solana devnet
- Local SQLite receipt index by default (optional Postgres for hosted deployment)
- Public verification pages
- Hash-only privacy-safe defaults
- Four demo proof patterns:
  - Payment receipt
  - AI provenance
  - Certificate receipt
  - Decentralized publishing proof

---

## Quick start

About five minutes locally — no external database account required.

### 1. Install dependencies

```bash
npm install
```

### 2. Create your environment file

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
copy .env.example .env.local
```

### 3. Add your devnet signer

Create or use a **devnet-only** Solana keypair.

Add one of these to `.env.local`:

```env
SOLANA_SIGNER_SECRET_KEY=[1,2,3,...]
```

or:

```env
SOLANA_SIGNER_SECRET_KEY_BASE58=your_base58_private_key
```

Your `.env.local` should look roughly like this:

```env
CODEIN_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
CODEIN_MODE=real
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_PROVIDER=sqlite
DATABASE_PATH=./data/code-in-receipts.sqlite

SOLANA_SIGNER_SECRET_KEY=
SOLANA_SIGNER_SECRET_KEY_BASE58=
```

Fund the signer public key with a small amount of devnet SOL.

You can print the signer address with:

```bash
npm run signer:address
```

---

## Run the demo

```bash
npm run dev
```

Open:

```txt
http://localhost:3000/demo
```

Click one of the demo buttons:

- Create payment receipt
- Create AI provenance receipt
- Create certificate receipt
- Create publishing proof

Each button creates a real IQ Code-In devnet record and gives you a verification page.

---

## Verify it works

Run:

```bash
npm run smoke:receipt
```

A successful real Code-In write should show:

```txt
[RealCodeInAdapter] REAL_IQ_CODEIN_PATH active
[RealCodeInAdapter] REAL_IQ_CODEIN_PATH succeeded
```

You should also see:

```txt
receiptId: ...
txSignature: ...
explorer: https://explorer.solana.com/tx/...?cluster=devnet
```

---

## Demo proof patterns

The starter uses one shared receipt envelope:

```ts
{
  version: "1.0",
  appId: string,
  type: string,
  reference: string,
  createdAt: string,
  payloadHash: string,
  privacyMode: "hash_only",
  metadata: object
}
```

Each proof type adds different metadata.

### Payment receipt

Shows how a SaaS app could prove a checkout, order or billing event without storing private customer details on-chain.

### AI provenance

Shows how an AI app could timestamp and verify generated output, prompt hashes or model metadata.

### Certificate receipt

Shows how a course, credential or attestation could be verified publicly without exposing recipient data.

### Decentralized publishing proof

Shows how Code-In can support Web3 internet use cases by registering content commitments, author hashes and publication proofs.

---

## API

### Create a receipt

```http
POST /api/receipts/create
```

Example body:

```json
{
  "appId": "my-app",
  "type": "payment_receipt",
  "reference": "order-123",
  "payloadHash": "abc123...",
  "privacyMode": "hash_only",
  "metadata": {
    "productName": "Premium Plan",
    "amount": "29.99",
    "currency": "GBP"
  }
}
```

Example response:

```json
{
  "ok": true,
  "receiptId": "...",
  "receipt": {},
  "codeIn": {
    "codeInRecordId": "...",
    "txSignature": "...",
    "gatewayUrl": null,
    "status": "confirmed"
  },
  "verifyUrl": "http://localhost:3000/verify/..."
}
```

### Verify a receipt

```http
GET /api/receipts/verify/[receiptId]
```

Returns the stored receipt and Code-In write result from the receipt lookup index.

---

## Why a database is used

**IQ Code-In** stores the permanent proof on Solana.

This app also keeps a small **lookup index** in a database so pages like `/verify/[receiptId]` load quickly without scanning the chain each time. A typical row links:

```txt
receiptId → txSignature → payloadHash → verification page data
```

That index is not the source of truth for the proof — the on-chain Code-In record is. You can swap the index layer later (SQLite file, Postgres, or your existing app database).

---

## Database mode

### Local mode (default)

- **SQLite** is the default (`DATABASE_PROVIDER=sqlite`).
- No external database account is needed.
- Good for cloning, learning, demos, and local testing.
- Stores only the receipt lookup index in `./data/code-in-receipts.sqlite`.

### Hosted mode (optional)

- Serverless hosts such as **Vercel** should use a **persistent** database for the index (SQLite on ephemeral filesystems is not reliable in production).
- This repo includes optional **Postgres** support (`DATABASE_PROVIDER=postgres` + `DATABASE_URL`).
- **Neon** is one possible Postgres provider — not required. **Supabase**, self-hosted Postgres, or other managed Postgres services work the same way.
- You can also replace the receipt storage layer with your existing app database (MySQL, Redis, or whatever you already run) by adapting `lib/db/receipts.ts`.

---

## Deploy with a persistent database

When you deploy to Vercel or similar:

1. Keep using SQLite locally — nothing changes for day-to-day development.
2. For production, point the receipt index at Postgres (included) or your own store:
   - Set `DATABASE_PROVIDER=postgres`
   - Set `DATABASE_URL` to a pooled Postgres connection string (Neon, Supabase, etc.)
3. Keep all signer variables **server-side only**. Never expose private keys to the browser.
4. Deploy.

The app creates the `receipts` table and indexes on first use when `DATABASE_PROVIDER=postgres`.

Optional check before deploy (does not print connection secrets):

```bash
DATABASE_PROVIDER=postgres DATABASE_URL="your-connection-string" npm run db:check
```

---

## Useful scripts

```bash
npm run signer:address
```

Prints the signer public key.

```bash
npm run smoke:receipt
```

Creates a test receipt and prints the devnet transaction link.

```bash
npm run db:check
```

Checks which database provider is active and initializes the receipt table/index if needed.

```bash
npm run lint
```

Runs ESLint.

```bash
npx tsc --noEmit
```

Runs TypeScript checks.

---

## Privacy notes

This starter defaults to:

```txt
privacyMode: hash_only
```

That means sensitive source data should stay off-chain. The public Code-In record should contain hashes, references and proof metadata only.

Do not put plaintext secrets, private customer data, personal documents, regulated data or private prompts directly into chain-bound payloads.

Never commit:

```txt
.env.local
.keys/
data/*.sqlite
```

---

## Project goal

This starter is designed to make the first few minutes with IQ Code-In easier for normal Next.js, SaaS and AI developers.

It starts with receipts because they are easy to understand, but the same proof pattern can expand into:

- permanent profiles
- decentralized publishing
- AI memory
- verifiable SaaS records
- on-chain app databases
- Web3 internet content proofs