# Code-In Receipts for Web Apps

Thin adoption starter for IQ Labs Code-In on Solana devnet using Next.js App Router.

This is **not** a competing SDK. It is a small integration layer that:
- validates canonical receipt payloads with Zod,
- writes proof through a swappable Code-In adapter,
- stores a local SQLite index for verification pages.

## Stack

- Next.js App Router + TypeScript + Tailwind
- SQLite via `better-sqlite3`
- Solana devnet via `@solana/web3.js`
- Validation via `zod`

## Environment Setup

Copy `.env.example` to `.env.local` and set values:

```bash
cp .env.example .env.local
```

Required vars:
- `SOLANA_RPC_URL` (or `CODEIN_RPC_URL`): devnet RPC endpoint
- Signer: set **`SOLANA_SIGNER_SECRET_KEY`** (JSON byte array) **or** **`SOLANA_SIGNER_SECRET_KEY_BASE58`** (base58). If both are set, the JSON variable wins when it is non-empty.
- Optional aliases for Dear Future compatibility:
  - `CODEIN_SOLANA_NETWORK` as alias for `CODEIN_NETWORK`
  - `CODEIN_SIGNER_PRIVATE_KEY` as alias for `SOLANA_SIGNER_SECRET_KEY_BASE58`
- `DATABASE_PATH`: defaults to `./data/code-in-receipts.sqlite`

### Solana keys (devnet)

- **Public key / address** — this is where you send devnet SOL (airdrops, funding). It is safe to share for receiving funds.
- **Secret key** — what the app uses to sign transactions. Treat it like a password.
- You may store the secret as a **JSON array of bytes** (`SOLANA_SIGNER_SECRET_KEY`) or a **base58-encoded** string (`SOLANA_SIGNER_SECRET_KEY_BASE58`).
- **Never** commit `.env.local`, real keys in `.env`, or files under `.keys/` to version control.

## Install

```bash
npm install
```

Install IQ Labs Solana SDK:

```bash
npm install @iqlabs-official/solana-sdk
```

## SDK status

This starter uses **`@iqlabs-official/solana-sdk`** (IQ Labs Solana SDK) for the real Code-In write path: `writer.codeIn` plus `reader.readCodeIn` for a post-write round-trip check.

The legacy **`iq-sdk`** package (`github:IQ6900/code_in_sdk`) is **not** used.

If the real SDK path throws (RPC, signer, or API errors), the adapter falls back to **`DEVNET_MEMO_FALLBACK_NOT_CODEIN`** — a plain devnet memo transaction for benchmarking signing and confirmation only. That path is **not** IQ Code-In storage.

## Adapter Behavior

`RealCodeInAdapter` attempts real Code-In mode first via `@iqlabs-official/solana-sdk` (`writer.codeIn` with signer/connection context, then `setRpcUrl` + `reader.readCodeIn` for round-trip check).

If that fails due to runtime API/environment issues, it safely falls back to `DEVNET_MEMO_FALLBACK_NOT_CODEIN` for a real devnet signer/RPC benchmark transaction.

The memo fallback is **not** actual Code-In storage.

## Run

```bash
npm run dev
```

Open `http://localhost:3000` and go to `/demo`.

## Scripts

- `npm run signer:address` - print signer public key only (no secrets)
- `npm run signer:airdrop` - request 1 SOL devnet airdrop
- `npm run smoke:receipt` - create a receipt via backend function and print tx/explorer link
- `npm run lint` - run ESLint

## Verified devnet smoke test

When the real IQ Code-In path succeeds (see `lib/codein/real-codein-adapter.ts`), server logs should include:

```
[RealCodeInAdapter] REAL_IQ_CODEIN_PATH active
[RealCodeInAdapter] REAL_IQ_CODEIN_PATH succeeded
```

Run `npm run smoke:receipt` (with `.env.local` and funded devnet signer) to confirm end-to-end.

## API

### `POST /api/receipts/create`

Accepts:

```json
{
  "appId": "my-app",
  "type": "payment_receipt",
  "reference": "order-123",
  "payloadHash": "abc123...",
  "privacyMode": "hash_only",
  "metadata": {
    "foo": "bar"
  }
}
```

Returns:

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

### `GET /api/receipts/verify/[receiptId]`

Returns stored receipt + write result from SQLite index.

## Privacy Warning

This starter defaults to `hash_only`, but it still sends proof data to devnet. Do not store plaintext secrets or regulated PII in chain-bound payloads. Keep signer keys server-side and never log private key material.
