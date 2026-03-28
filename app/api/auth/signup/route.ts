import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { queryOne, query } from "@/lib/db";
import { signToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await queryOne(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const rows = await query<{ id: number; name: string; email: string; role: string }>(
      `INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,'analyst') RETURNING id, name, email, role`,
      [name.trim(), email.toLowerCase().trim(), hashed]
    );
    const user = rows[0];

    const token = signToken({ userId: user.id, email: user.email, role: user.role, name: user.name });
    const cookieOpts = setSessionCookie(token);

    const res = NextResponse.json({ user }, { status: 201 });
    res.cookies.set(cookieOpts);
    return res;
  } catch (err) {
    console.error("[POST /api/auth/signup]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
