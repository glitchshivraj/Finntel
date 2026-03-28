import { Pool } from "pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  try {
    console.log("🌱 Seeding database...");

    // ── Users ────────────────────────────────────────────────────────────────
    const adminPw = await bcrypt.hash("Admin@123", 10);
    const analystPw = await bcrypt.hash("Analyst@123", 10);

    await client.query(`DELETE FROM audit_logs; DELETE FROM overrides; DELETE FROM applications; DELETE FROM rules; DELETE FROM system_config;`);
    await client.query(`DELETE FROM users;`);

    await client.query(
      `INSERT INTO users (name, email, password, role, active) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING`,
      ["Aryan Joshi", "aryan@finntel.ai", adminPw, "super_admin", true]
    );
    await client.query(
      `INSERT INTO users (name, email, password, role, active) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING`,
      ["Priya Menon", "priya@finntel.ai", analystPw, "analyst", true]
    );
    await client.query(
      `INSERT INTO users (name, email, password, role, active) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING`,
      ["Rahul Desai", "rahul@finntel.ai", analystPw, "analyst", false]
    );
    await client.query(
      `INSERT INTO users (name, email, password, role, active) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING`,
      ["Nisha Kapoor", "nisha@finntel.ai", analystPw, "viewer", true]
    );

    // ── Applications ─────────────────────────────────────────────────────────
    const apps = [
      { id: "#FNT-4821", name: "Arjun Mehta",   avatar: "AM", amount: 1200000, score: 91, risk: "Low",    status: "Approved", date: "23 Mar", dti: 5,  income: 1840000, cs: 784, lt: "Home Improvement", mi: 153333, me: 42000, emi: 38900, cu: 22, tl: 420000, lti: 0.65, ir: 10.5, tenure: 36 },
      { id: "#FNT-4820", name: "Priya Sharma",  avatar: "PS", amount: 850000,  score: 58, risk: "Medium", status: "Review",   date: "23 Mar", dti: 38, income: 720000,  cs: 632, lt: "Personal",          mi: 60000,  me: 22000, emi: 28000, cu: 45, tl: 180000, lti: 1.18, ir: 14.5, tenure: 48 },
      { id: "#FNT-4819", name: "Rohan Das",     avatar: "RD", amount: 2500000, score: 29, risk: "High",   status: "Rejected", date: "22 Mar", dti: 72, income: 380000,  cs: 520, lt: "Business",          mi: 31667,  me: 20000, emi: 22000, cu: 78, tl: 650000, lti: 6.58, ir: 18.0, tenure: 60 },
      { id: "#FNT-4818", name: "Kavya Nair",    avatar: "KN", amount: 575000,  score: 84, risk: "Low",    status: "Approved", date: "22 Mar", dti: 12, income: 1100000, cs: 768, lt: "Car Loan",          mi: 91667,  me: 20000, emi: 16000, cu: 18, tl: 120000, lti: 0.52, ir: 9.5,  tenure: 36 },
      { id: "#FNT-4817", name: "Vikram Singh",  avatar: "VS", amount: 1800000, score: 47, risk: "Medium", status: "Pending",  date: "22 Mar", dti: 41, income: 950000,  cs: 648, lt: "Home Loan",         mi: 79167,  me: 30000, emi: 32000, cu: 40, tl: 320000, lti: 1.89, ir: 13.0, tenure: 120},
      { id: "#FNT-4816", name: "Sneha Pillai",  avatar: "SP", amount: 320000,  score: 76, risk: "Low",    status: "Approved", date: "21 Mar", dti: 18, income: 620000,  cs: 710, lt: "Personal",          mi: 51667,  me: 14000, emi: 9000,  cu: 25, tl: 80000,  lti: 0.52, ir: 11.0, tenure: 24 },
      { id: "#FNT-4815", name: "Aditya Kumar",  avatar: "AK", amount: 4000000, score: 18, risk: "High",   status: "Rejected", date: "21 Mar", dti: 81, income: 280000,  cs: 490, lt: "Business",          mi: 23333,  me: 18000, emi: 18000, cu: 92, tl: 950000, lti: 14.28,ir: 22.0, tenure: 60 },
      { id: "#FNT-4814", name: "Meera Iyer",    avatar: "MI", amount: 3000000, score: 88, risk: "Low",    status: "Approved", date: "21 Mar", dti: 14, income: 2200000, cs: 810, lt: "Home Loan",         mi: 183333, me: 40000, emi: 28000, cu: 12, tl: 250000, lti: 1.36, ir: 9.0,  tenure: 180},
      { id: "#FNT-4813", name: "Suresh Rao",    avatar: "SR", amount: 600000,  score: 62, risk: "Medium", status: "Pending",  date: "20 Mar", dti: 33, income: 450000,  cs: 670, lt: "Personal",          mi: 37500,  me: 12000, emi: 12000, cu: 35, tl: 150000, lti: 1.33, ir: 12.5, tenure: 36 },
      { id: "#FNT-4812", name: "Divya Thomas",  avatar: "DT", amount: 1500000, score: 79, risk: "Low",    status: "Approved", date: "20 Mar", dti: 22, income: 1500000, cs: 745, lt: "Home Improvement",  mi: 125000, me: 28000, emi: 19000, cu: 20, tl: 280000, lti: 1.00, ir: 10.0, tenure: 48 },
    ];

    for (const a of apps) {
      await client.query(
        `INSERT INTO applications (id,name,avatar,amount,score,risk,status,applied_date,dti,income,credit_score,loan_type,monthly_income,monthly_expenses,emi,credit_utilization,total_liabilities,loan_to_income,interest_rate,tenure)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
        [a.id, a.name, a.avatar, a.amount, a.score, a.risk, a.status, a.date, a.dti, a.income, a.cs, a.lt, a.mi, a.me, a.emi, a.cu, a.tl, a.lti, a.ir, a.tenure]
      );
    }

    // ── Rules ─────────────────────────────────────────────────────────────────
    const rules = [
      { condition: "Credit Score < 600",        action: "Reject",      enabled: true,  impact: 142, category: "Credit" },
      { condition: "DTI > 50%",                 action: "High Risk",   enabled: true,  impact: 98,  category: "Debt" },
      { condition: "Income > ₹15,00,000/yr",    action: "Low Risk",    enabled: true,  impact: 312, category: "Income" },
      { condition: "Loan > 5× Annual Income",   action: "Reject",      enabled: true,  impact: 76,  category: "Loan Ratio" },
      { condition: "Credit Score ≥ 750",        action: "Low Risk",    enabled: true,  impact: 287, category: "Credit" },
      { condition: "DTI > 35%",                 action: "Medium Risk", enabled: true,  impact: 134, category: "Debt" },
      { condition: "Late Payments > 2",         action: "High Risk",   enabled: false, impact: 54,  category: "History" },
      { condition: "Credit Util > 50%",         action: "Flag",        enabled: true,  impact: 61,  category: "Credit" },
      { condition: "Income < ₹2,00,000/yr",     action: "Reject",      enabled: true,  impact: 38,  category: "Income" },
      { condition: "Employment < 1 year",       action: "Medium Risk", enabled: false, impact: 29,  category: "Employment" },
    ];
    for (const r of rules) {
      await client.query(
        `INSERT INTO rules (condition,action,enabled,impact,category) VALUES ($1,$2,$3,$4,$5)`,
        [r.condition, r.action, r.enabled, r.impact, r.category]
      );
    }

    // ── Audit Logs ────────────────────────────────────────────────────────────
    const logs = [
      { action: "Rule updated: DTI threshold changed from 50% to 45%",      user: "Admin · Aryan J",    type: "rule" },
      { action: "Application #FNT-4817 manually approved by admin",         user: "Admin · Aryan J",    type: "override" },
      { action: "New rule added: Employment < 1 year → Medium Risk",        user: "Admin · Aryan J",    type: "rule" },
      { action: "Application #FNT-4819 marked for review",                  user: "Analyst · Priya M",  type: "review" },
      { action: "System threshold updated: Min credit score changed to 600", user: "Admin · Aryan J",   type: "system" },
      { action: "Rule disabled: Late Payments > 2 → High Risk",             user: "Analyst · Priya M",  type: "rule" },
      { action: "Application #FNT-4815 rejected manually — fraud suspicion", user: "Admin · Aryan J",   type: "override" },
      { action: "User role updated: Priya M promoted to Analyst",            user: "Admin · Aryan J",   type: "system" },
    ];
    for (const l of logs) {
      await client.query(
        `INSERT INTO audit_logs (action,user_name,type) VALUES ($1,$2,$3)`,
        [l.action, l.user, l.type]
      );
    }

    // ── Overrides ─────────────────────────────────────────────────────────────
    await client.query(
      `INSERT INTO overrides (app_id,name,system_dec,admin_dec,reason,admin) VALUES ($1,$2,$3,$4,$5,$6)`,
      ["#FNT-4817", "Vikram Singh", "Rejected", "Approved", "Additional income documents submitted and verified offline", "Aryan J"]
    );
    await client.query(
      `INSERT INTO overrides (app_id,name,system_dec,admin_dec,reason,admin) VALUES ($1,$2,$3,$4,$5,$6)`,
      ["#FNT-4820", "Priya Sharma", "Review", "Review", "Waiting for employer verification letter", "Priya M"]
    );
    await client.query(
      `INSERT INTO overrides (app_id,name,system_dec,admin_dec,reason,admin) VALUES ($1,$2,$3,$4,$5,$6)`,
      ["#FNT-4815", "Aditya Kumar", "Rejected", "Rejected", "Confirmed fraud pattern — flagged for investigation", "Aryan J"]
    );

    // ── System Config ─────────────────────────────────────────────────────────
    const configs = [
      ["min_credit_score", "600"],
      ["max_dti", "50"],
      ["max_lti", "5"],
      ["min_income", "200000"],
      ["auto_approve_low_risk", "true"],
      ["auto_reject_high_risk", "true"],
      ["email_notifications", "true"],
      ["fraud_detection", "true"],
      ["audit_trail", "true"],
      ["manual_review_queue", "false"],
    ];
    for (const [key, value] of configs) {
      await client.query(
        `INSERT INTO system_config (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2`,
        [key, value]
      );
    }

    console.log("✅ Seed complete!");
    console.log("📧 Admin login: aryan@finntel.ai / Admin@123");
    console.log("📧 Analyst login: priya@finntel.ai / Analyst@123");
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => { console.error("❌ Seed failed:", err); process.exit(1); });
