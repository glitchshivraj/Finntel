import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await query<{ risk: string; count: string }>(
    `SELECT risk, COUNT(*) as count FROM applications GROUP BY risk`
  );

  const total = rows.reduce((s, r) => s + parseInt(r.count), 0) || 1;
  const map: Record<string, number> = {};
  for (const r of rows) map[r.risk] = parseInt(r.count);

  const low    = map["Low"]    || 0;
  const medium = map["Medium"] || 0;
  const high   = map["High"]   || 0;

  return NextResponse.json({
    distribution: [
      { label: "Low Risk",    count: low,    pct: Math.round((low    / total) * 100), color: "#00FFB3" },
      { label: "Medium Risk", count: medium, pct: Math.round((medium / total) * 100), color: "#FFB800" },
      { label: "High Risk",   count: high,   pct: Math.round((high   / total) * 100), color: "#FF6B5B" },
    ],
    total,
  });
}
