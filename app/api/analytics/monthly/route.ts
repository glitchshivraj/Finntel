import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

const MONTHLY_SEED = [
  { month: "Oct", approved: 34, rejected: 12, pending: 6 },
  { month: "Nov", approved: 41, rejected: 15, pending: 8 },
  { month: "Dec", approved: 28, rejected: 18, pending: 11 },
  { month: "Jan", approved: 52, rejected: 10, pending: 7 },
  { month: "Feb", approved: 47, rejected: 13, pending: 9 },
  { month: "Mar", approved: 0 , rejected: 0 , pending: 0 },
];

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Count current month from real DB
  const [approved] = await query<{ count: string }>(`SELECT COUNT(*) as count FROM applications WHERE status='Approved'`);
  const [rejected] = await query<{ count: string }>(`SELECT COUNT(*) as count FROM applications WHERE status='Rejected'`);
  const [pending]  = await query<{ count: string }>(`SELECT COUNT(*) as count FROM applications WHERE status IN ('Pending','Review')`);

  const data = MONTHLY_SEED.map((m) =>
    m.month === "Mar"
      ? { month: "Mar", approved: parseInt(approved.count), rejected: parseInt(rejected.count), pending: parseInt(pending.count) }
      : m
  );

  return NextResponse.json({ monthly: data });
}
