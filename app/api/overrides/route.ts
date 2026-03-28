import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const overrides = await query(
    `SELECT id, app_id as "appId", name,
            system_dec as "systemDec", admin_dec as "adminDec",
            reason, admin,
            TO_CHAR(created_at AT TIME ZONE 'Asia/Kolkata', 'DD Mon') as date
     FROM overrides ORDER BY created_at DESC`
  );

  return NextResponse.json({ overrides });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { appId, name, systemDec, adminDec, reason } = await req.json();
  if (!appId || !adminDec || !reason) {
    return NextResponse.json({ error: "appId, adminDec and reason are required" }, { status: 400 });
  }

  // Update the application status
  await query(`UPDATE applications SET status=$1, updated_at=NOW() WHERE id=$2`, [adminDec, appId]);

  // Insert override record
  const rows = await query<{ id: number }>(
    `INSERT INTO overrides (app_id,name,system_dec,admin_dec,reason,admin) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [appId, name, systemDec, adminDec, reason, session.name]
  );

  // Audit log
  await query(
    `INSERT INTO audit_logs (action, user_name, type) VALUES ($1,$2,'override')`,
    [`Override: ${appId} → ${adminDec}. Reason: ${reason}`, session.name]
  );

  return NextResponse.json({ id: rows[0].id, appId, adminDec }, { status: 201 });
}
