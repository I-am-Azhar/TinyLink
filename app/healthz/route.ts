import { NextResponse } from "next/server";

const processStart = Date.now();

export async function GET() {
  const uptimeSeconds = Math.round((Date.now() - processStart) / 1000);
  return NextResponse.json({
    ok: true,
    version: "1.0",
    uptimeSeconds,
    timestamp: new Date().toISOString()
  });
}

