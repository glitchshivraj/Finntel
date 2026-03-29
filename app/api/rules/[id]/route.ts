import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const body = await req.json();

  const rule = await queryOne<{ id: number; condition: string; action: string; enabled: boolean; impact: number; category: string }>(
    `SELECT * FROM rules WHERE id = $1`, [id]
  );
  if (!rule) return NextResponse.json({ error: "Rule not found" }, { status: 404 });

  const condition = body.condition ?? rule.condition;
  const action    = body.action    ?? rule.action;
  const enabled   = body.enabled   ?? rule.enabled;
  const impact    = body.impact    ?? rule.impact;
  const category  = body.category  ?? rule.category;

  await query(
    `UPDATE rules SET condition=$1, action=$2, enabled=$3, impact=$4, category=$5, updated_at=NOW() WHERE id=$6`,
    [condition, action, enabled, impact, category, id]
  );

  const actionLabel = body.enabled !== undefined
    ? `Rule "${condition}" ${enabled ? "enabled" : "disabled"}`
    : `Rule updated: "${condition}" → ${action}`;
  await query(
    `INSERT INTO audit_logs (action, user_name, type) VALUES ($1,$2,'rule')`,
    [actionLabel, session.name]
  );

  return NextResponse.json({ rule: { id: parseInt(id), condition, action, enabled, impact, category } });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const rule = await queryOne<{ condition: string }>(`SELECT condition FROM rules WHERE id = $1`, [id]);
  if (!rule) return NextResponse.json({ error: "Rule not found" }, { status: 404 });

  await query(`DELETE FROM rules WHERE id = $1`, [id]);
  await query(
    `INSERT INTO audit_logs (action, user_name, type) VALUES ($1,$2,'rule')`,
    [`Rule deleted: "${rule.condition}"`, session.name]
  );

  return NextResponse.json({ success: true });
}
