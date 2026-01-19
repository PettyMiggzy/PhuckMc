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
      <p style={{ opacity: 0.8, marginTop: 8 }}>Something blew up. Refresh or hit reset.</p>
      <pre style={{ marginTop: 16, opacity: 0.65, whiteSpace: 'pre-wrap' }}>
        {error?.message}
      </pre>
      <button
        onClick={() => reset()}
        style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: '#7c3aed', fontWeight: 700 }}
      >
        Reset
      </button>
    </div>
  )
}
