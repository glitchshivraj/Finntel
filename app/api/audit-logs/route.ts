import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const logs = await query(
    `SELECT id, action, user_name as "user", type,
            TO_CHAR(created_at AT TIME ZONE 'Asia/Kolkata', 'DD Mon, HH12:MI AM') as time
     FROM audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const [{ count }] = await query<{ count: string }>(`SELECT COUNT(*) as count FROM audit_logs`);

  return NextResponse.json({ logs, total: parseInt(count) });
}
