import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { decision } = await req.json();

  const allowed = ["Approved", "Rejected", "Pending", "Review"];
  if (!allowed.includes(decision)) {
    return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
  }

  const app = await queryOne(`SELECT id, name, status FROM applications WHERE id = $1`, [id]);
  if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  await query(
    `UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2`,
    [decision, id]
  );

  // Write audit log
  await query(
    `INSERT INTO audit_logs (action, user_name, type) VALUES ($1, $2, 'override')`,
    [`Application ${id} manually set to ${decision}`, session.name]
  );

  return NextResponse.json({ success: true, id, decision });
}
