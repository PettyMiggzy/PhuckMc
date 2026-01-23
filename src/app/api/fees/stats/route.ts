import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const base = process.env.FEE_API_BASE;
  if (!base) {
    return NextResponse.json(
      { ok: false, error: "Missing env var: FEE_API_BASE" },
      { status: 500 }
    );
  }

  const url = `${base.replace(/\/$/, "")}/api/fees/stats`;
  const r = await fetch(url, { cache: "no-store" });

  const text = await r.text();
  // if droplet returns non-json, show it (helps debugging)
  try {
    const json = JSON.parse(text);
    return NextResponse.json(json, { status: r.status });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Upstream not JSON", status: r.status, body: text.slice(0, 300) },
      { status: 502 }
    );
  }
}
