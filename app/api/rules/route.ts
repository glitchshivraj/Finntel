import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rules = await query(
    `SELECT id, condition, action, enabled, impact, category FROM rules ORDER BY id ASC`
  );
  return NextResponse.json({ rules });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { condition, action, category } = await req.json();
  if (!condition || !action) {
    return NextResponse.json({ error: "Condition and action are required" }, { status: 400 });
  }

  const rows = await query<{ id: number }>(
    `INSERT INTO rules (condition, action, category, enabled, impact) VALUES ($1,$2,$3,true,0) RETURNING id`,
    [condition, action, category || "Credit"]
  );
  const id = rows[0].id;

  await query(
    `INSERT INTO audit_logs (action, user_name, type) VALUES ($1,$2,'rule')`,
    [`New rule added: "${condition}" → ${action}`, session.name]
  );

  return NextResponse.json({ rule: { id, condition, action, category: category || "Credit", enabled: true, impact: 0 } }, { status: 201 });
}
