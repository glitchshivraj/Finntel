import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const app = await queryOne(
    `SELECT id, name, avatar, amount, score, risk, status, applied_date as date,
            dti, income, credit_score as "creditScore", loan_type as "loanType",
            monthly_income as "monthlyIncome", monthly_expenses as "monthlyExpenses",
            emi, credit_utilization as "creditUtilization",
            total_liabilities as "totalLiabilities", loan_to_income as "loanToIncome",
            interest_rate as "interestRate", tenure
     FROM applications WHERE id = $1`,
    [id]
  );

  if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  return NextResponse.json({ application: app });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const body = await req.json();
  const { status } = body;

  const valid = ["Approved", "Rejected", "Pending", "Review"];
  if (!status || !valid.includes(status)) {
    return NextResponse.json({ error: "Invalid status. Must be one of: " + valid.join(", ") }, { status: 400 });
  }

  // Get current status for audit log
  const existing = await queryOne<{ status: string; name: string }>(
    `SELECT status, name FROM applications WHERE id = $1`, [id]
  );
  if (!existing) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  await query(`UPDATE applications SET status = $1 WHERE id = $2`, [status, id]);

  // Log to audit trail
  await query(
    `INSERT INTO audit_logs (action, user_name, type) VALUES ($1, $2, 'override')`,
    [`Manual decision change for ${existing.name} (${id}): ${existing.status} → ${status}`, session.name]
  );

  return NextResponse.json({ success: true, id, status });
}

