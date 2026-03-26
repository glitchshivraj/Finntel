"use client";
import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Applicant {
  id: string; name: string; avatar: string; age: number;
  jobTitle: string; company: string; employmentType: string; workExp: number;
  location: string; email: string; phone: string;
  annualIncome: number; monthlyIncome: number; monthlyExpenses: number;
  creditScore: number; creditAge: number; creditAccounts: number;
  latePayments: number; defaults: number; creditCardUsage: number; creditUtilization: number;
  loanAmount: number; loanType: string; loanTenure: number; interestRate: number; emi: number;
  existingLoans: number; totalLiabilities: number; dti: number;
  score: number; risk: "Low" | "Medium" | "High";
  decision: "Approved" | "Rejected" | "Review";
  confidence: number;
  appliedAt: string; processedAt: string; processingTime: string;
}

// ─── Risk Engine ──────────────────────────────────────────────────────────────
function computeScore(a: Applicant) {
  const creditPts  = a.creditScore >= 750 ? 30 : a.creditScore >= 700 ? 24 : a.creditScore >= 650 ? 16 : a.creditScore >= 600 ? 8 : 2;
  const incomePts  = a.annualIncome >= 1500000 ? 25 : a.annualIncome >= 800000 ? 20 : a.annualIncome >= 400000 ? 13 : a.annualIncome >= 200000 ? 6 : 2;
  const dtiPts     = a.dti <= 20 ? 20 : a.dti <= 35 ? 15 : a.dti <= 50 ? 8 : a.dti <= 65 ? 3 : 0;
  const empPts     = a.workExp >= 5 ? 15 : a.workExp >= 3 ? 12 : a.workExp >= 1 ? 7 : 2;
  const debtPts    = a.totalLiabilities < 500000 ? 10 : a.totalLiabilities < 1000000 ? 7 : a.totalLiabilities < 2000000 ? 4 : 0;
  return { creditPts, incomePts, dtiPts, empPts, debtPts, total: Math.min(100, creditPts + incomePts + dtiPts + empPts + debtPts) };
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const APP: Applicant = {
  id: "#FNT-004821", name: "Arjun Mehta", avatar: "AM", age: 34,
  jobTitle: "Senior Software Engineer", company: "Infosys Technologies Ltd.",
  employmentType: "Salaried", workExp: 4.2,
  location: "Mumbai, Maharashtra",
  email: "arjun.mehta@gmail.com", phone: "+91 98765 43210",
  annualIncome: 1840000, monthlyIncome: 153333, monthlyExpenses: 42000,
  creditScore: 784, creditAge: 7, creditAccounts: 5,
  latePayments: 0, defaults: 0, creditCardUsage: 18000, creditUtilization: 22,
  loanAmount: 1200000, loanType: "Home Improvement", loanTenure: 36,
  interestRate: 10.5, emi: 38900,
  existingLoans: 1, totalLiabilities: 420000, dti: 5,
  score: 91, risk: "Low", decision: "Approved", confidence: 94,
  appliedAt: "23 Mar 2024, 10:42 AM",
  processedAt: "23 Mar 2024, 10:42 AM",
  processingTime: "1.8s",
};

const BREAKDOWN = computeScore(APP);

const RULES = [
  { rule: "Credit Score ≥ 750",           result: true,  impact: "Low Risk",     reason: `Score is ${APP.creditScore} — exceeds threshold` },
  { rule: "DTI Ratio ≤ 35%",              result: true,  impact: "Low Risk",     reason: `DTI is only ${APP.dti}% — well within limit` },
  { rule: "Employment Tenure ≥ 3 years",  result: true,  impact: "Stable",       reason: `${APP.workExp} years at ${APP.company}` },
  { rule: "No defaults in 24 months",     result: true,  impact: "Approved",     reason: "Clean repayment history — 0 defaults" },
  { rule: "Loan ≤ 5× Annual Income",      result: true,  impact: "Low Risk",     reason: `Loan is ${(APP.loanAmount/APP.annualIncome).toFixed(2)}× income` },
  { rule: "Credit Utilization ≤ 30%",     result: true,  impact: "Healthy",      reason: `Utilization at ${APP.creditUtilization}% — low` },
  { rule: "Monthly Surplus ≥ EMI",        result: true,  impact: "Approved",     reason: `Surplus ₹${((APP.monthlyIncome - APP.monthlyExpenses - APP.emi)/1000).toFixed(0)}K after EMI` },
];

const TIMELINE = [
  { label: "Application Submitted",  time: "10:42:00 AM", note: "All documents uploaded successfully",       status: "done"    },
  { label: "Document Verification",  time: "10:42:01 AM", note: "PAN, Aadhar, salary slip — all verified",   status: "done"    },
  { label: "Credit Bureau Check",    time: "10:42:01 AM", note: `CIBIL score pulled: ${APP.creditScore}`,    status: "done"    },
  { label: "Risk Engine Evaluation", time: "10:42:02 AM", note: `Base score computed: ${APP.score}/100`,     status: "done"    },
  { label: "ML Model Prediction",    time: "10:42:02 AM", note: `Confidence: ${APP.confidence}% → Approve`,  status: "done"    },
  { label: "Final Decision",         time: "10:42:02 AM", note: "Loan approved — agreement dispatched",      status: "done"    },
  { label: "Disbursement",           time: "Expected: 25 Mar 2024",note: "Pending e-signature",             status: "pending" },
];

const FACTORS = [
  { label: "Credit Score",          impact: "High Positive", color: "#00FFB3", pct: 92 },
  { label: "Debt-to-Income Ratio",  impact: "High Positive", color: "#00D4FF", pct: 88 },
  { label: "Employment Stability",  impact: "Positive",      color: "#FF6BFF", pct: 76 },
  { label: "Total Liabilities",     impact: "Positive",      color: "#FFB800", pct: 70 },
  { label: "Credit Utilization",    impact: "Positive",      color: "#A855F7", pct: 65 },
];

const ALERTS = APP.latePayments > 0 || APP.dti > 40 || APP.creditUtilization > 50 || APP.defaults > 0
  ? [
      APP.latePayments > 0 && { type: "warning", icon: "⚠️", msg: `${APP.latePayments} late payment(s) in history — affects credit score` },
      APP.dti > 40 && { type: "danger", icon: "🚨", msg: `High DTI of ${APP.dti}% — exceeds safe limit of 35%` },
      APP.creditUtilization > 50 && { type: "warning", icon: "⚠️", msg: `Credit utilization ${APP.creditUtilization}% is high` },
      APP.defaults > 0 && { type: "danger", icon: "🚨", msg: `${APP.defaults} loan default(s) detected` },
    ].filter(Boolean)
  : [];

const DC = { Approved: "#00FFB3", Review: "#FFB800", Rejected: "#FF6B5B" };
const RC = { Low: "#00FFB3", Medium: "#FFB800", High: "#FF6B5B" };

function AnimNum({ to, prefix="", suffix="" }: { to: number; prefix?: string; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let c = 0; const step = to / 55;
    const t = setInterval(() => { c += step; if (c >= to) { setV(to); clearInterval(t); } else setV(Math.floor(c)); }, 16);
    return () => clearInterval(t);
  }, [to]);
  return <>{prefix}{v.toLocaleString()}{suffix}</>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ApplicantProfile() {
  const [mouse, setMouse] = useState({ x: -100, y: -100 });
  const [scoreAnim, setScoreAnim] = useState(0);
  const [barW, setBarW] = useState({ credit: 0, income: 0, dti: 0, emp: 0, debt: 0 });
  const [factorW, setFactorW] = useState(FACTORS.map(() => 0));
  const [tab, setTab] = useState<"overview"|"financial"|"decision"|"timeline">("overview");

  useEffect(() => { window.addEventListener("mousemove", e => setMouse({ x: e.clientX, y: e.clientY })); }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      let c = 0; const id = setInterval(() => { c += 1.7; if (c >= APP.score) { setScoreAnim(APP.score); clearInterval(id); } else setScoreAnim(Math.floor(c)); }, 18);
    }, 300);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => setBarW({ credit: BREAKDOWN.creditPts, income: BREAKDOWN.incomePts, dti: BREAKDOWN.dtiPts, emp: BREAKDOWN.empPts, debt: BREAKDOWN.debtPts }), 500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => setFactorW(FACTORS.map(f => f.pct)), 600);
    return () => clearTimeout(t);
  }, []);

  const decColor  = DC[APP.decision];
  const riskColor = RC[APP.risk];
  const surplus   = APP.monthlyIncome - APP.monthlyExpenses - APP.emi;

  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", background:"#050508", color:"#F0EEFF", minHeight:"100vh", cursor:"none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:linear-gradient(#FF6BFF,#00D4FF);border-radius:2px;}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scan{0%{transform:translateX(-100%)}100%{transform:translateX(500%)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.1}}
        @keyframes orbF{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-40px) scale(1.06)}}
        @keyframes pulse{0%{transform:scale(1);opacity:.5}100%{transform:scale(2.4);opacity:0}}
        @keyframes drawLine{from{stroke-dashoffset:600}to{stroke-dashoffset:0}}
        .gt{background:linear-gradient(135deg,#FF6BFF 0%,#A855F7 30%,#00D4FF 65%,#00FFB3 100%);background-size:250% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 5s linear infinite}
        .fu{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) both}
        .d1{animation-delay:.04s}.d2{animation-delay:.1s}.d3{animation-delay:.16s}.d4{animation-delay:.22s}.d5{animation-delay:.28s}.d6{animation-delay:.34s}.d7{animation-delay:.40s}
        .mono{font-family:'Space Mono',monospace}
        .card{background:rgba(12,10,20,.78);border:1px solid rgba(255,255,255,.07);border-radius:18px;backdrop-filter:blur(20px);position:relative;overflow:hidden}
        .row{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-radius:9px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05);margin-bottom:7px;transition:all .2s}
        .row:hover{background:rgba(255,107,255,.05);border-color:rgba(255,107,255,.12)}
        .tab{padding:9px 18px;border-radius:100px;font-family:'Outfit',sans-serif;font-weight:700;font-size:13px;cursor:none;transition:all .25s;border:1px solid transparent;color:rgba(240,238,255,.38);background:transparent}
        .tab.on{background:linear-gradient(135deg,rgba(255,107,255,.18),rgba(0,212,255,.12));border-color:rgba(255,107,255,.3);color:#F0EEFF}
        .tab:not(.on):hover{color:rgba(240,238,255,.65);border-color:rgba(255,255,255,.08)}
        .btn{display:flex;align-items:center;gap:7px;padding:9px 18px;border-radius:10px;font-family:'Outfit',sans-serif;font-weight:700;font-size:13px;cursor:none;transition:all .25s}
        .btn-ghost{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:rgba(240,238,255,.6)}
        .btn-ghost:hover{border-color:rgba(255,107,255,.3);color:#F0EEFF}
        .btn-primary{background:linear-gradient(135deg,#FF6BFF,#A855F7,#00D4FF);background-size:200% 200%;animation:gradShift 4s ease infinite;border:none;color:#fff}
        .btn-primary:hover{transform:translateY(-1px);box-shadow:0 12px 30px rgba(255,107,255,.35)}
        .score-track{fill:none;stroke:rgba(255,255,255,.06)}
        .score-fill{fill:none;stroke-linecap:round;transition:stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1)}
        .bar-fill{transition:width 1.2s cubic-bezier(.16,1,.3,1)}
        .rule-pass{background:rgba(0,255,179,.05);border:1px solid rgba(0,255,179,.18);border-radius:12px;padding:12px 16px;margin-bottom:8px}
        .rule-fail{background:rgba(255,107,91,.05);border:1px solid rgba(255,107,91,.18);border-radius:12px;padding:12px 16px;margin-bottom:8px}
        .tl-dot-done{width:12px;height:12px;border-radius:50%;background:#00FFB3;box-shadow:0 0 12px rgba(0,255,179,.55);flex-shrink:0;position:relative}
        .tl-dot-done::after{content:'';position:absolute;inset:-4px;border-radius:50%;border:1px solid #00FFB3;animation:pulse 2.5s ease-out infinite}
        .tl-dot-pend{width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.2);flex-shrink:0}
        .alert-warn{background:rgba(255,184,0,.07);border:1px solid rgba(255,184,0,.25);border-radius:11px;padding:12px 16px;margin-bottom:8px;display:flex;gap:10px;align-items:flex-start}
        .alert-danger{background:rgba(255,107,91,.07);border:1px solid rgba(255,107,91,.25);border-radius:11px;padding:12px 16px;margin-bottom:8px;display:flex;gap:10px;align-items:flex-start}
        .section-label{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;margin-bottom:16px;display:flex;align-items:center;gap:8px}
        .section-label::before{content:'';display:inline-block;width:16px;height:2px;border-radius:1px;background:currentColor;opacity:.7}
        .credit-line{fill:none;stroke-dasharray:600;animation:drawLine 1.8s cubic-bezier(.16,1,.3,1) forwards}
      `}</style>

      {/* Cursor */}
      <div style={{ position:"fixed", zIndex:9999, pointerEvents:"none", left:mouse.x-8, top:mouse.y-8, width:16, height:16, borderRadius:"50%", background:"radial-gradient(circle,#FF6BFF,#00D4FF)", boxShadow:"0 0 20px 6px rgba(255,107,255,.55)", mixBlendMode:"screen" }}/>
      <div style={{ position:"fixed", zIndex:9998, pointerEvents:"none", left:mouse.x-28, top:mouse.y-28, width:56, height:56, borderRadius:"50%", border:"1px solid rgba(255,107,255,.2)", transition:"left .14s ease,top .14s ease" }}/>

      {/* Background */}
      <div style={{ position:"fixed", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,107,255,.08),transparent 70%)", top:"-10%", right:"5%", animation:"orbF 14s ease-in-out infinite", pointerEvents:"none", zIndex:0 }}/>
      <div style={{ position:"fixed", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,212,255,.06),transparent 70%)", bottom:"5%", left:"5%", animation:"orbF 11s ease-in-out infinite reverse", pointerEvents:"none", zIndex:0 }}/>
      <div style={{ position:"fixed", inset:0, backgroundImage:"linear-gradient(rgba(255,107,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,255,.025) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none", zIndex:0 }}/>

      {/* ── NAV ── */}
      <nav style={{ position:"sticky", top:0, zIndex:50, height:62, background:"rgba(5,5,8,.88)", backdropFilter:"blur(24px)", borderBottom:"1px solid rgba(255,255,255,.05)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 36px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <button className="btn btn-ghost" style={{ padding:"8px 14px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Applications
          </button>
          <div style={{ width:1, height:22, background:"rgba(255,255,255,.07)" }}/>
          <span style={{ fontSize:14, fontWeight:800 }}>{APP.name}</span>
          <span className="mono" style={{ fontSize:10, color:"rgba(240,238,255,.32)" }}>{APP.id}</span>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btn-ghost">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export PDF
          </button>
          <button className="btn btn-primary">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Notify Applicant
          </button>
        </div>
      </nav>

      <main style={{ maxWidth:1280, margin:"0 auto", padding:"32px 36px", position:"relative", zIndex:1 }}>

        {/* ══════════════════════════════════════════════
            SECTION 1 — APPLICANT HEADER
        ══════════════════════════════════════════════ */}
        <div className="fu d1" style={{ display:"grid", gridTemplateColumns:"auto 1fr auto", gap:24, alignItems:"center", marginBottom:24 }}>
          {/* Avatar */}
          <div style={{ position:"relative" }}>
            <div style={{ width:86, height:86, borderRadius:"50%", background:"linear-gradient(135deg,rgba(255,107,255,.35),rgba(168,85,247,.3),rgba(0,212,255,.25))", border:"2px solid rgba(255,107,255,.35)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:900, boxShadow:"0 0 40px rgba(255,107,255,.22)" }}>
              {APP.avatar}
            </div>
            <div style={{ position:"absolute", bottom:3, right:3, width:18, height:18, borderRadius:"50%", background:decColor, border:"2.5px solid #050508", boxShadow:`0 0 12px ${decColor}` }}/>
          </div>

          {/* Identity */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
              <h1 style={{ fontSize:"clamp(22px,3vw,34px)", fontWeight:900, letterSpacing:"-0.03em" }}>{APP.name}</h1>
              <span style={{ fontSize:13, color:"rgba(240,238,255,.4)", fontWeight:600 }}>Age {APP.age}</span>
              {/* Risk Score pill */}
              <div style={{ display:"flex", alignItems:"center", gap:6, background:`${riskColor}12`, border:`1px solid ${riskColor}30`, borderRadius:100, padding:"4px 14px" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:riskColor, boxShadow:`0 0 8px ${riskColor}`, animation:"blink 1.4s infinite" }}/>
                <span className="mono" style={{ fontSize:10, color:riskColor, fontWeight:700, letterSpacing:".1em" }}>{APP.risk.toUpperCase()} RISK</span>
              </div>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:18 }}>
              {[
                { icon:"💼", v:`${APP.jobTitle} · ${APP.company}` },
                { icon:"📍", v:APP.location },
                { icon:"📧", v:APP.email },
                { icon:"📱", v:APP.phone },
              ].map(x => (
                <div key={x.v} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"rgba(240,238,255,.45)", fontWeight:600 }}>
                  <span>{x.icon}</span><span>{x.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Score gauge + Decision */}
          <div style={{ textAlign:"center", flexShrink:0 }}>
            <div style={{ position:"relative", width:130, height:130, margin:"0 auto 10px" }}>
              <svg width="130" height="130" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r="54" className="score-track" strokeWidth="10"/>
                <circle cx="65" cy="65" r="54" className="score-fill" stroke={decColor} strokeWidth="10"
                  strokeDasharray={`${2*Math.PI*54}`}
                  strokeDashoffset={`${2*Math.PI*54*(1-scoreAnim/100)}`}
                  transform="rotate(-90 65 65)"/>
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <div style={{ fontSize:36, fontWeight:900, color:decColor, textShadow:`0 0 24px ${decColor}60` }}>{scoreAnim}</div>
                <div style={{ fontSize:9, color:"rgba(240,238,255,.35)", fontWeight:700 }}>RISK SCORE</div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:7, justifyContent:"center", background:`${decColor}12`, border:`1px solid ${decColor}30`, borderRadius:100, padding:"6px 18px" }}>
              <span>{APP.decision==="Approved"?"✅":APP.decision==="Review"?"⚠️":"❌"}</span>
              <span className="mono" style={{ fontSize:11, color:decColor, fontWeight:700, letterSpacing:".1em" }}>{APP.decision.toUpperCase()}</span>
            </div>
            <div className="mono" style={{ fontSize:10, color:"rgba(240,238,255,.3)", marginTop:6 }}>Confidence: {APP.confidence}%</div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 2 — LOAN SUMMARY STRIP
        ══════════════════════════════════════════════ */}
        <div className="card fu d2" style={{ padding:"20px 28px", marginBottom:24, display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:0 }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,#FF6BFF,#00D4FF,transparent)", animation:"scan 3.5s ease-in-out infinite", pointerEvents:"none" }}/>
          {[
            { label:"Loan Amount",  value:`₹${(APP.loanAmount/100000).toFixed(1)}L`,   color:"#FF6BFF" },
            { label:"Loan Type",    value:APP.loanType,                                  color:"#00D4FF" },
            { label:"Interest Rate",value:`${APP.interestRate}% p.a.`,                  color:"#FFB800" },
            { label:"Monthly EMI",  value:`₹${APP.emi.toLocaleString()}`,                color:"#00FFB3" },
            { label:"Tenure",       value:`${APP.loanTenure} months`,                   color:"#A855F7" },
            { label:"Applied",      value:APP.appliedAt.split(",")[0],                   color:"rgba(240,238,255,.5)" },
          ].map((c, i) => (
            <div key={c.label} style={{ padding:"0 20px", borderRight: i<5?"1px solid rgba(255,255,255,.06)":"none", textAlign:"center" }}>
              <div style={{ fontSize:10, color:"rgba(240,238,255,.38)", fontWeight:700, letterSpacing:".05em", marginBottom:8, textTransform:"uppercase" }}>{c.label}</div>
              <div style={{ fontSize:18, fontWeight:900, color:c.color, letterSpacing:"-0.02em" }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="fu d3" style={{ display:"flex", gap:6, marginBottom:22, background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", borderRadius:100, padding:5, width:"fit-content" }}>
          {(["overview","financial","decision","timeline"] as const).map(t => (
            <button key={t} className={`tab ${tab===t?"on":""}`} onClick={()=>setTab(t)}>
              {t==="overview"?"👤 Overview":t==="financial"?"💰 Financial":t==="decision"?"🧠 Decision":"📅 Timeline"}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════
            TAB: OVERVIEW
        ══════════════════════════════════════════════ */}
        {tab === "overview" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:18 }}>

            {/* Personal Details */}
            <div className="card fu d3" style={{ padding:"24px" }}>
              <div className="section-label" style={{ color:"#FF6BFF" }}>Personal Details</div>
              {[
                ["Full Name",         APP.name],
                ["Age",               `${APP.age} years`],
                ["Employment Type",   APP.employmentType],
                ["Company",           APP.company],
                ["Work Experience",   `${APP.workExp} years`],
                ["Monthly Income",    `₹${APP.monthlyIncome.toLocaleString()}`],
                ["Location",          APP.location],
              ].map(([k,v]) => (
                <div key={k} className="row">
                  <span style={{ fontSize:12, color:"rgba(240,238,255,.42)", fontWeight:600 }}>{k}</span>
                  <span style={{ fontSize:13, fontWeight:800 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Credit Profile */}
            <div className="card fu d4" style={{ padding:"24px" }}>
              <div className="section-label" style={{ color:"#00D4FF" }}>Credit Profile</div>
              <div style={{ textAlign:"center", marginBottom:18, padding:"16px", background:"rgba(0,212,255,.05)", border:"1px solid rgba(0,212,255,.18)", borderRadius:14 }}>
                <div style={{ fontSize:10, color:"rgba(240,238,255,.38)", fontWeight:700, letterSpacing:".08em", marginBottom:6 }}>CIBIL SCORE</div>
                <div style={{ fontSize:52, fontWeight:900, letterSpacing:"-0.04em", background:"linear-gradient(135deg,#00D4FF,#00FFB3)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                  {APP.creditScore}
                </div>
                <div style={{ fontSize:12, color:APP.creditScore>=750?"#00FFB3":APP.creditScore>=700?"#00D4FF":"#FFB800", fontWeight:800, marginTop:4 }}>
                  {APP.creditScore>=750?"Excellent":APP.creditScore>=700?"Good":APP.creditScore>=650?"Fair":"Poor"}
                </div>
                {/* Mini score bar */}
                <div style={{ marginTop:10, height:5, background:"rgba(255,255,255,.06)", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${((APP.creditScore-300)/600)*100}%`, background:"linear-gradient(90deg,#FF6B5B,#FFB800,#00FFB3)", borderRadius:3 }}/>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                  <span className="mono" style={{ fontSize:8, color:"rgba(240,238,255,.25)" }}>300</span>
                  <span className="mono" style={{ fontSize:8, color:"rgba(240,238,255,.25)" }}>900</span>
                </div>
              </div>
              {[
                ["Credit Age",        `${APP.creditAge} years`,             "rgba(240,238,255,.85)"],
                ["Credit Accounts",   `${APP.creditAccounts} active`,       "rgba(240,238,255,.85)"],
                ["Late Payments",     `${APP.latePayments}`,                APP.latePayments>0?"#FF6B5B":"#00FFB3"],
                ["Defaults",          `${APP.defaults}`,                    APP.defaults>0?"#FF6B5B":"#00FFB3"],
                ["Credit Utilization",`${APP.creditUtilization}%`,          APP.creditUtilization>50?"#FF6B5B":APP.creditUtilization>30?"#FFB800":"#00FFB3"],
              ].map(([k,v,c]) => (
                <div key={k} className="row">
                  <span style={{ fontSize:12, color:"rgba(240,238,255,.42)", fontWeight:600 }}>{k}</span>
                  <span style={{ fontSize:13, fontWeight:800, color:c as string }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Risk Alerts */}
            <div className="card fu d5" style={{ padding:"24px" }}>
              <div className="section-label" style={{ color:"#FF6B5B" }}>Risk Alerts</div>
              {ALERTS.length === 0 ? (
                <div style={{ textAlign:"center", padding:"32px 20px" }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
                  <div style={{ fontSize:14, fontWeight:800, color:"#00FFB3", marginBottom:8 }}>No Risk Alerts</div>
                  <div style={{ fontSize:12, color:"rgba(240,238,255,.4)", lineHeight:1.7 }}>All financial parameters are within acceptable limits. This is a clean profile.</div>
                </div>
              ) : (
                ALERTS.map((a: any, i) => (
                  <div key={i} className={a.type==="danger"?"alert-danger":"alert-warn"}>
                    <span style={{ fontSize:16, flexShrink:0 }}>{a.icon}</span>
                    <span style={{ fontSize:13, color:"rgba(240,238,255,.7)", lineHeight:1.6 }}>{a.msg}</span>
                  </div>
                ))
              )}

              {/* ML / AI Quick Summary */}
              <div style={{ marginTop:16, padding:"16px", background:"linear-gradient(135deg,rgba(255,107,255,.07),rgba(0,212,255,.05))", border:"1px solid rgba(255,107,255,.18)", borderRadius:14 }}>
                <div className="section-label" style={{ color:"#FF6BFF", marginBottom:12 }}>AI / ML Insight</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:10, color:"rgba(240,238,255,.38)", fontWeight:700, marginBottom:4 }}>MODEL PREDICTION</div>
                    <div style={{ fontSize:20, fontWeight:900, color:decColor }}>{APP.decision==="Approved"?"✅":APP.decision==="Review"?"⚠️":"❌"} {APP.decision}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:10, color:"rgba(240,238,255,.38)", fontWeight:700, marginBottom:4 }}>CONFIDENCE</div>
                    <div style={{ fontSize:28, fontWeight:900, color:"#FF6BFF" }}>{APP.confidence}%</div>
                  </div>
                </div>
                <div style={{ height:5, background:"rgba(255,255,255,.06)", borderRadius:3 }}>
                  <div style={{ height:"100%", width:`${APP.confidence}%`, background:"linear-gradient(90deg,#FF6BFF,#00D4FF)", borderRadius:3, boxShadow:"0 0 10px rgba(255,107,255,.5)" }}/>
                </div>
                <div style={{ fontSize:11, color:"rgba(240,238,255,.4)", marginTop:8, lineHeight:1.6 }}>
                  Logistic Regression model with SHAP explainability. Trained on 2.4M loan records.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: FINANCIAL
        ══════════════════════════════════════════════ */}
        {tab === "financial" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>

            {/* Financial Details */}
            <div className="card fu d3" style={{ padding:"24px" }}>
              <div className="section-label" style={{ color:"#FFB800" }}>Financial Details</div>
              {[
                ["Monthly Income",      `₹${APP.monthlyIncome.toLocaleString()}`,     "#00FFB3"],
                ["Monthly Expenses",    `₹${APP.monthlyExpenses.toLocaleString()}`,    "#FFB800"],
                ["Proposed EMI",        `₹${APP.emi.toLocaleString()}`,                "#FF6BFF"],
                ["Monthly Surplus",     `₹${surplus.toLocaleString()}`,                surplus>0?"#00FFB3":"#FF6B5B"],
                ["Existing Loans",      `${APP.existingLoans}`,                        APP.existingLoans>2?"#FFB800":"rgba(240,238,255,.85)"],
                ["Total Liabilities",   `₹${APP.totalLiabilities.toLocaleString()}`,  APP.totalLiabilities>1000000?"#FF6B5B":"rgba(240,238,255,.85)"],
                ["Credit Card Usage",   `₹${APP.creditCardUsage.toLocaleString()}/mo`, "#A855F7"],
                ["Credit Utilization",  `${APP.creditUtilization}%`,                  APP.creditUtilization>50?"#FF6B5B":APP.creditUtilization>30?"#FFB800":"#00FFB3"],
                ["Debt-to-Income",      `${APP.dti}%`,                                APP.dti>50?"#FF6B5B":APP.dti>35?"#FFB800":"#00FFB3"],
              ].map(([k,v,c]) => (
                <div key={k} className="row">
                  <span style={{ fontSize:12, color:"rgba(240,238,255,.42)", fontWeight:600 }}>{k}</span>
                  <span style={{ fontSize:13, fontWeight:800, color:c as string }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Loan Details */}
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <div className="card fu d4" style={{ padding:"24px" }}>
                <div className="section-label" style={{ color:"#00FFB3" }}>Loan Details</div>
                {[
                  ["Loan Amount",   `₹${APP.loanAmount.toLocaleString()}`],
                  ["Loan Type",     APP.loanType],
                  ["Tenure",        `${APP.loanTenure} months`],
                  ["Interest Rate", `${APP.interestRate}% p.a.`],
                  ["Monthly EMI",   `₹${APP.emi.toLocaleString()}`],
                  ["Total Interest",`₹${(APP.emi*APP.loanTenure-APP.loanAmount).toLocaleString()}`],
                  ["Total Payable", `₹${(APP.emi*APP.loanTenure).toLocaleString()}`],
                ].map(([k,v]) => (
                  <div key={k} className="row">
                    <span style={{ fontSize:12, color:"rgba(240,238,255,.42)", fontWeight:600 }}>{k}</span>
                    <span style={{ fontSize:13, fontWeight:800 }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* DTI Visual */}
              <div className="card fu d5" style={{ padding:"24px" }}>
                <div className="section-label" style={{ color:"#00D4FF" }}>Income vs Obligations</div>
                {[
                  { label:"Income",    value:APP.monthlyIncome, color:"#00FFB3", pct:100 },
                  { label:"Expenses",  value:APP.monthlyExpenses, color:"#FFB800", pct:Math.round((APP.monthlyExpenses/APP.monthlyIncome)*100) },
                  { label:"EMI",       value:APP.emi, color:"#FF6BFF", pct:Math.round((APP.emi/APP.monthlyIncome)*100) },
                  { label:"Surplus",   value:surplus, color:"#00D4FF", pct:Math.round((surplus/APP.monthlyIncome)*100) },
                ].map(b => (
                  <div key={b.label} style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:"rgba(240,238,255,.55)" }}>{b.label}</span>
                      <div style={{ display:"flex", gap:10 }}>
                        <span style={{ fontSize:12, fontWeight:800, color:b.color }}>₹{b.value.toLocaleString()}</span>
                        <span className="mono" style={{ fontSize:10, color:"rgba(240,238,255,.3)" }}>{b.pct}%</span>
                      </div>
                    </div>
                    <div style={{ height:6, background:"rgba(255,255,255,.05)", borderRadius:3 }}>
                      <div className="bar-fill" style={{ height:"100%", width:`${b.pct}%`, background:b.color, borderRadius:3, boxShadow:`0 0 10px ${b.color}55` }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: DECISION
        ══════════════════════════════════════════════ */}
        {tab === "decision" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>

            {/* Score Breakdown */}
            <div className="card fu d3" style={{ padding:"26px" }}>
              <div className="section-label" style={{ color:"#FF6BFF" }}>Decision Intelligence — Score Breakdown</div>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:22 }}>
                <div style={{ textAlign:"center", padding:"18px 40px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:16 }}>
                  <div style={{ fontSize:10, color:"rgba(240,238,255,.38)", fontWeight:700, letterSpacing:".1em", marginBottom:6 }}>FINAL RISK SCORE</div>
                  <div style={{ fontSize:56, fontWeight:900, letterSpacing:"-0.04em", color:decColor, textShadow:`0 0 30px ${decColor}50` }}>{APP.score}</div>
                  <div style={{ fontSize:12, color:"rgba(240,238,255,.35)" }}>out of 100</div>
                  <div style={{ marginTop:10, display:"flex", gap:6 }}>
                    {["Credit","Income","DTI","Emp","Debt"].map(l => (
                      <div key={l} style={{ flex:1, height:3, borderRadius:2, background:"rgba(255,107,255,.3)", boxShadow:"0 0 6px rgba(255,107,255,.4)" }}/>
                    ))}
                  </div>
                </div>
              </div>
              {[
                { label:"Credit Score Contribution",  pts:barW.credit,  max:30, color:"#FF6BFF", desc:`Score ${APP.creditScore} → ${BREAKDOWN.creditPts}/30 pts` },
                { label:"Income Contribution",         pts:barW.income,  max:25, color:"#00D4FF", desc:`₹${(APP.annualIncome/100000).toFixed(1)}L/yr → ${BREAKDOWN.incomePts}/25 pts` },
                { label:"DTI Ratio Impact",            pts:barW.dti,     max:20, color:"#FFB800", desc:`DTI ${APP.dti}% → ${BREAKDOWN.dtiPts}/20 pts` },
                { label:"Employment Stability",        pts:barW.emp,     max:15, color:"#00FFB3", desc:`${APP.workExp} yrs tenure → ${BREAKDOWN.empPts}/15 pts` },
                { label:"Debt Impact",                 pts:barW.debt,    max:10, color:"#A855F7", desc:`₹${(APP.totalLiabilities/100000).toFixed(1)}L liabilities → ${BREAKDOWN.debtPts}/10 pts` },
              ].map(b => (
                <div key={b.label} style={{ marginBottom:18 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:800, marginBottom:3 }}>{b.label}</div>
                      <div style={{ fontSize:11, color:"rgba(240,238,255,.38)", fontWeight:600 }}>{b.desc}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0, marginLeft:12 }}>
                      <span style={{ fontSize:20, fontWeight:900, color:b.color }}>+{b.pts}</span>
                      <span className="mono" style={{ fontSize:11, color:"rgba(240,238,255,.3)" }}>/{b.max}</span>
                    </div>
                  </div>
                  <div style={{ height:7, background:"rgba(255,255,255,.05)", borderRadius:4, overflow:"hidden" }}>
                    <div className="bar-fill" style={{ height:"100%", width:`${(b.pts/b.max)*100}%`, background:`linear-gradient(90deg,${b.color}80,${b.color})`, borderRadius:4, boxShadow:`0 0 12px ${b.color}55` }}/>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              {/* Rule Engine */}
              <div className="card fu d4" style={{ padding:"24px" }}>
                <div className="section-label" style={{ color:"#00FFB3" }}>Rule Engine Output</div>
                {RULES.map((r, i) => (
                  <div key={i} className={r.result?"rule-pass":"rule-fail"}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                          <span style={{ fontSize:13, color:r.result?"#00FFB3":"#FF6B5B", fontWeight:700 }}>{r.result?"✓":"✕"}</span>
                          <span style={{ fontSize:13, fontWeight:800 }}>{r.rule}</span>
                        </div>
                        <div style={{ fontSize:11, color:"rgba(240,238,255,.48)", paddingLeft:22 }}>{r.reason}</div>
                      </div>
                      <div style={{ flexShrink:0, marginLeft:12 }}>
                        <span style={{ fontSize:10, fontWeight:800, background:r.result?"rgba(0,255,179,.1)":"rgba(255,107,91,.1)", color:r.result?"#00FFB3":"#FF6B5B", border:`1px solid ${r.result?"rgba(0,255,179,.25)":"rgba(255,107,91,.25)"}`, padding:"3px 10px", borderRadius:100, whiteSpace:"nowrap" }}>{r.impact}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top ML Factors */}
              <div className="card fu d5" style={{ padding:"24px" }}>
                <div className="section-label" style={{ color:"#A855F7" }}>ML Model — Top Influencing Factors</div>
                <div style={{ marginBottom:14, padding:"10px 14px", background:"rgba(168,85,247,.07)", border:"1px solid rgba(168,85,247,.2)", borderRadius:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:10, color:"rgba(240,238,255,.38)", fontWeight:700, marginBottom:3 }}>MODEL PREDICTION</div>
                      <div style={{ fontSize:16, fontWeight:900, color:decColor }}>{APP.decision==="Approved"?"✅":"❌"} {APP.decision}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:10, color:"rgba(240,238,255,.38)", fontWeight:700, marginBottom:3 }}>CONFIDENCE</div>
                      <div style={{ fontSize:24, fontWeight:900, color:"#A855F7" }}>{APP.confidence}%</div>
                    </div>
                  </div>
                </div>
                {FACTORS.map((f, i) => (
                  <div key={f.label} style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700 }}>{f.label}</div>
                        <div style={{ fontSize:10, color:f.color, fontWeight:700 }}>{f.impact}</div>
                      </div>
                      <span className="mono" style={{ fontSize:13, color:f.color, fontWeight:700 }}>{factorW[i]}%</span>
                    </div>
                    <div style={{ height:5, background:"rgba(255,255,255,.05)", borderRadius:3 }}>
                      <div className="bar-fill" style={{ height:"100%", width:`${factorW[i]}%`, background:`linear-gradient(90deg,${f.color}70,${f.color})`, borderRadius:3, boxShadow:`0 0 10px ${f.color}50` }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: TIMELINE
        ══════════════════════════════════════════════ */}
        {tab === "timeline" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:18 }}>

            {/* Timeline */}
            <div className="card fu d3" style={{ padding:"28px" }}>
              <div className="section-label" style={{ color:"#00FFB3" }}>Application Timeline</div>
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute", left:5, top:12, bottom:12, width:2, background:"linear-gradient(180deg,#00FFB3,rgba(255,255,255,.06))", borderRadius:1 }}/>
                {TIMELINE.map((item, i) => (
                  <div key={i} style={{ display:"flex", gap:22, marginBottom:i<TIMELINE.length-1?24:0, position:"relative" }}>
                    <div className={item.status==="done"?"tl-dot-done":"tl-dot-pend"} style={{ marginTop:4 }}/>
                    <div style={{ flex:1, padding:"16px 20px", background: item.status==="done"?"rgba(0,255,179,.04)":"rgba(255,255,255,.02)", border:`1px solid ${item.status==="done"?"rgba(0,255,179,.15)":"rgba(255,255,255,.06)"}`, borderRadius:14 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:14, fontWeight:900, color: item.status==="done"?"#F0EEFF":"rgba(240,238,255,.4)" }}>{item.label}</span>
                          <span style={{ fontSize:11, fontWeight:800, color:item.status==="done"?"#00FFB3":"#FFB800", background:item.status==="done"?"rgba(0,255,179,.1)":"rgba(255,184,0,.1)", border:`1px solid ${item.status==="done"?"rgba(0,255,179,.25)":"rgba(255,184,0,.25)"}`, padding:"2px 10px", borderRadius:100 }}>
                            {item.status==="done"?"Completed":"Pending"}
                          </span>
                        </div>
                        <span className="mono" style={{ fontSize:10, color:"rgba(240,238,255,.3)" }}>{item.time}</span>
                      </div>
                      <div style={{ fontSize:12, color:"rgba(240,238,255,.5)", fontWeight:600 }}>{item.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Processing Summary */}
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <div className="card fu d4" style={{ padding:"24px" }}>
                <div className="section-label" style={{ color:"#FF6BFF" }}>Processing Summary</div>
                {[
                  ["Application ID",  APP.id,              "rgba(240,238,255,.85)"],
                  ["Applied On",      APP.appliedAt,       "rgba(240,238,255,.85)"],
                  ["Processed On",    APP.processedAt,     "rgba(240,238,255,.85)"],
                  ["Processing Time", APP.processingTime,  "#00FFB3"],
                  ["Decision",        APP.decision,        decColor],
                  ["Risk Level",      APP.risk,            riskColor],
                  ["Risk Score",      `${APP.score}/100`,  decColor],
                  ["ML Confidence",   `${APP.confidence}%`,"#A855F7"],
                ].map(([k,v,c]) => (
                  <div key={k} className="row">
                    <span style={{ fontSize:12, color:"rgba(240,238,255,.42)", fontWeight:600 }}>{k}</span>
                    <span style={{ fontSize:12, fontWeight:800, color:c as string }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Next Steps */}
              <div className="card fu d5" style={{ padding:"24px" }}>
                <div className="section-label" style={{ color:"#00D4FF" }}>Next Steps</div>
                {(APP.decision==="Approved"
                  ? [
                      { icon:"📄", text:"Loan agreement sent to applicant's email" },
                      { icon:"✍️", text:"Awaiting e-signature on agreement" },
                      { icon:"💳", text:"Disbursement expected by 25 Mar 2024" },
                      { icon:"📱", text:"SMS & email confirmation dispatched" },
                    ]
                  : [
                      { icon:"📄", text:"Rejection letter sent to applicant" },
                      { icon:"📞", text:"Applicant may appeal within 30 days" },
                      { icon:"🔄", text:"Reapplication allowed after 90 days" },
                    ]
                ).map((s, i) => (
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"10px 12px", background:"rgba(0,212,255,.04)", border:"1px solid rgba(0,212,255,.1)", borderRadius:10, marginBottom:8 }}>
                    <span style={{ fontSize:14, flexShrink:0 }}>{s.icon}</span>
                    <span style={{ fontSize:12, color:"rgba(240,238,255,.62)", lineHeight:1.65, fontWeight:600 }}>{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}