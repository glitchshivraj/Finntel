import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await query<{ id: number; name: string; email: string; role: string; active: boolean; created_at: string }>(
    `SELECT id, name, email, role, active, TO_CHAR(created_at AT TIME ZONE 'Asia/Kolkata', 'DD Mon YYYY') as created_at
     FROM users ORDER BY id ASC`
  );
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "super_admin") return NextResponse.json({ error: "Only super admins can invite users" }, { status: 403 });

  const { name, email, role, password } = await req.json();
  if (!name || !email || !role) {
    return NextResponse.json({ error: "Name, email and role are required" }, { status: 400 });
  }

  const existing = await query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
  if (existing.length > 0) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const tempPassword = password || `Finntel@${Math.floor(1000 + Math.random() * 9000)}`;
  const hashed = await bcrypt.hash(tempPassword, 10);

  const rows = await query<{ id: number }>(
    `INSERT INTO users (name, email, password, role, active) VALUES ($1,$2,$3,$4,true) RETURNING id`,
    [name.trim(), email.toLowerCase().trim(), hashed, role]
  );

  await query(
    `INSERT INTO audit_logs (action, user_name, type) VALUES ($1,$2,'system')`,
    [`New user invited: ${name} (${role}) — ${email}`, session.name]
  );

  return NextResponse.json({ id: rows[0].id, name, email, role, active: true, tempPassword }, { status: 201 });
}
