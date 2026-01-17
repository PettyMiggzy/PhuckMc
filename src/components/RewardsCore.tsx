'use client'

export default function RewardsCore({
  fill,
  pulse,
  labelTop = 'REWARD REACTOR',
  labelBottom = 'watch rewards flow in real time',
}: {
  fill: number
  pulse: boolean
  labelTop?: string
  labelBottom?: string
}) {
  const pct = Math.max(0, Math.min(1, fill))
  const pctText = `${Math.round(pct * 100)}%`

  const isHot = pct >= 0.75
  const isNearFull = pct >= 0.9
  const isFull = pct >= 0.999

  return (
    <div className="w-full flex flex-col items-center">
      {/* Text */}
      <div className="text-[11px] tracking-[0.35em] text-purple-200/70">
        {labelTop}
      </div>
      <div className="mt-2 text-4xl font-extrabold text-purple-100 drop-shadow-[0_0_18px_rgba(168,85,247,0.35)]">
        {pctText}
      </div>
      <div className="mt-1 text-sm text-white/60">{labelBottom}</div>

      {/* Reactor */}
      <div className="relative mt-6 w-[300px] max-w-full">
        {/* Ambient halo */}
        <div className="absolute -inset-10 rounded-[70px] bg-purple-500/10 blur-2xl" />

        {/* ENERGY RAYS (near full) */}
        {isNearFull && (
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div
              className={`absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl ${
                isFull ? 'opacity-60' : 'opacity-35'
              }`}
              style={{
                background:
                  'conic-gradient(from 180deg, rgba(168,85,247,0.0), rgba(168,85,247,0.65), rgba(255,255,255,0.12), rgba(168,85,247,0.0), rgba(168,85,247,0.55), rgba(168,85,247,0.0))',
                animation: 'phuck-spin 10s linear infinite',
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl opacity-25"
              style={{
                background:
                  'conic-gradient(from 90deg, rgba(168,85,247,0.0), rgba(168,85,247,0.55), rgba(168,85,247,0.0), rgba(168,85,247,0.45), rgba(168,85,247,0.0))',
                animation: 'phuck-spin 18s linear infinite reverse',
              }}
            />
          </div>
        )}

        {/* Cylinder body */}
        <div className="relative h-[280px] rounded-[36px] border border-white/10 bg-black/25 backdrop-blur-md overflow-hidden shadow-[0_0_70px_rgba(168,85,247,0.18)]">
          {/* Inner glass */}
          <div className="absolute inset-[10px] rounded-[28px] border border-purple-300/15 bg-black/15" />

          {/* Liquid fill */}
          <div
            className={`absolute left-[10px] right-[10px] bottom-[10px] rounded-[24px] transition-all duration-700 ${
              pulse ? 'animate-pulse' : ''
            }`}
            style={{ height: `${pct * 100}%` }}
          >
            {/* Liquid gradient */}
            <div
              className="absolute inset-0 rounded-[24px]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(233,213,255,0.95), rgba(168,85,247,0.75) 55%, rgba(59,7,100,0.65))',
              }}
            />

            {/* Liquid shimmer */}
            <div className="absolute inset-0 rounded-[24px] opacity-35 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.6),transparent_45%)]" />

            {/* Surface glow band */}
            <div className="absolute top-0 left-0 right-0 h-10 rounded-t-[24px] bg-gradient-to-b from-white/25 to-transparent" />

            {/* Bubbles */}
            <div className="absolute inset-0 overflow-hidden rounded-[24px]">
              {Array.from({ length: isHot ? 14 : 10 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute bottom-2 block rounded-full bg-white/40"
                  style={{
                    width: `${6 + (i % 4) * 4}px`,
                    height: `${6 + (i % 4) * 4}px`,
                    left: `${8 + (i * 9) % 86}%`,
                    opacity: (isHot ? 0.28 : 0.18) + ((i % 5) * 0.05),
                    filter: 'blur(0.4px)',
                    animation: `phuck-bubble ${isHot ? 2.2 : 2.8}s linear ${
                      (i % 7) * 0.25
                    }s infinite`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Top mist (near full) */}
          {isNearFull && (
            <div className="absolute left-[10px] right-[10px] top-[18px] h-24 pointer-events-none">
              <div
                className={`absolute inset-0 rounded-[28px] blur-xl ${
                  isFull ? 'opacity-60' : 'opacity-35'
                }`}
                style={{
                  background:
                    'radial-gradient(circle at 50% 60%, rgba(233,213,255,0.55), rgba(168,85,247,0.25), transparent 70%)',
                  animation: 'phuck-fog 2.6s ease-in-out infinite',
                }}
              />
              <div
                className="absolute left-10 right-10 top-8 h-10 rounded-full blur-lg opacity-25"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255,255,255,0.35), transparent 65%)',
                }}
              />
            </div>
          )}

          {/* Spark burst (near full) */}
          {isNearFull && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 26 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute block rounded-full"
                  style={{
                    width: `${2 + (i % 3)}px`,
                    height: `${2 + (i % 3)}px`,
                    left: `${(i * 17) % 100}%`,
                    top: `${10 + ((i * 13) % 70)}%`,
                    background:
                      i % 4 === 0
                        ? 'rgba(255,255,255,0.95)'
                        : 'rgba(233,213,255,0.85)',
                    opacity: isFull ? 0.6 : 0.35,
                    filter: 'blur(0.2px)',
                    boxShadow: isFull
                      ? '0 0 18px rgba(233,213,255,0.8)'
                      : '0 0 10px rgba(168,85,247,0.5)',
                    animation: `phuck-spark ${isFull ? 1.8 : 2.4}s ease-in-out ${
                      (i % 9) * 0.12
                    }s infinite`,
                  }}
                />
              ))}
            </div>
          )}

          {/* “Always looks alive” core */}
          <div className="absolute inset-0 flex items-end justify-center pb-10 pointer-events-none">
            <div
              className="h-10 w-10 rounded-full border border-purple-300/20 shadow-[0_0_28px_rgba(168,85,247,0.25)]"
              style={{
                background: isFull
                  ? 'radial-gradient(circle at 40% 30%, rgba(255,255,255,0.35), rgba(168,85,247,0.25), rgba(0,0,0,0))'
                  : 'rgba(168,85,247,0.15)',
              }}
            />
          </div>

          {/* Glass highlights */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-6 bottom-6 left-6 w-8 rounded-full bg-white/8 blur-md" />
            <div className="absolute -top-10 left-1/2 h-28 w-[120%] -translate-x-1/2 rounded-full bg-white/10 blur-xl" />
          </div>

          {/* Top cap ring */}
          <div className="absolute left-0 right-0 top-0 h-14 pointer-events-none">
            <div className="absolute inset-x-6 top-4 h-10 rounded-full border border-purple-200/20 bg-black/20" />
            <div className="absolute inset-x-10 top-6 h-6 rounded-full bg-white/5" />
            {isFull && (
              <div className="absolute inset-x-10 top-2 h-12 rounded-full bg-purple-200/10 blur-xl" />
            )}
          </div>

          {/* Bottom base */}
          <div className="absolute left-0 right-0 bottom-0 h-16 pointer-events-none">
            <div className="absolute inset-x-5 bottom-4 h-10 rounded-full bg-black/35 border border-white/10" />
            <div className="absolute inset-x-10 bottom-6 h-6 rounded-full bg-purple-500/10" />
          </div>

          {/* Pulse burst (fundRewards event hit) */}
          {pulse && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-[-35px] rounded-[70px] bg-purple-500/12 blur-2xl animate-ping" />
            </div>
          )}
        </div>

        {/* Under cards */}
        <div className="mt-4 grid grid-cols-2 gap-3 w-full">
          <div className="rounded-2xl border border-white/10 bg-black/25 backdrop-blur-md px-4 py-3 text-center">
            <div className="text-[11px] tracking-[0.22em] text-white/55">
              STATUS
            </div>
            <div className="mt-1 font-semibold text-purple-100">
              {pct === 0 ? 'EMPTY' : pct >= 1 ? 'FULL' : 'FILLING'}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 backdrop-blur-md px-4 py-3 text-center">
            <div className="text-[11px] tracking-[0.22em] text-white/55">
              INTENSITY
            </div>
            <div className="mt-1 font-semibold text-purple-100">
              {pct < 0.25 ? 'LOW' : pct < 0.75 ? 'MED' : 'HIGH'}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes phuck-bubble {
          0% {
            transform: translateY(0) scale(0.9);
            opacity: 0.05;
          }
          15% {
            opacity: 0.22;
          }
          100% {
            transform: translateY(-170px) scale(1.18);
            opacity: 0;
          }
        }

        @keyframes phuck-spark {
          0%,
          100% {
            transform: translateY(0) scale(0.9);
            opacity: 0.25;
          }
          50% {
            transform: translateY(-10px) scale(1.25);
            opacity: 0.7;
          }
        }

        @keyframes phuck-fog {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.25;
          }
          50% {
            transform: translateY(-6px);
            opacity: 0.45;
          }
        }

        @keyframes phuck-spin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
