import { NextResponse } from "next/server";

export const runtime = "nodejs";

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function GET() {
  try {
    // Server-only env var. Do NOT use NEXT_PUBLIC here.
    const base = requireEnv("FEE_API_BASE").replace(/\/$/, "");

    const upstream = await fetch(`${base}/api/fees/stats`, {
      cache: "no-store",
    });

    const text = await upstream.text();

    // If upstream returns HTML, return a clean JSON error instead of crashing the client.
    if (text.trim().startsWith("<")) {
      return NextResponse.json(
        {
          error: "Upstream returned HTML (not JSON). Check droplet API + port 8787.",
          upstreamStatus: upstream.status,
        },
        { status: 502 }
      );
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Upstream returned non-JSON response", upstreamStatus: upstream.status },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Route failed" }, { status: 500 });
  }
}
