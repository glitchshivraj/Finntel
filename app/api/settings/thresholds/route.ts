import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

const KEYS = ["min_credit_score", "max_dti", "max_lti", "min_income",
  "auto_approve_low_risk", "auto_reject_high_risk", "email_notifications",
  "fraud_detection", "audit_trail", "manual_review_queue"];

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await query<{ key: string; value: string }>(
    `SELECT key, value FROM system_config WHERE key = ANY($1)`, [KEYS]
  );

  const config: Record<string, string> = {};
  for (const r of rows) config[r.key] = r.value;

  return NextResponse.json({ config });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Record<string, string>;

  for (const [key, value] of Object.entries(body)) {
    if (!KEYS.includes(key)) continue;
    await query(
      `INSERT INTO system_config (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()`,
      [key, String(value)]
    );
  }

  await query(
    `INSERT INTO audit_logs (action, user_name, type) VALUES ($1,$2,'system')`,
    ["System configuration updated by admin", session.name]
  );

  return NextResponse.json({ success: true });
}
