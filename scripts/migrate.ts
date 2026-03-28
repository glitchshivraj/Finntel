import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("🔧 Running migrations...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        email       VARCHAR(255) UNIQUE NOT NULL,
        password    VARCHAR(255) NOT NULL,
        role        VARCHAR(50)  NOT NULL DEFAULT 'analyst',
        active      BOOLEAN      NOT NULL DEFAULT true,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id            VARCHAR(20)  PRIMARY KEY,
        name          VARCHAR(255) NOT NULL,
        avatar        VARCHAR(10)  NOT NULL,
        amount        BIGINT       NOT NULL,
        score         INT          NOT NULL,
        risk          VARCHAR(20)  NOT NULL,
        status        VARCHAR(20)  NOT NULL DEFAULT 'Pending',
        applied_date  VARCHAR(20)  NOT NULL,
        dti           INT          NOT NULL,
        income        BIGINT       NOT NULL,
        credit_score  INT          NOT NULL,
        loan_type     VARCHAR(100) NOT NULL DEFAULT 'Personal',
        monthly_income   BIGINT   NOT NULL DEFAULT 0,
        monthly_expenses BIGINT   NOT NULL DEFAULT 0,
        emi              BIGINT   NOT NULL DEFAULT 0,
        credit_utilization INT    NOT NULL DEFAULT 0,
        total_liabilities BIGINT  NOT NULL DEFAULT 0,
        loan_to_income    NUMERIC(5,2) NOT NULL DEFAULT 0,
        interest_rate     NUMERIC(5,2) NOT NULL DEFAULT 0,
        tenure            INT     NOT NULL DEFAULT 36,
        created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS rules (
        id          SERIAL PRIMARY KEY,
        condition   VARCHAR(255) NOT NULL,
        action      VARCHAR(50)  NOT NULL,
        enabled     BOOLEAN      NOT NULL DEFAULT true,
        impact      INT          NOT NULL DEFAULT 0,
        category    VARCHAR(100) NOT NULL DEFAULT 'Credit',
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id          SERIAL PRIMARY KEY,
        action      TEXT         NOT NULL,
        user_name   VARCHAR(255) NOT NULL,
        type        VARCHAR(50)  NOT NULL,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS overrides (
        id          SERIAL PRIMARY KEY,
        app_id      VARCHAR(20)  NOT NULL,
        name        VARCHAR(255) NOT NULL,
        system_dec  VARCHAR(20)  NOT NULL,
        admin_dec   VARCHAR(20)  NOT NULL,
        reason      TEXT         NOT NULL,
        admin       VARCHAR(255) NOT NULL,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS system_config (
        key         VARCHAR(100) PRIMARY KEY,
        value       TEXT         NOT NULL,
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    // Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_apps_status ON applications(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_apps_risk   ON applications(risk);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_apps_name   ON applications(name);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_type  ON audit_logs(type);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_overrides_app ON overrides(app_id);`);

    console.log("✅ Migration complete!");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => { console.error("❌ Migration failed:", err); process.exit(1); });
