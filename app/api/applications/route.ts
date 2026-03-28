import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const risk = searchParams.get("risk");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let pi = 1;

  if (status && status !== "All") { conditions.push(`status = $${pi++}`); params.push(status); }
  if (risk && risk !== "All")     { conditions.push(`risk = $${pi++}`);   params.push(risk); }
  if (search) {
    conditions.push(`(LOWER(name) LIKE $${pi} OR id LIKE $${pi})`);
    params.push(`%${search.toLowerCase()}%`);
    pi++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const apps = await query(
    `SELECT id, name, avatar, amount, score, risk, status, applied_date as date, dti, income, credit_score as "creditScore" FROM applications ${where} ORDER BY created_at DESC LIMIT $${pi} OFFSET $${pi+1}`,
    [...params, limit, offset]
  );
  const [{ count }] = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM applications ${where}`, params
  );

  return NextResponse.json({ applications: apps, total: parseInt(count), page, limit });
}
