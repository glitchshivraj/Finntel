"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AppDetail {
  id: string; name: string; avatar: string;
  decision: "Approved" | "Rejected" | "Pending" | "Review";
  date: string; amount: number; loanType: string;
  income: number; monthlyIncome: number; monthlyExpenses: number;
  emi: number; dti: number; creditUtilization: number;
  totalLiabilities: number; creditScore: number;
  loanToIncome: number; interestRate: number; tenure: number;
  score: number; risk: string;
}

const DC: Record<string, string> = { Approved: "#00FFB3", Rejected: "#FF6B5B", Pending: "#FFB800", Review: "#00D4FF" };
const RC: Record<string, string> = { Low: "#00FFB3", Medium: "#FFB800", High: "#FF6B5B" };

export default function ApplicationDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [app, setApp] = useState<AppDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mouse, setMouse] = useState({ x: -100, y: -100 });
  const [animBars, setAnimBars] = useState(false);

  useEffect(() => {
    const h = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  useEffect(() => {
    params.then(({ id }) => {
      fetch(`/api/applications/${encodeURIComponent(id)}`)
        .then(r => {
          if (r.status === 401) { router.push("/auth"); return null; }
          return r.json();
        })
        .then(data => {
          if (!data) return;
          if (data.application) {
            const a = data.application;
            setApp({
              id: a.id, name: a.name, avatar: a.avatar,
              decision: a.status, date: a.date,
              amount: Number(a.amount), loanType: a.loanType || "Personal",
              income: Number(a.income), monthlyIncome: Number(a.monthlyIncome) || Math.round(Number(a.income) / 12),
              monthlyExpenses: Number(a.monthlyExpenses) || 0,
              emi: Number(a.emi) || 0, dti: a.dti,
              creditUtilization: a.creditUtilization || 0,
              totalLiabilities: Number(a.totalLiabilities) || 0,
              creditScore: a.creditScore || a["creditScore"] || 0,
              loanToIncome: Number(a.loanToIncome) || 0,
              interestRate: Number(a.interestRate) || 0,
              tenure: a.tenure || 36,
              score: a.score, risk: a.risk,
            });
          } else {
            setError("Application not found");
          }
        })
        .catch(() => setError("Failed to load application"))
        .finally(() => setLoading(false));
    });
  }, [params, router]);

  useEffect(() => {
    if (app) setTimeout(() => setAnimBars(true), 300);
  }, [app]);

  if (loading) return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: "#050508", color: "#F0EEFF", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid rgba(255,107,255,0.2)", borderTopColor: "#FF6BFF", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <div style={{ fontSize: 14, color: "rgba(240,238,255,0.4)", fontWeight: 700 }}>Loading application...</div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error || !app) return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: "#050508", color: "#F0EEFF", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{error || "Application not found"}</div>
        <button onClick={() => router.push("/dashboard")} style={{ marginTop: 16, padding: "10px 24px", background: "linear-gradient(135deg,#FF6BFF,#00D4FF)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 800, cursor: "pointer" }}>Back to Dashboard</button>
      </div>
    </div>
  );

  const surplus = app.monthlyIncome - app.monthlyExpenses - app.emi;
  const expPct = app.monthlyIncome ? Math.round((app.monthlyExpenses / app.monthlyIncome) * 100) : 0;
  const emiPct = app.monthlyIncome ? Math.round((app.emi / app.monthlyIncome) * 100) : 0;
  const surplusPct = app.monthlyIncome ? Math.round((surplus / app.monthlyIncome) * 100) : 0;
  const decColor = DC[app.decision] || "#FFB800";
  const riskColor = RC[app.risk] || "#FFB800";

  const factors = [
    { label: "Credit Score", score: Math.min(100, Math.round((app.creditScore / 850) * 100)), color: app.creditScore >= 750 ? "#00FFB3" : app.creditScore >= 650 ? "#FFB800" : "#FF6B5B", value: String(app.creditScore) },
    { label: "DTI Ratio", score: Math.max(0, 100 - app.dti * 1.5), color: app.dti < 35 ? "#00FFB3" : app.dti < 50 ? "#FFB800" : "#FF6B5B", value: `${app.dti}%` },
    { label: "Income Stability", score: Math.min(100, Math.round((app.income / 2000000) * 100)), color: "#00D4FF", value: `₹${(app.income / 100000).toFixed(1)}L/yr` },
    { label: "Loan-to-Income", score: Math.max(0, 100 - app.loanToIncome * 15), color: app.loanToIncome < 3 ? "#00FFB3" : app.loanToIncome < 5 ? "#FFB800" : "#FF6B5B", value: `${app.loanToIncome}×` },
    { label: "Credit Utilization", score: Math.max(0, 100 - app.creditUtilization * 1.5), color: app.creditUtilization < 30 ? "#00FFB3" : app.creditUtilization < 50 ? "#FFB800" : "#FF6B5B", value: `${app.creditUtilization}%` },
  ];

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: "#050508", color: "#F0EEFF", minHeight: "100vh", cursor: "none", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:linear-gradient(#FF6BFF,#00D4FF);border-radius:2px;}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scanPulse{0%{transform:translateY(-200%);opacity:0}15%{opacity:1}85%{opacity:1}100%{transform:translateY(4000%);opacity:0}}
        .gradient-text{background:linear-gradient(135deg,#FF6BFF 0%,#A855F7 30%,#00D4FF 65%,#00FFB3 100%);background-size:250% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 5s linear infinite;}
        .mono{font-family:'Space Mono',monospace;}
        .fu{animation:fadeUp 0.6s cubic-bezier(.16,1,.3,1) forwards;}
        .d1{animation-delay:.05s;opacity:0}.d2{animation-delay:.15s;opacity:0}.d3{animation-delay:.25s;opacity:0}.d4{animation-delay:.35s;opacity:0}.d5{animation-delay:.45s;opacity:0}
        .card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:18px;}
        .back-btn{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:8px 16px;color:rgba(240,238,255,.6);font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;cursor:none;transition:all .25s;}
        .back-btn:hover{border-color:rgba(255,107,255,.4);color:#FF6BFF;background:rgba(255,107,255,.06);}
        .stat-row{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.04);}
        .stat-row:last-child{border-bottom:none;}
      `}</style>

      {/* Cursor */}
      <div style={{ position: "fixed", zIndex: 9999, pointerEvents: "none", left: mouse.x - 8, top: mouse.y - 8, width: 16, height: 16, borderRadius: "50%", background: "radial-gradient(circle,#FF6BFF,#00D4FF)", boxShadow: "0 0 20px 6px rgba(255,107,255,0.55)", mixBlendMode: "screen" }} />
      <div style={{ position: "fixed", zIndex: 9998, pointerEvents: "none", left: mouse.x - 28, top: mouse.y - 28, width: 56, height: 56, borderRadius: "50%", border: "1px solid rgba(255,107,255,0.22)", transition: "left .14s ease,top .14s ease" }} />

      {/* BG */}
      <div style={{ position: "fixed", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,255,.08) 0%,transparent 70%)", top: "-10%", right: "5%", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,107,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,255,.025) 1px,transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none", zIndex: 0 }} />

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, height: 60, borderBottom: "1px solid rgba(255,255,255,.05)", background: "rgba(5,5,8,.9)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button className="back-btn" onClick={() => router.push("/dashboard")}>← Dashboard</button>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,.08)" }} />
          <div>
            <span style={{ fontSize: 13, fontWeight: 800 }}>{app.name}</span>
            <span className="mono" style={{ fontSize: 10, color: "rgba(240,238,255,.3)", marginLeft: 10 }}>{app.id}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="mono" style={{ fontSize: 10, color: "rgba(240,238,255,.3)", letterSpacing: ".08em" }}>RISK SCORE</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: riskColor }}>{app.score}<span style={{ fontSize: 11, opacity: .4 }}>/100</span></span>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div className="fu d1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#FF6BFF,#A855F7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, boxShadow: "0 0 24px rgba(255,107,255,.4)" }}>{app.avatar}</div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-.03em", marginBottom: 4 }}>{app.name}</h1>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span className="mono" style={{ fontSize: 11, color: "rgba(240,238,255,.35)" }}>{app.id}</span>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "rgba(240,238,255,.4)", fontWeight: 600 }}>{app.loanType}</span>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "rgba(240,238,255,.4)", fontWeight: 600 }}>{app.date}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ padding: "8px 20px", borderRadius: 100, background: `${riskColor}14`, border: `1px solid ${riskColor}40`, fontSize: 12, fontWeight: 800, color: riskColor }}>{app.risk} Risk</div>
            <div style={{ padding: "10px 22px", borderRadius: 12, background: `${decColor}18`, border: `1px solid ${decColor}45`, fontSize: 15, fontWeight: 900, color: decColor, letterSpacing: "-.01em" }}>
              {app.decision === "Approved" ? "✅" : app.decision === "Rejected" ? "❌" : app.decision === "Review" ? "🔍" : "⏳"} {app.decision}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>

          {/* Loan Details */}
          <div className="card fu d2" style={{ padding: "22px 24px" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#FF6BFF,#00D4FF,transparent)", animation: "scanPulse 4s ease-in-out infinite", borderRadius: "18px 18px 0 0" }} />
            <div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.3)", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 16 }}>Loan Details</div>
            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-.03em", marginBottom: 4, background: "linear-gradient(135deg,#FF6BFF,#00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              ₹{(app.amount / 100000).toFixed(1)}L
            </div>
            <div style={{ fontSize: 12, color: "rgba(240,238,255,.4)", marginBottom: 20 }}>Requested Amount</div>
            <div className="stat-row"><span style={{ fontSize: 12, color: "rgba(240,238,255,.5)" }}>Loan Type</span><span style={{ fontSize: 13, fontWeight: 700 }}>{app.loanType}</span></div>
            <div className="stat-row"><span style={{ fontSize: 12, color: "rgba(240,238,255,.5)" }}>Tenure</span><span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{app.tenure} months</span></div>
            <div className="stat-row"><span style={{ fontSize: 12, color: "rgba(240,238,255,.5)" }}>Interest Rate</span><span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "#FFB800" }}>{app.interestRate}% p.a.</span></div>
            <div className="stat-row"><span style={{ fontSize: 12, color: "rgba(240,238,255,.5)" }}>Loan-to-Income</span><span className="mono" style={{ fontSize: 12, fontWeight: 700, color: app.loanToIncome > 5 ? "#FF6B5B" : app.loanToIncome > 3 ? "#FFB800" : "#00FFB3" }}>{app.loanToIncome}×</span></div>
            <div className="stat-row"><span style={{ fontSize: 12, color: "rgba(240,238,255,.5)" }}>EMI</span><span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>₹{app.emi.toLocaleString()}/mo</span></div>
          </div>

          {/* Financial Overview */}
          <div className="card fu d3" style={{ padding: "22px 24px", position: "relative" }}>
            <div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.3)", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 16 }}>Financial Overview</div>
            <div className="stat-row"><span style={{ fontSize: 12, color: "rgba(240,238,255,.5)" }}>Annual Income</span><span style={{ fontSize: 13, fontWeight: 700 }}>₹{(app.income / 100000).toFixed(1)}L</span></div>
            <div className="stat-row"><span style={{ fontSize: 12, color: "rgba(240,238,255,.5)" }}>Monthly Income</span><span style={{ fontSize: 13, fontWeight: 700 }}>₹{app.monthlyIncome.toLocaleString()}</span></div>
            <div className="stat-row"><span style={{ fontSize: 12, color: "rgba(240,238,255,.5)" }}>Monthly Expenses</span><span style={{ fontSize: 13, fontWeight: 700, color: "#FFB800" }}>₹{app.monthlyExpenses.toLocaleString()}</span></div>
            <div className="stat-row"><span style={{ fontSize: 12, color: "rgba(240,238,255,.5)" }}>Monthly EMI</span><span style={{ fontSize: 13, fontWeight: 700, color: "#FF6B5B" }}>₹{app.emi.toLocaleString()}</span></div>
            <div className="stat-row"><span style={{ fontSize: 12, color: "rgba(240,238,255,.5)" }}>Net Surplus</span><span style={{ fontSize: 13, fontWeight: 700, color: surplus > 0 ? "#00FFB3" : "#FF6B5B" }}>₹{Math.abs(surplus).toLocaleString()}{surplus < 0 ? " deficit" : ""}</span></div>
            {/* Breakdown bar */}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 1 }}>
                <div style={{ width: `${expPct}%`, background: "#FFB800", transition: "width 1s cubic-bezier(.16,1,.3,1)" }} title="Expenses" />
                <div style={{ width: `${emiPct}%`, background: "#FF6B5B", transition: "width 1s cubic-bezier(.16,1,.3,1)" }} title="EMI" />
                <div style={{ width: `${surplusPct}%`, background: "#00FFB3", transition: "width 1s cubic-bezier(.16,1,.3,1)" }} title="Surplus" />
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                {[{ c: "#FFB800", l: `Expenses ${expPct}%` }, { c: "#FF6B5B", l: `EMI ${emiPct}%` }, { c: "#00FFB3", l: `Surplus ${surplusPct}%` }].map(x => (
                  <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 7, height: 7, borderRadius: 2, background: x.c }} /><span style={{ fontSize: 10, color: "rgba(240,238,255,.4)", fontWeight: 700 }}>{x.l}</span></div>
                ))}
              </div>
            </div>
          </div>

          {/* Credit Profile */}
          <div className="card fu d4" style={{ padding: "22px 24px", position: "relative" }}>
            <div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.3)", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 16 }}>Credit Profile</div>
            <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: app.creditScore >= 750 ? "#00FFB3" : app.creditScore >= 650 ? "#FFB800" : "#FF6B5B", letterSpacing: "-.03em" }}>{app.creditScore}</div>
                <div style={{ fontSize: 10, color: "rgba(240,238,255,.35)", fontWeight: 700 }}>{app.creditScore >= 750 ? "EXCELLENT" : app.creditScore >= 700 ? "GOOD" : app.creditScore >= 650 ? "FAIR" : "POOR"}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 8, background: "rgba(255,255,255,.05)", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ width: animBars ? `${Math.round((app.creditScore / 850) * 100)}%` : "0%", height: "100%", background: `linear-gradient(90deg,${app.creditScore >= 750 ? "#00FFB3" : app.creditScore >= 650 ? "#FFB800" : "#FF6B5B"}80, ${app.creditScore >= 750 ? "#00FFB3" : app.creditScore >= 650 ? "#FFB800" : "#FF6B5B"})`, transition: "width 1.2s cubic-bezier(.16,1,.3,1)", borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 10, color: "rgba(240,238,255,.3)" }}>Out of 850</div>
              </div>
            </div>
            <div className="stat-row"><span style={{ fontSize: 12, color: "rgba(240,238,255,.5)" }}>DTI Ratio</span><span className="mono" style={{ fontSize: 12, fontWeight: 700, color: app.dti > 50 ? "#FF6B5B" : app.dti > 35 ? "#FFB800" : "#00FFB3" }}>{app.dti}%</span></div>
            <div className="stat-row"><span style={{ fontSize: 12, color: "rgba(240,238,255,.5)" }}>Credit Utilization</span><span className="mono" style={{ fontSize: 12, fontWeight: 700, color: app.creditUtilization > 50 ? "#FF6B5B" : app.creditUtilization > 30 ? "#FFB800" : "#00FFB3" }}>{app.creditUtilization}%</span></div>
            <div className="stat-row"><span style={{ fontSize: 12, color: "rgba(240,238,255,.5)" }}>Total Liabilities</span><span style={{ fontSize: 12, fontWeight: 700 }}>₹{(app.totalLiabilities / 100000).toFixed(1)}L</span></div>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="card fu d5" style={{ padding: "24px 26px", marginBottom: 16 }}>
          <div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.3)", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 20 }}>Risk Factor Analysis</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 20 }}>
            {factors.map(f => (
              <div key={f.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(240,238,255,.6)" }}>{f.label}</span>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: f.color }}>{f.value}</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,.06)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: animBars ? `${Math.max(0, Math.min(100, f.score))}%` : "0%", height: "100%", background: `linear-gradient(90deg,${f.color}80,${f.color})`, borderRadius: 3, transition: "width 1.3s cubic-bezier(.16,1,.3,1)", boxShadow: `0 0 10px ${f.color}60` }} />
                </div>
                <div style={{ fontSize: 10, color: "rgba(240,238,255,.3)", marginTop: 4 }}>{Math.max(0, Math.min(100, Math.round(f.score)))}/100</div>
              </div>
            ))}
          </div>
        </div>

        {/* Verdict */}
        <div className="fu" style={{ animationDelay: ".5s", opacity: 0, padding: "22px 26px", borderRadius: 18, background: `${decColor}0D`, border: `1px solid ${decColor}35`, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: `0 0 40px ${decColor}12` }}>
          <div>
            <div className="mono" style={{ fontSize: 9, color: `${decColor}90`, letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 8 }}>System Verdict</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: decColor, letterSpacing: "-.02em" }}>
              {app.decision === "Approved" ? "✅ APPROVED" : app.decision === "Rejected" ? "❌ REJECTED" : app.decision === "Review" ? "🔍 UNDER REVIEW" : "⏳ PENDING"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.35)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>Composite Score</div>
            <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: "-.03em", color: riskColor }}>{app.score}<span style={{ fontSize: 18, opacity: .4 }}>/100</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
