import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
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
