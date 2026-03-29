import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const user = await queryOne<{ id: number; name: string; role: string; active: boolean }>(
    `SELECT id, name, role, active FROM users WHERE id = $1`, [id]
  );
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const role   = body.role   ?? user.role;
  const active = body.active ?? user.active;

  await query(`UPDATE users SET role=$1, active=$2 WHERE id=$3`, [role, active, id]);

  await query(
    `INSERT INTO audit_logs (action, user_name, type) VALUES ($1,$2,'system')`,
    [`User ${user.name} updated — role: ${role}, active: ${active}`, session.name]
  );

  return NextResponse.json({ success: true, id: Number(id), role, active });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (Number(id) === session.userId) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });

  const user = await queryOne<{ name: string }>(`SELECT name FROM users WHERE id=$1`, [id]);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await query(`DELETE FROM users WHERE id=$1`, [id]);
  await query(
    `INSERT INTO audit_logs (action, user_name, type) VALUES ($1,$2,'system')`,
    [`User ${user.name} removed from system`, session.name]
  );

  return NextResponse.json({ success: true });
}
