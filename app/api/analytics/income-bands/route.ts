import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Income bands in INR annual
  const bands = [
    { label: "< ₹3L",       min: 0,        max: 300000,   color: "#FF6B5B" },
    { label: "₹3L – ₹6L",   min: 300000,   max: 600000,   color: "#FFB800" },
    { label: "₹6L – ₹12L",  min: 600000,   max: 1200000,  color: "#00D4FF" },
    { label: "₹12L – ₹20L", min: 1200000,  max: 2000000,  color: "#00FFB3" },
    { label: "> ₹20L",      min: 2000000,  max: 999999999, color: "#A855F7" },
  ];

  const results = await Promise.all(
    bands.map(async (b) => {
      const [row] = await query<{ total: string; approved: string }>(
        `SELECT COUNT(*) as total,
                SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved
         FROM applications
         WHERE income >= $1 AND income < $2`,
        [b.min, b.max]
      );
      const total    = parseInt(row.total)    || 0;
      const approved = parseInt(row.approved) || 0;
      const rate     = total > 0 ? Math.round((approved / total) * 100) : 0;
      return { band: b.label, rate, count: total, color: b.color };
    })
  );

  return NextResponse.json({ bands: results });
}
