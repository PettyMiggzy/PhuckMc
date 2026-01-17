'use client'

import { useEffect } from 'react'

export default function StakingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => console.error(error), [error])

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-white">
      <div className="rounded-3xl border border-white/10 bg-black/40 p-8">
        <div className="text-xs tracking-[0.22em] text-white/60">STAKING ERROR</div>
        <h1 className="mt-2 text-2xl font-extrabold">Something crashed on /staking</h1>
        <pre className="mt-4 whitespace-pre-wrap break-words rounded-2xl bg-black/50 p-4 text-sm text-white/80 border border-white/10">
          {String(error?.message || error)}
        </pre>
        <button
          onClick={() => reset()}
          className="mt-6 rounded-2xl bg-purple-600 px-5 py-3 font-semibold hover:bg-purple-500"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
