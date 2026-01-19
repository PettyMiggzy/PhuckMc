'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ background: '#07020f', color: 'white', minHeight: '100vh', padding: 24, fontFamily: 'ui-sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>PHUCKMC crashed</h1>
      <p style={{ opacity: 0.85, marginTop: 8 }}>
        {error?.message ?? 'Unknown error'}
      </p>
      {error?.digest ? (
        <p style={{ opacity: 0.6, marginTop: 8, fontSize: 12 }}>Digest: {error.digest}</p>
      ) : null}

      <button
        onClick={reset}
        style={{
          marginTop: 16,
          padding: '10px 14px',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.18)',
          background: 'rgba(255,255,255,0.06)',
          color: 'white',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Reload
      </button>
    </div>
  )
}
