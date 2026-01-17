'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ background: '#07020f', color: 'white', padding: 24, fontFamily: 'ui-sans-serif' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>PHUCKMC crashed</h1>
        <p style={{ opacity: 0.8, marginTop: 8 }}>
          This is the real runtime error (not the SES line). Copy/paste this into chat:
        </p>

        <pre
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.06)',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {String(error?.message || error)}
        </pre>

        {error?.digest ? (
          <div style={{ marginTop: 10, opacity: 0.7, fontSize: 12 }}>digest: {error.digest}</div>
        ) : null}

        <button
          onClick={() => reset()}
          style={{
            marginTop: 18,
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(168,85,247,0.25)',
            color: 'white',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </body>
    </html>
  )
}
