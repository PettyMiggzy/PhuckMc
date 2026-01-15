import Link from "next/link";

const CA = "0x148a3a811979e5BF8366FC279B2d67742Fe17777";

export default function HomePage() {
  return (
    <main className="hero">
      <div className="hero-bg" />

      <div className="container">
        <h1>PHUCKMC</h1>

        <p>
          Calm money. Loud memes.<br />
          <b>Fuck what the chart says.</b>
        </p>

        <div className="cta-row">
          <a
            className="btn primary"
            href={`https://nad.fun/tokens/${CA}`}
            target="_blank"
            rel="noreferrer"
          >
            Buy on Nad.fun
          </a>

          <a
            className="btn"
            href="https://t.me/YOUR_TELEGRAM"
            target="_blank"
            rel="noreferrer"
          >
            Join Telegram →
          </a>
        </div>

        <div className="kv">
          <div><b>CA:</b> {CA}</div>
        </div>

        <section className="panel">
          <div className="panel-header">PROJECT PULSE</div>

          <div className="panel-body">
            <div className="card">
              <h3>Live soon</h3>
              <p>We’re wiring the on-chain stats.</p>
            </div>

            <div className="card">
              <h3>PHUCK Swap</h3>
              <p>fees → buyback + rewards<br />Make the meme fund itself.</p>
              <p style={{ marginTop: 10 }}>
                <Link href="/swap" className="btn">Open Swap</Link>
              </p>
            </div>

            <div className="card">
              <h3>Staking</h3>
              <p>lock in • chill out<br />Earn while you ignore the noise.</p>
              <p style={{ marginTop: 10 }}>
                <Link href="/staking" className="btn">Open Staking</Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
