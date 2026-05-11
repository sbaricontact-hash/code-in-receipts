import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-16">
      <h1 className="text-4xl font-bold">Code-In Receipts for Web Apps</h1>
      <p className="max-w-3xl text-base text-black/70">
        Thin adoption starter for IQ Labs Code-In on Solana devnet. This app creates canonical
        receipt payloads, writes proof using a real signer, and stores a local SQLite index to make
        verification pages easy to build.
      </p>
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
        Privacy warning: this starter is for local devnet proof-of-concept. Never expose private
        keys client-side, and avoid pushing sensitive payloads to chain.
      </div>
      <div className="flex gap-3">
        <Link href="/demo" className="rounded-md bg-black px-4 py-2 text-white">
          Open Demo
        </Link>
      </div>
    </main>
  );
}
