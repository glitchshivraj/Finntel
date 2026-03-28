"use client";
import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Decision = "Approved" | "Rejected" | "Pending" | "Review";
type Risk = "Low" | "Medium" | "High";
type RuleAction = "Reject" | "High Risk" | "Low Risk" | "Medium Risk" | "Approve" | "Flag";

interface Application {
  id: string; name: string; avatar: string;
  amount: number; score: number; risk: Risk;
  status: Decision; date: string; dti: number;
  income: number; creditScore: number;
}
interface Rule {
  id: number; condition: string; action: RuleAction;
  enabled: boolean; impact: number; category: string;
}
interface AuditLog {
  id: number; action: string; user: string; time: string; type: "rule" | "override" | "system" | "review";
}
interface Override {
  appId: string; name: string; systemDec: Decision; adminDec: Decision;
  reason: string; admin: string; date: string;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
const APPS: Application[] = [
  { id: "#FNT-4821", name: "Arjun Mehta", avatar: "AM", amount: 1200000, score: 91, risk: "Low", status: "Approved", date: "23 Mar", dti: 5, income: 1840000, creditScore: 784 },
  { id: "#FNT-4820", name: "Priya Sharma", avatar: "PS", amount: 850000, score: 58, risk: "Medium", status: "Review", date: "23 Mar", dti: 38, income: 720000, creditScore: 632 },
  { id: "#FNT-4819", name: "Rohan Das", avatar: "RD", amount: 2500000, score: 29, risk: "High", status: "Rejected", date: "22 Mar", dti: 72, income: 380000, creditScore: 520 },
  { id: "#FNT-4818", name: "Kavya Nair", avatar: "KN", amount: 575000, score: 84, risk: "Low", status: "Approved", date: "22 Mar", dti: 12, income: 1100000, creditScore: 768 },
  { id: "#FNT-4817", name: "Vikram Singh", avatar: "VS", amount: 1800000, score: 47, risk: "Medium", status: "Pending", date: "22 Mar", dti: 41, income: 950000, creditScore: 648 },
  { id: "#FNT-4816", name: "Sneha Pillai", avatar: "SP", amount: 320000, score: 76, risk: "Low", status: "Approved", date: "21 Mar", dti: 18, income: 620000, creditScore: 710 },
  { id: "#FNT-4815", name: "Aditya Kumar", avatar: "AK", amount: 4000000, score: 18, risk: "High", status: "Rejected", date: "21 Mar", dti: 81, income: 280000, creditScore: 490 },
  { id: "#FNT-4814", name: "Meera Iyer", avatar: "MI", amount: 3000000, score: 88, risk: "Low", status: "Approved", date: "21 Mar", dti: 14, income: 2200000, creditScore: 810 },
  { id: "#FNT-4813", name: "Suresh Rao", avatar: "SR", amount: 600000, score: 62, risk: "Medium", status: "Pending", date: "20 Mar", dti: 33, income: 450000, creditScore: 670 },
  { id: "#FNT-4812", name: "Divya Thomas", avatar: "DT", amount: 1500000, score: 79, risk: "Low", status: "Approved", date: "20 Mar", dti: 22, income: 1500000, creditScore: 745 },
];

const RULES_INIT: Rule[] = [
  { id: 1, condition: "Credit Score < 600", action: "Reject", enabled: true, impact: 142, category: "Credit" },
  { id: 2, condition: "DTI > 50%", action: "High Risk", enabled: true, impact: 98, category: "Debt" },
  { id: 3, condition: "Income > ₹15,00,000/yr", action: "Low Risk", enabled: true, impact: 312, category: "Income" },
  { id: 4, condition: "Loan > 5× Annual Income", action: "Reject", enabled: true, impact: 76, category: "Loan Ratio" },
  { id: 5, condition: "Credit Score ≥ 750", action: "Low Risk", enabled: true, impact: 287, category: "Credit" },
  { id: 6, condition: "DTI > 35%", action: "Medium Risk", enabled: true, impact: 134, category: "Debt" },
  { id: 7, condition: "Late Payments > 2", action: "High Risk", enabled: false, impact: 54, category: "History" },
  { id: 8, condition: "Credit Util > 50%", action: "Flag", enabled: true, impact: 61, category: "Credit" },
  { id: 9, condition: "Income < ₹2,00,000/yr", action: "Reject", enabled: true, impact: 38, category: "Income" },
  { id: 10, condition: "Employment < 1 year", action: "Medium Risk", enabled: false, impact: 29, category: "Employment" },
];

const AUDIT_LOGS: AuditLog[] = [
  { id: 1, action: "Rule updated: DTI threshold changed from 50% to 45%", user: "Admin · Aryan J", time: "Today, 11:24 AM", type: "rule" },
  { id: 2, action: "Application #FNT-4817 manually approved by admin", user: "Admin · Aryan J", time: "Today, 10:58 AM", type: "override" },
  { id: 3, action: "New rule added: Employment < 1 year → Medium Risk", user: "Admin · Aryan J", time: "Today, 09:30 AM", type: "rule" },
  { id: 4, action: "Application #FNT-4819 marked for review", user: "Analyst · Priya M", time: "Yesterday, 4:15 PM", type: "review" },
  { id: 5, action: "System threshold updated: Min credit score changed to 600", user: "Admin · Aryan J", time: "Yesterday, 2:00 PM", type: "system" },
  { id: 6, action: "Rule disabled: Late Payments > 2 → High Risk", user: "Analyst · Priya M", time: "Yesterday, 11:10 AM", type: "rule" },
  { id: 7, action: "Application #FNT-4815 rejected manually — fraud suspicion", user: "Admin · Aryan J", time: "22 Mar, 3:42 PM", type: "override" },
  { id: 8, action: "User role updated: Priya M promoted to Analyst", user: "Admin · Aryan J", time: "22 Mar, 10:00 AM", type: "system" },
];

const OVERRIDES: Override[] = [
  { appId: "#FNT-4817", name: "Vikram Singh", systemDec: "Rejected", adminDec: "Approved", reason: "Additional income documents submitted and verified offline", admin: "Aryan J", date: "Today, 10:58 AM" },
  { appId: "#FNT-4820", name: "Priya Sharma", systemDec: "Review", adminDec: "Review", reason: "Waiting for employer verification letter", admin: "Priya M", date: "Yesterday" },
  { appId: "#FNT-4815", name: "Aditya Kumar", systemDec: "Rejected", adminDec: "Rejected", reason: "Confirmed fraud pattern — flagged for investigation", admin: "Aryan J", date: "22 Mar" },
];

const MONTHLY = [
  { month: "Oct", approved: 34, rejected: 12, pending: 6 },
  { month: "Nov", approved: 41, rejected: 15, pending: 8 },
  { month: "Dec", approved: 28, rejected: 18, pending: 11 },
  { month: "Jan", approved: 52, rejected: 10, pending: 7 },
  { month: "Feb", approved: 47, rejected: 13, pending: 9 },
  { month: "Mar", approved: 38, rejected: 9, pending: 5 },
];

const DC: Record<string, string> = { Approved: "#00FFB3", Rejected: "#FF6B5B", Pending: "#FFB800", Review: "#00D4FF" };
const RC: Record<string, string> = { Low: "#00FFB3", Medium: "#FFB800", High: "#FF6B5B" };
const AC: Record<string, string> = { Reject: "#FF6B5B", "High Risk": "#FF6B5B", "Low Risk": "#00FFB3", "Medium Risk": "#FFB800", Approve: "#00FFB3", Flag: "#FFB800" };

const NAVS = [
  { id: "dashboard", icon: "⬡", label: "Dashboard" },
  { id: "applications", icon: "📋", label: "Applications" },
  { id: "rules", icon: "⚙️", label: "Rule Engine" },
  { id: "monitoring", icon: "🚨", label: "Risk Monitor" },
  { id: "analytics", icon: "📊", label: "Analytics" },
  { id: "audit", icon: "📜", label: "Audit Logs" },
  { id: "overrides", icon: "🔓", label: "Overrides" },
  { id: "settings", icon: "🛠️", label: "Settings" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ s }: { s: Decision }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${DC[s]}12`, border: `1px solid ${DC[s]}30`, borderRadius: 100, padding: "3px 10px" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: DC[s], display: "inline-block" }} />
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: DC[s], fontWeight: 700, letterSpacing: ".08em" }}>{s.toUpperCase()}</span>
    </span>
  );
}
function RiskBadge({ r }: { r: Risk }) {
  return (
    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: RC[r], fontWeight: 700 }}>{r}</span>
  );
}
function AnimBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), delay); return () => clearTimeout(t); }, [pct, delay]);
  return <div style={{ height: "100%", width: `${w}%`, background: `linear-gradient(90deg,${color}80,${color})`, borderRadius: "inherit", boxShadow: `0 0 10px ${color}50`, transition: "width 1.2s cubic-bezier(.16,1,.3,1)" }} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [nav, setNav] = useState("dashboard");
  const [mouse, setMouse] = useState({ x: -100, y: -100 });
  const [sidebar, setSidebar] = useState(true);
  const [rules, setRules] = useState<Rule[]>(RULES_INIT);
  const [apps, setApps] = useState<Application[]>(APPS);
  const [filterRisk, setFR] = useState("All");
  const [filterStatus, setFS] = useState("All");
  const [search, setSearch] = useState("");
  const [editRule, setEditRule] = useState<Rule | null>(null);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({ condition: "", action: "Reject" as RuleAction, category: "Credit" });
  const [overrideApp, setOA] = useState<Application | null>(null);
  const [overrideReason, setOR] = useState("");
  const [overrideDec, setOD] = useState<Decision>("Approved");
  const [overrides, setOverrides] = useState<Override[]>(OVERRIDES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(AUDIT_LOGS);
  const [time, setTime] = useState(new Date());
  const [thresholds, setThresholds] = useState({ minCredit: 600, maxDTI: 50, maxLTI: 5, minIncome: 200000 });
  const [barH, setBarH] = useState(MONTHLY.map(() => 0));
  const [showHighRiskPanel, setShowHighRiskPanel] = useState(false);
  const [viewApp, setViewApp] = useState<Application | null>(null);

  useEffect(() => { window.addEventListener("mousemove", e => setMouse({ x: e.clientX, y: e.clientY })); }, []);
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setTimeout(() => setBarH(MONTHLY.map(m => m.approved + m.rejected + m.pending)), 400); return () => clearTimeout(t); }, []);

  // Computed
  const total = apps.length;
  const approved = apps.filter(a => a.status === "Approved").length;
  const rejected = apps.filter(a => a.status === "Rejected").length;
  const pending = apps.filter(a => a.status === "Pending" || a.status === "Review").length;
  const avgScore = Math.round(apps.reduce((s, a) => s + a.score, 0) / apps.length);
  const highRisk = apps.filter(a => a.risk === "High").length;
  const approvalRate = Math.round((approved / total) * 100);
  const maxBar = Math.max(...MONTHLY.map(m => m.approved + m.rejected + m.pending));

  const filtered = apps.filter(a => {
    const mS = filterStatus === "All" || a.status === filterStatus;
    const mR = filterRisk === "All" || a.risk === filterRisk;
    const mQ = search === "" || a.name.toLowerCase().includes(search.toLowerCase()) || a.id.includes(search);
    return mS && mR && mQ;
  });

  function addLog(action: string, type: AuditLog["type"]) {
    setAuditLogs(prev => [{ id: Date.now(), action, user: "Admin · Aryan J", time: "Just now", type }, ...prev]);
  }
  function manualDecision(app: Application, dec: Decision) {
    setApps(prev => prev.map(a => a.id === app.id ? { ...a, status: dec } : a));
    addLog(`Application ${app.id} manually set to ${dec}`, "override");
  }
  function toggleRule(id: number) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    const r = rules.find(x => x.id === id);
    if (r) addLog(`Rule "${r.condition}" ${r.enabled ? "disabled" : "enabled"}`, "rule");
  }
  function saveRule(r: Rule) {
    setRules(prev => prev.map(x => x.id === r.id ? r : x));
    addLog(`Rule updated: "${r.condition}" → ${r.action}`, "rule");
    setEditRule(null);
  }
  function addRule() {
    if (!newRule.condition) return;
    const r: Rule = { id: Date.now(), condition: newRule.condition, action: newRule.action, enabled: true, impact: 0, category: newRule.category };
    setRules(prev => [...prev, r]);
    addLog(`New rule added: "${newRule.condition}" → ${newRule.action}`, "rule");
    setNewRule({ condition: "", action: "Reject", category: "Credit" });
    setShowAddRule(false);
  }
  function submitOverride() {
    if (!overrideApp || !overrideReason) return;
    setOverrides(prev => [{ appId: overrideApp.id, name: overrideApp.name, systemDec: overrideApp.status, adminDec: overrideDec, reason: overrideReason, admin: "Aryan J", date: "Just now" }, ...prev]);
    manualDecision(overrideApp, overrideDec);
    addLog(`Override: ${overrideApp.id} → ${overrideDec}. Reason: ${overrideReason}`, "override");
    setOA(null); setOR(""); setOD("Approved");
  }

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: "#050508", color: "#F0EEFF", minHeight: "100vh", display: "flex", cursor: "none", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:linear-gradient(#FF6BFF,#00D4FF);border-radius:2px;}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scan{0%{transform:translateX(-100%)}100%{transform:translateX(500%)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.1}}
        @keyframes orbF{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-25px)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .gt{background:linear-gradient(135deg,#FF6BFF 0%,#A855F7 30%,#00D4FF 65%,#00FFB3 100%);background-size:250% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 5s linear infinite}
        .mono{font-family:'Space Mono',monospace}
        .fu{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) both}
        .d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}.d4{animation-delay:.2s}.d5{animation-delay:.25s}.d6{animation-delay:.3s}
        .card{background:rgba(12,10,20,.8);border:1px solid rgba(255,255,255,.07);border-radius:16px;position:relative;overflow:hidden;backdrop-filter:blur(18px)}
        .nav-item{display:flex;align-items:center;gap:11px;padding:10px 14px;border-radius:10px;font-weight:700;font-size:13px;cursor:none;transition:all .25s;border:1px solid transparent;color:rgba(240,238,255,.38);width:100%;background:transparent;text-align:left}
        .nav-item:hover{background:rgba(255,107,255,.06);color:rgba(240,238,255,.75);border-color:rgba(255,107,255,.1)}
        .nav-item.on{background:linear-gradient(135deg,rgba(255,107,255,.15),rgba(168,85,247,.1),rgba(0,212,255,.08));border-color:rgba(255,107,255,.25);color:#F0EEFF;box-shadow:0 0 18px rgba(255,107,255,.1)}
        .row{display:flex;justify-content:space-between;align-items:center;padding:9px 13px;border-radius:9px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.045);margin-bottom:6px;transition:all .2s}
        .row:hover{background:rgba(255,107,255,.04);border-color:rgba(255,107,255,.1)}
        .btn{display:inline-flex;align-items:center;gap:6px;border-radius:8px;padding:7px 14px;font-family:'Outfit',sans-serif;font-weight:700;font-size:12px;cursor:none;transition:all .25s;border:none}
        .btn-ghost{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08) !important;color:rgba(240,238,255,.6)}
        .btn-ghost:hover{border-color:rgba(255,107,255,.3) !important;color:#F0EEFF;background:rgba(255,107,255,.06)}
        .btn-primary{background:linear-gradient(135deg,#FF6BFF,#A855F7,#00D4FF);background-size:200% 200%;animation:gradShift 4s ease infinite;color:#fff}
        .btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(255,107,255,.35)}
        .btn-danger{background:rgba(255,107,91,.1);border:1px solid rgba(255,107,91,.25) !important;color:#FF6B5B}
        .btn-danger:hover{background:rgba(255,107,91,.18)}
        .btn-success{background:rgba(0,255,179,.08);border:1px solid rgba(0,255,179,.25) !important;color:#00FFB3}
        .btn-success:hover{background:rgba(0,255,179,.14)}
        .btn-warn{background:rgba(255,184,0,.08);border:1px solid rgba(255,184,0,.25) !important;color:#FFB800}
        .btn-warn:hover{background:rgba(255,184,0,.14)}
        .input{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:9px;padding:10px 14px;color:#F0EEFF;font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;outline:none;transition:all .3s;cursor:none;width:100%}
        .input::placeholder{color:rgba(240,238,255,.25)}
        .input:focus{border-color:rgba(255,107,255,.45);background:rgba(255,107,255,.04);box-shadow:0 0 0 3px rgba(255,107,255,.08)}
        .select{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:9px;padding:9px 14px;color:#F0EEFF;font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;outline:none;cursor:none;transition:all .3s}
        .select:focus{border-color:rgba(255,107,255,.45)}
        .chip{display:inline-flex;align-items:center;gap:5px;border-radius:100px;padding:4px 11px;font-family:'Space Mono',monospace;font-size:9px;font-weight:700;letter-spacing:.08em;cursor:none}
        .toggle{width:36px;height:20px;border-radius:10px;position:relative;cursor:none;transition:background .3s;flex-shrink:0;border:none}
        .toggle::after{content:'';position:absolute;width:14px;height:14px;border-radius:50%;background:#fff;top:3px;transition:left .3s}
        .toggle.on{background:linear-gradient(135deg,#FF6BFF,#00D4FF)}
        .toggle.off{background:rgba(255,255,255,.12)}
        .toggle.on::after{left:19px}
        .toggle.off::after{left:3px}
        .th{font-family:'Space Mono',monospace;font-size:9px;color:rgba(240,238,255,.28);letter-spacing:.1em;text-transform:uppercase;padding:9px 14px}
        .td{padding:12px 14px;font-size:13px}
        .tr{transition:background .2s;cursor:none}
        .tr:hover{background:rgba(255,107,255,.04)}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);z-index:200;display:flex;align-items:center;justify-content:center}
        .modal{background:#0D0B18;border:1px solid rgba(255,107,255,.2);border-radius:18px;padding:28px;width:500px;max-width:95vw;position:relative;box-shadow:0 40px 80px rgba(255,107,255,.12)}
        .section-lbl{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:rgba(240,238,255,.35);margin-bottom:16px;display:flex;align-items:center;gap:7px}
        .section-lbl::before{content:'';display:inline-block;width:12px;height:2px;border-radius:1px;background:currentColor;opacity:.7}
        .tab-pill{padding:7px 16px;border-radius:100px;font-family:'Outfit',sans-serif;font-weight:700;font-size:12px;cursor:none;transition:all .25s;border:1px solid transparent;color:rgba(240,238,255,.38);background:transparent}
        .tab-pill.on{background:linear-gradient(135deg,rgba(255,107,255,.18),rgba(0,212,255,.12));border-color:rgba(255,107,255,.28);color:#F0EEFF}
        .tab-pill:not(.on):hover{color:rgba(240,238,255,.65);border-color:rgba(255,255,255,.07)}
      `}</style>

      {/* Cursor */}
      <div style={{ position: "fixed", zIndex: 9999, pointerEvents: "none", left: mouse.x - 8, top: mouse.y - 8, width: 16, height: 16, borderRadius: "50%", background: "radial-gradient(circle,#FF6BFF,#00D4FF)", boxShadow: "0 0 20px 6px rgba(255,107,255,.55)", mixBlendMode: "screen" }} />
      <div style={{ position: "fixed", zIndex: 9998, pointerEvents: "none", left: mouse.x - 28, top: mouse.y - 28, width: 56, height: 56, borderRadius: "50%", border: "1px solid rgba(255,107,255,.2)", transition: "left .14s ease,top .14s ease" }} />

      {/* BG */}
      <div style={{ position: "fixed", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,255,.07),transparent 70%)", top: "-8%", right: "10%", animation: "orbF 14s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,212,255,.05),transparent 70%)", bottom: "5%", left: "22%", animation: "orbF 11s ease-in-out infinite reverse", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,107,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,255,.025) 1px,transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none", zIndex: 0 }} />

      {/* ── SIDEBAR ── */}
      <aside style={{ width: sidebar ? 228 : 66, flexShrink: 0, background: "rgba(8,7,14,.97)", borderRight: "1px solid rgba(255,255,255,.05)", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50, transition: "width .3s cubic-bezier(.16,1,.3,1)", overflow: "hidden" }}>
        {/* Logo */}
        <div style={{ padding: "18px 14px 14px", borderBottom: "1px solid rgba(255,255,255,.05)", display: "flex", alignItems: "center", gap: 10, minHeight: 60 }}>
          <div style={{ position: "relative", width: 32, height: 32, flexShrink: 0 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 8, background: "linear-gradient(135deg,#FF6BFF,#00D4FF)", padding: 1.5 }}>
              <div style={{ width: "100%", height: "100%", background: "#080810", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 1.5L15.5 5V9C15.5 13 12.5 16.5 9 17.5C5.5 16.5 2.5 13 2.5 9V5L9 1.5Z" fill="url(#sg)" /><defs><linearGradient id="sg" x1="2.5" y1="1.5" x2="15.5" y2="17.5" gradientUnits="userSpaceOnUse"><stop stopColor="#FF6BFF" /><stop offset="1" stopColor="#00D4FF" /></linearGradient></defs></svg>
              </div>
            </div>
          </div>
          {sidebar && <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>Finn<span className="gt">tel</span> <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(240,238,255,.35)", letterSpacing: ".08em" }}>ADMIN</span></span>}
        </div>
        {/* Nav */}
        <nav style={{ padding: "10px 8px", flex: 1, display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
          {NAVS.map(n => (
            <button key={n.id} className={`nav-item ${nav === n.id ? "on" : ""}`} onClick={() => setNav(n.id)} style={{ justifyContent: sidebar ? "flex-start" : "center" }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>{n.icon}</span>
              {sidebar && <span style={{ whiteSpace: "nowrap" }}>{n.label}</span>}
              {n.id === "monitoring" && highRisk > 0 && sidebar && <span style={{ marginLeft: "auto", background: "#FF6B5B", borderRadius: 100, padding: "1px 7px", fontSize: 9, fontWeight: 800, color: "#fff" }}>{highRisk}</span>}
            </button>
          ))}
        </nav>
        {/* User */}
        <div style={{ padding: "10px 8px 18px", borderTop: "1px solid rgba(255,255,255,.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 10, background: "rgba(255,107,255,.05)", border: "1px solid rgba(255,107,255,.1)" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#FF6BFF,#A855F7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>AJ</div>
            {sidebar && <div><div style={{ fontSize: 12, fontWeight: 800 }}>Aryan Joshi</div><div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.32)" }}>Super Admin</div></div>}
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, marginLeft: sidebar ? 228 : 66, transition: "margin-left .3s cubic-bezier(.16,1,.3,1)", display: "flex", flexDirection: "column", minHeight: "100vh", position: "relative", zIndex: 1 }}>

        {/* TOP BAR */}
        <header style={{ height: 60, borderBottom: "1px solid rgba(255,255,255,.05)", background: "rgba(5,5,8,.88)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", position: "sticky", top: 0, zIndex: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn btn-ghost" style={{ padding: "7px 9px" }} onClick={() => setSidebar(o => !o)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.01em" }}>{NAVS.find(n => n.id === nav)?.icon} {NAVS.find(n => n.id === nav)?.label}</div>
              <div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.3)" }}>{time.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })} · {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
            {highRisk > 0 && <div className="chip" style={{ background: "rgba(255,107,91,.1)", border: "1px solid rgba(255,107,91,.25)", color: "#FF6B5B", cursor: "pointer" }} onClick={() => setShowHighRiskPanel(true)}>🚨 {highRisk} HIGH RISK</div>}
            <div className="chip" style={{ background: "rgba(0,255,179,.07)", border: "1px solid rgba(0,255,179,.2)", color: "#00FFB3" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00FFB3", animation: "blink 1.4s infinite" }} />
              LIVE
            </div>
            <button className="btn btn-ghost" style={{ padding: "8px 14px" }} onClick={() => setNav("rules")}>⚙️ Manage Rules</button>
            <button className="btn btn-primary" style={{ padding: "8px 16px" }} onClick={() => { setNav("rules"); setShowAddRule(true); }}>+ New Rule</button>
          </div>
        </header>

        <main style={{ flex: 1, padding: "26px 28px", overflowY: "auto" }}>

          {/* ══ DASHBOARD ══ */}
          {nav === "dashboard" && (
            <div>
              {/* KPI row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Total Apps", value: total, color: "#FF6BFF", icon: "📋" },
                  { label: "Approved", value: approved, color: "#00FFB3", icon: "✅" },
                  { label: "Rejected", value: rejected, color: "#FF6B5B", icon: "❌" },
                  { label: "Pending", value: pending, color: "#FFB800", icon: "⏳" },
                  { label: "Avg Score", value: avgScore, color: "#00D4FF", icon: "📊" },
                  { label: "High Risk", value: highRisk, color: "#FF6B5B", icon: "🚨" },
                ].map((c, i) => (
                  <div key={c.label} className={`card fu d${i + 1}`}
                    style={{ padding: "18px 20px", cursor: c.label === "High Risk" ? "pointer" : "default", transition: "transform .2s, box-shadow .2s" }}
                    onClick={c.label === "High Risk" ? () => setShowHighRiskPanel(true) : undefined}
                    onMouseEnter={c.label === "High Risk" ? e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(255,107,91,.18)"; } : undefined}
                    onMouseLeave={c.label === "High Risk" ? e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; } : undefined}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${c.color}60,transparent)`, animation: "scan 3s ease-in-out infinite", animationDelay: `${i * .4}s`, pointerEvents: "none" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(240,238,255,.38)", letterSpacing: ".05em", textTransform: "uppercase" }}>{c.label}</span>
                      <span style={{ fontSize: 15 }}>{c.icon}</span>
                    </div>
                    <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.04em", color: c.color, lineHeight: 1 }}>{c.value}</div>
                    {c.label === "Total Apps" && <div style={{ fontSize: 11, color: "rgba(240,238,255,.35)", marginTop: 5 }}>Approval: {approvalRate}%</div>}
                    {c.label === "High Risk" && <div style={{ fontSize: 10, color: "rgba(255,107,91,.6)", marginTop: 5, fontWeight: 600 }}>Click to drilldown →</div>}
                  </div>
                ))}
              </div>

              {/* Alerts & Warnings */}
              <div className="fu d1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
                {[
                  { icon: "🚨", title: "High-risk approval detected", detail: "2 high-risk applications approved this week — review manual overrides.", level: "red" },
                  { icon: "📉", title: "Rejection spike +15%", detail: "Rejections up 15% this month due to stricter DTI rules applied.", level: "red" },
                  { icon: "⚠️", title: "Rule conflict detected", detail: "Rules #2 & #6 overlap on DTI thresholds — may cause inconsistent flags.", level: "yellow" },
                ].map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "11px 14px", background: a.level === "red" ? "rgba(255,107,91,.05)" : "rgba(255,184,0,.04)", border: `1px solid ${a.level === "red" ? "rgba(255,107,91,.2)" : "rgba(255,184,0,.16)"}`, borderRadius: 11, borderLeft: `3px solid ${a.level === "red" ? "#FF6B5B" : "#FFB800"}` }}>
                    <span style={{ fontSize: 15, flexShrink: 0 }}>{a.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: a.level === "red" ? "#FF6B5B" : "#FFB800", marginBottom: 3 }}>{a.title}</div>
                      <div style={{ fontSize: 10, color: "rgba(240,238,255,.45)", lineHeight: 1.55 }}>{a.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 14, marginBottom: 20 }}>
                {/* Bar chart */}
                <div className="card fu d3" style={{ padding: "22px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 3 }}>Monthly Trend</div>
                      <div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.32)", letterSpacing: ".08em" }}>OCT – MAR</div>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      {[{ c: "#00FFB3", l: "Approved" }, { c: "#FFB800", l: "Pending" }, { c: "#FF6B5B", l: "Rejected" }].map(x => (
                        <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <div style={{ width: 7, height: 7, borderRadius: 2, background: x.c }} />
                          <span style={{ fontSize: 10, color: "rgba(240,238,255,.4)", fontWeight: 700 }}>{x.l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 9, alignItems: "flex-end", height: 120 }}>
                    {MONTHLY.map((m, i) => {
                      const total = m.approved + m.rejected + m.pending;
                      const h = barH[i] ? (total / maxBar) * 110 : 0;
                      return (
                        <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                          <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 110, gap: 1 }}>
                            <div style={{ width: "100%", height: h ? (m.rejected / total) * h + "px" : "0", background: "#FF6B5B", borderRadius: "3px 3px 0 0", transition: "height 1.2s cubic-bezier(.16,1,.3,1)" }} />
                            <div style={{ width: "100%", height: h ? (m.pending / total) * h + "px" : "0", background: "#FFB800", transition: "height 1.2s cubic-bezier(.16,1,.3,1)" }} />
                            <div style={{ width: "100%", height: h ? (m.approved / total) * h + "px" : "0", background: "linear-gradient(180deg,#00FFB3,#00D4FF)", transition: "height 1.2s cubic-bezier(.16,1,.3,1)" }} />
                          </div>
                          <span className="mono" style={{ fontSize: 8, color: "rgba(240,238,255,.32)" }}>{m.month}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 12, padding: "10px 13px", background: "rgba(255,184,0,.04)", border: "1px solid rgba(255,184,0,.13)", borderRadius: 9, borderLeft: "3px solid #FFB800" }}>
                    <span style={{ fontSize: 11, color: "rgba(240,238,255,.5)", lineHeight: 1.6 }}>💡 <strong style={{ color: "#FFB800" }}>Insight:</strong> Rejections rose 15% in Dec from stricter DTI rules. March shows recovery with the lowest rejection count (9) in 6 months.</span>
                  </div>
                </div>

                {/* Donut */}
                <div className="card fu d4" style={{ padding: "22px 20px" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 3 }}>Risk Split</div>
                  <div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.32)", letterSpacing: ".08em", marginBottom: 16 }}>CURRENT PORTFOLIO</div>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                    <div style={{ position: "relative", width: 120, height: 120 }}>
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="14" />
                        <circle cx="60" cy="60" r="46" fill="none" stroke="url(#dg1)" strokeWidth="14" strokeDasharray="289" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 60 60)" />
                        <circle cx="60" cy="60" r="46" fill="none" stroke="#FFB800" strokeWidth="14" strokeDasharray={`${.28 * 289} ${.72 * 289}`} strokeDashoffset={`${-.62 * 289}`} strokeLinecap="round" transform="rotate(-90 60 60)" />
                        <circle cx="60" cy="60" r="46" fill="none" stroke="#FF6B5B" strokeWidth="14" strokeDasharray={`${.1 * 289} ${.9 * 289}`} strokeDashoffset={`${-.9 * 289}`} strokeLinecap="round" transform="rotate(-90 60 60)" />
                        <defs><linearGradient id="dg1" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#00FFB3" /><stop offset="1" stopColor="#00D4FF" /></linearGradient></defs>
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: "#00FFB3" }}>62%</div>
                        <div style={{ fontSize: 8, color: "rgba(240,238,255,.35)", fontWeight: 700 }}>Low Risk</div>
                      </div>
                    </div>
                  </div>
                  {[{ c: "#00FFB3", l: "Low", p: "62%" }, { c: "#FFB800", l: "Medium", p: "28%" }, { c: "#FF6B5B", l: "High", p: "10%" }].map(x => (
                    <div key={x.l} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}><div style={{ width: 7, height: 7, borderRadius: 2, background: x.c }} /><span style={{ fontSize: 12, fontWeight: 700, color: "rgba(240,238,255,.6)" }}>{x.l} Risk</span></div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: x.c }}>{x.p}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 10, padding: "8px 11px", background: "rgba(0,255,179,.04)", border: "1px solid rgba(0,255,179,.1)", borderRadius: 8, borderLeft: "3px solid #00FFB3" }}>
                    <span style={{ fontSize: 10, color: "rgba(240,238,255,.45)" }}>💡 62% Low Risk signals a healthy portfolio — consider relaxing the manual review queue threshold.</span>
                  </div>
                </div>
              </div>

              {/* Recent activity */}
              <div className="card fu d5" style={{ padding: "20px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>Recent Applications</div>
                  <button className="btn btn-ghost" onClick={() => setNav("applications")}>View All →</button>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>
                    {["Applicant", "Amount", "Score", "DTI", "Flag", "Status", "Actions"].map(h => <th key={h} className="th" style={{ textAlign: "left" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {apps.slice(0, 5).map(a => (
                      <tr key={a.id} className="tr">
                        <td className="td">
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,rgba(255,107,255,.3),rgba(168,85,247,.3))", border: "1px solid rgba(255,107,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{a.avatar}</div>
                            <div><div style={{ fontSize: 13, fontWeight: 800 }}>{a.name}</div><div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.3)" }}>{a.id}</div></div>
                          </div>
                        </td>
                        <td className="td" style={{ fontWeight: 700 }}>₹{(a.amount / 100000).toFixed(1)}L</td>
                        <td className="td"><span style={{ fontSize: 14, fontWeight: 900, color: RC[a.risk] }}>{a.score}</span></td>
                        <td className="td"><span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 800, color: a.dti > 50 ? "#FF6B5B" : a.dti > 35 ? "#FFB800" : "#00FFB3" }}>{a.dti}%</span></td>
                        <td className="td"><span style={{ fontSize: 14 }}>{a.risk === "High" ? "⚠️" : a.risk === "Medium" ? "🔶" : "✅"}</span></td>
                        <td className="td"><StatusBadge s={a.status} /></td>
                        <td className="td">
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="btn btn-ghost" style={{ fontSize: 10, padding: "5px 8px" }} onClick={() => setViewApp(a)}>👁 View</button>
                            <button className="btn btn-success" style={{ fontSize: 10, padding: "5px 8px" }} onClick={() => manualDecision(a, "Approved")}>✓</button>
                            <button className="btn btn-danger" style={{ fontSize: 10, padding: "5px 8px" }} onClick={() => manualDecision(a, "Rejected")}>✕</button>
                            <button className="btn btn-warn" style={{ fontSize: 10, padding: "5px 8px" }} onClick={() => manualDecision(a, "Review")}>⚑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quick Actions Panel */}
              <div className="fu" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 4 }}>
                {[
                  { icon: "⏳", label: "Review Pending", sub: `${pending} awaiting action`, color: "#FFB800", action: () => { setNav("applications"); setFS("Pending"); } },
                  { icon: "⚙️", label: "Add New Rule", sub: "Open rule engine form", color: "#FF6BFF", action: () => { setNav("rules"); setShowAddRule(true); } },
                  { icon: "🚨", label: "High-Risk Users", sub: `${highRisk} flagged`, color: "#FF6B5B", action: () => setShowHighRiskPanel(true) },
                ].map((q, i) => (
                  <button key={i} onClick={q.action}
                    style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 18px", background: "rgba(255,255,255,.025)", border: `1px solid ${q.color}22`, borderRadius: 14, cursor: "pointer", transition: "all .22s", textAlign: "left", width: "100%" }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${q.color}10`)}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.025)")}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: `${q.color}16`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{q.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#F0EEFF", marginBottom: 2 }}>{q.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(240,238,255,.4)", fontWeight: 600 }}>{q.sub}</div>
                    </div>
                    <span style={{ color: q.color, fontSize: 16, flexShrink: 0 }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══ APPLICATIONS ══ */}
          {nav === "applications" && (
            <div>
              {/* Filters */}
              <div className="card fu d1" style={{ padding: "16px 20px", marginBottom: 14, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                  <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "rgba(240,238,255,.3)" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <input className="input" placeholder="Search name or ID…" style={{ paddingLeft: 34, padding: "9px 14px 9px 34px" }} value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["All", "Low", "Medium", "High"].map(r => (
                    <button key={r} className={`tab-pill ${filterRisk === r ? "on" : ""}`} onClick={() => setFR(r)}>{r}</button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["All", "Approved", "Rejected", "Pending", "Review"].map(s => (
                    <button key={s} className={`tab-pill ${filterStatus === s ? "on" : ""}`} onClick={() => setFS(s)}>{s}</button>
                  ))}
                </div>
                <button className="btn btn-ghost">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  Export
                </button>
              </div>

              <div className="card fu d2">
                <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid rgba(255,255,255,.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 800 }}>All Applications <span className="mono" style={{ fontSize: 10, color: "rgba(240,238,255,.35)" }}>({filtered.length})</span></span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                    {["Applicant", "Amount", "Score", "Risk", "DTI", "Income", "Flag", "Status", "Date", "Actions"].map(h => <th key={h} className="th" style={{ textAlign: "left" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {filtered.map(a => (
                      <tr key={a.id} className="tr" style={{ borderBottom: "1px solid rgba(255,255,255,.03)" }}>
                        <td className="td">
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,rgba(255,107,255,.3),rgba(168,85,247,.3))", border: "1px solid rgba(255,107,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{a.avatar}</div>
                            <div><div style={{ fontSize: 13, fontWeight: 800 }}>{a.name}</div><div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.3)" }}>{a.id}</div></div>
                          </div>
                        </td>
                        <td className="td" style={{ fontWeight: 700 }}>₹{(a.amount / 100000).toFixed(1)}L</td>
                        <td className="td">
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `conic-gradient(${RC[a.risk]} ${a.score * 3.6}deg,rgba(255,255,255,.05) 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <div style={{ width: 19, height: 19, borderRadius: "50%", background: "#07070E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontSize: 7, fontWeight: 900, color: RC[a.risk] }}>{a.score}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="td"><RiskBadge r={a.risk} /></td>
                        <td className="td"><span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 800, color: a.dti > 50 ? "#FF6B5B" : a.dti > 35 ? "#FFB800" : "#00FFB3" }}>{a.dti}%</span></td>
                        <td className="td" style={{ fontSize: 12, color: "rgba(240,238,255,.5)" }}>₹{(a.income / 100000).toFixed(1)}L/yr</td>
                        <td className="td"><span style={{ fontSize: 14 }}>{a.risk === "High" ? "⚠️" : a.risk === "Medium" ? "🔶" : "✅"}</span></td>
                        <td className="td"><StatusBadge s={a.status} /></td>
                        <td className="td" style={{ color: "rgba(240,238,255,.4)", fontSize: 12 }}>{a.date}</td>
                        <td className="td">
                          <div style={{ display: "flex", gap: 5 }}>
                            <button className="btn btn-ghost" style={{ fontSize: 10, padding: "5px 9px" }} onClick={() => setViewApp(a)}>👁 View</button>
                            <button className="btn btn-success" onClick={() => manualDecision(a, "Approved")}>✓</button>
                            <button className="btn btn-danger" onClick={() => manualDecision(a, "Rejected")}>✕</button>
                            <button className="btn btn-warn" onClick={() => manualDecision(a, "Review")}>⚑</button>
                            <button className="btn btn-ghost" onClick={() => { setOA(a); setOD("Approved"); }}>Override</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ RULE ENGINE ══ */}
          {nav === "rules" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 3 }}>Rule Engine Management</div>
                  <div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.35)", letterSpacing: ".08em" }}>{rules.filter(r => r.enabled).length} ACTIVE RULES · {rules.filter(r => !r.enabled).length} DISABLED</div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddRule(true)}>+ Add Rule</button>
              </div>

              {/* Add Rule Form */}
              {showAddRule && (
                <div className="card fu d1" style={{ padding: "20px 22px", marginBottom: 14, border: "1px solid rgba(255,107,255,.25)", background: "rgba(255,107,255,.04)" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14 }}>Add New Rule</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 160px auto", gap: 12, alignItems: "flex-end" }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(240,238,255,.45)", display: "block", marginBottom: 7, letterSpacing: ".05em", textTransform: "uppercase" }}>Condition</label>
                      <input className="input" placeholder="e.g. Credit Score < 600" value={newRule.condition} onChange={e => setNewRule(p => ({ ...p, condition: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(240,238,255,.45)", display: "block", marginBottom: 7, letterSpacing: ".05em", textTransform: "uppercase" }}>Action</label>
                      <select className="select" style={{ width: "100%" }} value={newRule.action} onChange={e => setNewRule(p => ({ ...p, action: e.target.value as RuleAction }))}>
                        {["Reject", "Approve", "High Risk", "Medium Risk", "Low Risk", "Flag"].map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(240,238,255,.45)", display: "block", marginBottom: 7, letterSpacing: ".05em", textTransform: "uppercase" }}>Category</label>
                      <select className="select" style={{ width: "100%" }} value={newRule.category} onChange={e => setNewRule(p => ({ ...p, category: e.target.value }))}>
                        {["Credit", "Debt", "Income", "Loan Ratio", "History", "Employment"].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-primary" onClick={addRule}>Add</button>
                      <button className="btn btn-ghost" onClick={() => setShowAddRule(false)}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Rules table */}
              <div className="card fu d2">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                    {["Condition", "Category", "Action", "Impact", "Status", "Actions"].map(h => <th key={h} className="th" style={{ textAlign: "left" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {rules.map(r => (
                      <tr key={r.id} className="tr" style={{ borderBottom: "1px solid rgba(255,255,255,.03)", opacity: r.enabled ? 1 : .5 }}>
                        <td className="td">
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: AC[r.action], boxShadow: `0 0 6px ${AC[r.action]}60` }} />
                            <span style={{ fontSize: 13, fontWeight: 700 }}>
                              {editRule?.id === r.id
                                ? <input className="input" style={{ padding: "5px 10px", fontSize: 12 }} value={editRule.condition} onChange={e => setEditRule({ ...editRule, condition: e.target.value })} />
                                : r.condition}
                            </span>
                          </div>
                        </td>
                        <td className="td"><span style={{ fontSize: 10, fontWeight: 800, color: "rgba(240,238,255,.5)", background: "rgba(255,255,255,.05)", padding: "3px 9px", borderRadius: 6 }}>{r.category}</span></td>
                        <td className="td">
                          {editRule?.id === r.id
                            ? <select className="select" style={{ padding: "5px 10px", fontSize: 12 }} value={editRule.action} onChange={e => setEditRule({ ...editRule, action: e.target.value as RuleAction })}>
                              {["Reject", "Approve", "High Risk", "Medium Risk", "Low Risk", "Flag"].map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                            : <span style={{ fontSize: 11, fontWeight: 800, color: AC[r.action], background: `${AC[r.action]}12`, padding: "3px 10px", borderRadius: 6 }}>{r.action}</span>
                          }
                        </td>
                        <td className="td">
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <div style={{ width: 60, height: 4, background: "rgba(255,255,255,.06)", borderRadius: 2, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${Math.min(100, (r.impact / 350) * 100)}%`, background: "#FF6BFF", borderRadius: 2 }} />
                            </div>
                            <span className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.4)" }}>{r.impact}</span>
                          </div>
                        </td>
                        <td className="td">
                          <button className={`toggle ${r.enabled ? "on" : "off"}`} onClick={() => toggleRule(r.id)} />
                        </td>
                        <td className="td">
                          <div style={{ display: "flex", gap: 6 }}>
                            {editRule?.id === r.id
                              ? <><button className="btn btn-success" onClick={() => saveRule(editRule)}>Save</button><button className="btn btn-ghost" onClick={() => setEditRule(null)}>Cancel</button></>
                              : <button className="btn btn-ghost" onClick={() => setEditRule(r)}>Edit</button>
                            }
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ RISK MONITORING ══ */}
          {nav === "monitoring" && (
            <div>
              {/* Warning banner */}
              {highRisk > 0 && (
                <div className="fu d1" style={{ padding: "14px 20px", background: "rgba(255,107,91,.07)", border: "1px solid rgba(255,107,91,.25)", borderRadius: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>🚨</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#FF6B5B" }}>{highRisk} High-Risk Applications Require Attention</div>
                    <div style={{ fontSize: 12, color: "rgba(240,238,255,.45)", marginTop: 2 }}>These applications have triggered multiple risk flags and may require manual review or investigation.</div>
                  </div>
                </div>
              )}

              {/* Pattern alerts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[
                  { icon: "📈", title: "Approval spike detected", detail: "23% more approvals than last week — possible rule misconfiguration", level: "yellow" },
                  { icon: "💸", title: "High-debt cluster", detail: "3 applicants with DTI > 70% submitted in last 48 hours", level: "red" },
                  { icon: "📉", title: "Credit score distribution", detail: "Average credit score dropped to 698 this month (-14 pts)", level: "yellow" },
                ].map((a, i) => (
                  <div key={i} className={`card fu d${i + 1}`} style={{ padding: "16px 18px", border: `1px solid ${a.level === "red" ? "rgba(255,107,91,.25)" : "rgba(255,184,0,.2)"}`, background: `${a.level === "red" ? "rgba(255,107,91," : "rgba(255,184,0,"}0.05)` }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{a.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: a.level === "red" ? "#FF6B5B" : "#FFB800", marginBottom: 5 }}>{a.title}</div>
                        <div style={{ fontSize: 12, color: "rgba(240,238,255,.5)", lineHeight: 1.6 }}>{a.detail}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* High risk apps */}
              <div className="card fu d4" style={{ padding: "20px 22px" }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14 }}>High Risk Applications</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                    {["Applicant", "Amount", "Score", "DTI", "Credit Score", "Status", "Action"].map(h => <th key={h} className="th" style={{ textAlign: "left" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {apps.filter(a => a.risk === "High" || a.score < 50).map(a => (
                      <tr key={a.id} className="tr" style={{ borderBottom: "1px solid rgba(255,107,91,.06)" }}>
                        <td className="td">
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,107,91,.2)", border: "1px solid rgba(255,107,91,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>{a.avatar}</div>
                            <div><div style={{ fontSize: 13, fontWeight: 800 }}>{a.name}</div><div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.3)" }}>{a.id}</div></div>
                          </div>
                        </td>
                        <td className="td" style={{ fontWeight: 700 }}>₹{(a.amount / 100000).toFixed(1)}L</td>
                        <td className="td"><span style={{ fontSize: 14, fontWeight: 900, color: "#FF6B5B" }}>{a.score}</span></td>
                        <td className="td"><span style={{ fontSize: 13, fontWeight: 800, color: a.dti > 50 ? "#FF6B5B" : "#FFB800" }}>{a.dti}%</span></td>
                        <td className="td"><span style={{ fontSize: 13, fontWeight: 800, color: a.creditScore < 600 ? "#FF6B5B" : "#FFB800" }}>{a.creditScore}</span></td>
                        <td className="td"><StatusBadge s={a.status} /></td>
                        <td className="td">
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn-danger" onClick={() => manualDecision(a, "Rejected")}>Reject</button>
                            <button className="btn btn-warn" onClick={() => manualDecision(a, "Review")}>Review</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ ANALYTICS ══ */}
          {nav === "analytics" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {/* Monthly trends */}
              <div className="card fu d1" style={{ padding: "22px 24px", gridColumn: "1/-1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 3 }}>Approval vs Rejection Trends</div>
                    <div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.32)" }}>LAST 6 MONTHS</div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-ghost">Export CSV</button>
                    <button className="btn btn-ghost">Export PDF</button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 9, alignItems: "flex-end", height: 140 }}>
                  {MONTHLY.map((m, i) => {
                    const total = m.approved + m.rejected + m.pending;
                    const h = barH[i] ? (total / maxBar) * 130 : 0;
                    return (
                      <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(240,238,255,.4)" }}>{total}</span>
                        <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 120, gap: 1 }}>
                          <div style={{ width: "100%", height: h ? (m.rejected / total) * h + "px" : "0", background: "#FF6B5B", borderRadius: "3px 3px 0 0", transition: "height 1.2s cubic-bezier(.16,1,.3,1)" }} />
                          <div style={{ width: "100%", height: h ? (m.pending / total) * h + "px" : "0", background: "#FFB800", transition: "height 1.2s cubic-bezier(.16,1,.3,1)" }} />
                          <div style={{ width: "100%", height: h ? (m.approved / total) * h + "px" : "0", background: "linear-gradient(180deg,#00FFB3,#00D4FF)", transition: "height 1.2s cubic-bezier(.16,1,.3,1)" }} />
                        </div>
                        <span className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.32)" }}>{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Income vs Approval */}
              <div className="card fu d2" style={{ padding: "22px 24px" }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 3 }}>Income vs Approval Correlation</div>
                <div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.32)", marginBottom: 18 }}>INCOME BAND ANALYSIS</div>
                {[
                  { band: "< ₹3L", rate: 12, count: 38, color: "#FF6B5B" },
                  { band: "₹3L – ₹6L", rate: 44, count: 187, color: "#FFB800" },
                  { band: "₹6L – ₹12L", rate: 71, count: 412, color: "#00D4FF" },
                  { band: "₹12L – ₹20L", rate: 88, count: 634, color: "#00FFB3" },
                  { band: "> ₹20L", rate: 96, count: 298, color: "#A855F7" },
                ].map((b, i) => (
                  <div key={b.band} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: "rgba(240,238,255,.55)" }}>{b.band}</span>
                        <span style={{ fontSize: 10, color: "rgba(240,238,255,.3)" }}>{b.count} apps</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: b.color }}>{b.rate}%</span>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,.05)", borderRadius: 3 }}>
                      <AnimBar pct={b.rate} color={b.color} delay={300 + i * 100} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Risk distribution */}
              <div className="card fu d3" style={{ padding: "22px 24px" }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 3 }}>Risk Distribution</div>
                <div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.32)", marginBottom: 18 }}>ALL TIME</div>
                {[
                  { label: "Low Risk", count: 3094, pct: 62, color: "#00FFB3" },
                  { label: "Medium Risk", count: 1396, pct: 28, color: "#FFB800" },
                  { label: "High Risk", count: 499, pct: 10, color: "#FF6B5B" },
                ].map((r, i) => (
                  <div key={r.label} style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: r.color, boxShadow: `0 0 8px ${r.color}80` }} />
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{r.label}</span>
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <span style={{ fontSize: 11, color: "rgba(240,238,255,.4)" }}>{r.count.toLocaleString()} apps</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: r.color }}>{r.pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: 7, background: "rgba(255,255,255,.05)", borderRadius: 4 }}>
                      <AnimBar pct={r.pct} color={r.color} delay={400 + i * 120} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ AUDIT LOGS ══ */}
          {nav === "audit" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 3 }}>Audit Logs</div>
                  <div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.35)" }}>ALL ADMIN ACTIONS TRACKED</div>
                </div>
                <button className="btn btn-ghost">Export Logs</button>
              </div>
              <div className="card fu d2" style={{ padding: "20px 22px" }}>
                {auditLogs.map((log, i) => {
                  const iconMap = { rule: "⚙️", override: "🔓", system: "🛠️", review: "📋" };
                  const colorMap = { rule: "#FF6BFF", override: "#FFB800", system: "#00D4FF", review: "#00FFB3" };
                  return (
                    <div key={log.id} className="fu" style={{ animationDelay: `${i * .04}s`, display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${colorMap[log.type]}12`, border: `1px solid ${colorMap[log.type]}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                        {iconMap[log.type]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(240,238,255,.85)", marginBottom: 4 }}>{log.action}</div>
                        <div style={{ display: "flex", gap: 12 }}>
                          <span style={{ fontSize: 11, color: "rgba(240,238,255,.4)", fontWeight: 600 }}>👤 {log.user}</span>
                          <span className="mono" style={{ fontSize: 10, color: "rgba(240,238,255,.28)" }}>{log.time}</span>
                        </div>
                      </div>
                      <span className="chip" style={{ background: `${colorMap[log.type]}10`, border: `1px solid ${colorMap[log.type]}25`, color: colorMap[log.type], textTransform: "uppercase" }}>{log.type}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ OVERRIDES ══ */}
          {nav === "overrides" && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Manual Override System</div>
              <div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.35)", marginBottom: 16 }}>ADMIN DECISIONS THAT DIFFER FROM SYSTEM OUTPUT</div>

              <div className="card fu d1" style={{ padding: "20px 22px", marginBottom: 14 }}>
                {overrides.map((o, i) => {
                  const changed = o.systemDec !== o.adminDec;
                  return (
                    <div key={i} style={{ padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,.04)", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1.5fr 1fr 1fr", alignItems: "center", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800 }}>{o.name}</div>
                        <div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.3)" }}>{o.appId}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: "rgba(240,238,255,.38)", fontWeight: 700, marginBottom: 5 }}>SYSTEM</div>
                        <StatusBadge s={o.systemDec} />
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: "rgba(240,238,255,.38)", fontWeight: 700, marginBottom: 5 }}>ADMIN</div>
                        <StatusBadge s={o.adminDec} />
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: "rgba(240,238,255,.38)", fontWeight: 700, marginBottom: 4 }}>REASON</div>
                        <div style={{ fontSize: 11, color: "rgba(240,238,255,.6)", lineHeight: 1.55 }}>{o.reason}</div>
                      </div>
                      <div className="mono" style={{ fontSize: 10, color: "rgba(240,238,255,.35)" }}>{o.admin}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.3)" }}>{o.date}</span>
                        {changed && <span className="chip" style={{ background: "rgba(255,184,0,.1)", border: "1px solid rgba(255,184,0,.25)", color: "#FFB800" }}>CHANGED</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick override tool */}
              <div className="card fu d3" style={{ padding: "22px 24px", border: "1px solid rgba(255,107,255,.15)" }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 3 }}>Quick Override</div>
                <div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.35)", marginBottom: 18 }}>SELECT AN APPLICATION AND OVERRIDE ITS DECISION</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 1fr auto", gap: 12, alignItems: "flex-end" }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(240,238,255,.45)", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: ".05em" }}>Application</label>
                    <select className="select" style={{ width: "100%" }} value={overrideApp?.id || ""} onChange={e => setOA(apps.find(a => a.id === e.target.value) || null)}>
                      <option value="">Select application…</option>
                      {apps.map(a => <option key={a.id} value={a.id}>{a.name} — {a.id}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(240,238,255,.45)", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: ".05em" }}>New Decision</label>
                    <select className="select" style={{ width: "100%" }} value={overrideDec} onChange={e => setOD(e.target.value as Decision)}>
                      {["Approved", "Rejected", "Review", "Pending"].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(240,238,255,.45)", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: ".05em" }}>Reason</label>
                    <input className="input" placeholder="Reason for override…" value={overrideReason} onChange={e => setOR(e.target.value)} />
                  </div>
                  <button className="btn btn-primary" style={{ padding: "10px 20px" }} onClick={submitOverride} disabled={!overrideApp || !overrideReason}>Apply Override</button>
                </div>
              </div>
            </div>
          )}

          {/* ══ SETTINGS ══ */}
          {nav === "settings" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Thresholds */}
              <div className="card fu d1" style={{ padding: "24px" }}>
                <div className="section-lbl" style={{ color: "#FF6BFF" }}>Risk Thresholds</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { label: "Min Credit Score", key: "minCredit", suffix: "", note: "Below this → Reject" },
                    { label: "Max DTI Ratio", key: "maxDTI", suffix: "%", note: "Above this → High Risk" },
                    { label: "Max Loan-to-Income", key: "maxLTI", suffix: "×", note: "Above this → Reject" },
                    { label: "Min Annual Income", key: "minIncome", suffix: "", note: "Below this → Reject" },
                  ].map(f => (
                    <div key={f.key}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(240,238,255,.55)" }}>{f.label}</label>
                        <span style={{ fontSize: 11, color: "rgba(240,238,255,.35)" }}>{f.note}</span>
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <input className="input" type="number" value={(thresholds as any)[f.key]}
                          onChange={e => setThresholds(p => ({ ...p, [f.key]: Number(e.target.value) }))} />
                        <span style={{ alignSelf: "center", fontSize: 13, fontWeight: 700, color: "#FF6BFF", flexShrink: 0 }}>{f.suffix}</span>
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-primary" style={{ justifyContent: "center", padding: "11px" }}
                    onClick={() => addLog("System thresholds updated by admin", "system")}>
                    Save Thresholds
                  </button>
                </div>
              </div>

              {/* User roles */}
              <div className="card fu d2" style={{ padding: "24px" }}>
                <div className="section-lbl" style={{ color: "#00D4FF" }}>User Management</div>
                {[
                  { name: "Aryan Joshi", role: "Super Admin", email: "aryan@finntel.ai", active: true },
                  { name: "Priya Menon", role: "Analyst", email: "priya@finntel.ai", active: true },
                  { name: "Rahul Desai", role: "Analyst", email: "rahul@finntel.ai", active: false },
                  { name: "Nisha Kapoor", role: "Viewer", email: "nisha@finntel.ai", active: true },
                ].map((u, i) => (
                  <div key={i} className="row" style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,rgba(255,107,255,.3),rgba(0,212,255,.2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>{u.name.split(" ").map(w => w[0]).join("")}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800 }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(240,238,255,.38)" }}>{u.email}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: u.role === "Super Admin" ? "#FF6BFF" : u.role === "Analyst" ? "#00D4FF" : "#A855F7", background: `${u.role === "Super Admin" ? "rgba(255,107,255" : u.role === "Analyst" ? "rgba(0,212,255" : "rgba(168,85,247"},.1)`, padding: "3px 10px", borderRadius: 6 }}>{u.role}</span>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: u.active ? "#00FFB3" : "rgba(255,255,255,.2)", boxShadow: u.active ? "0 0 8px #00FFB380" : "none" }} />
                    </div>
                  </div>
                ))}
                <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>+ Invite User</button>
              </div>

              {/* System config */}
              <div className="card fu d3" style={{ padding: "24px", gridColumn: "1/-1" }}>
                <div className="section-lbl" style={{ color: "#00FFB3" }}>System Configuration</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                  {[
                    { label: "Auto-approve Low Risk", desc: "Automatically approve score ≥ 85", on: true },
                    { label: "Auto-reject High Risk", desc: "Automatically reject score ≤ 25", on: true },
                    { label: "Email notifications", desc: "Send alerts on high-risk apps", on: true },
                    { label: "Fraud detection", desc: "Enable pattern-based flagging", on: true },
                    { label: "Audit trail", desc: "Log all admin actions", on: true },
                    { label: "Manual review queue", desc: "Queue medium-risk for review", on: false },
                  ].map((c, i) => (
                    <div key={i} className="row" style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start", padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: 800 }}>{c.label}</span>
                        <div style={{ width: 36, height: 20, borderRadius: 10, background: c.on ? "linear-gradient(135deg,#FF6BFF,#00D4FF)" : "rgba(255,255,255,.12)", position: "relative", flexShrink: 0, cursor: "none" }}>
                          <div style={{ position: "absolute", width: 14, height: 14, borderRadius: "50%", background: "#fff", top: 3, left: c.on ? 19 : 3, transition: "left .3s" }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: "rgba(240,238,255,.38)" }}>{c.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── VIEW DETAILS MODAL ── */}
      {viewApp && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setViewApp(null) }}>
          <div className="modal" style={{ width: 560 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900 }}>{viewApp.name}</div>
                <div className="mono" style={{ fontSize: 10, color: "rgba(240,238,255,.35)" }}>{viewApp.id} · {viewApp.date}</div>
              </div>
              <StatusBadge s={viewApp.status} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
              {[
                { label: "Risk Score", value: viewApp.score, color: RC[viewApp.risk], suffix: "/100" },
                { label: "Credit Score", value: viewApp.creditScore, color: viewApp.creditScore < 600 ? "#FF6B5B" : "#00FFB3", suffix: "" },
                { label: "Loan Amount", value: `₹${(viewApp.amount / 100000).toFixed(1)}L`, color: "#FF6BFF", suffix: "" },
              ].map(f => (
                <div key={f.label} style={{ padding: "12px 14px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 10 }}>
                  <div style={{ fontSize: 9, color: "rgba(240,238,255,.38)", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".07em" }}>{f.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: f.color }}>{f.value}{f.suffix}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              <div style={{ padding: "12px 14px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 10 }}>
                <div style={{ fontSize: 9, color: "rgba(240,238,255,.38)", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".07em" }}>DTI Ratio</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: viewApp.dti > 50 ? "#FF6B5B" : viewApp.dti > 35 ? "#FFB800" : "#00FFB3" }}>{viewApp.dti}%</div>
                <div style={{ height: 4, background: "rgba(255,255,255,.06)", borderRadius: 2, marginTop: 8 }}><div style={{ height: "100%", width: `${viewApp.dti}%`, background: viewApp.dti > 50 ? "#FF6B5B" : "#FFB800", borderRadius: 2 }} /></div>
              </div>
              <div style={{ padding: "12px 14px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 10 }}>
                <div style={{ fontSize: 9, color: "rgba(240,238,255,.38)", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".07em" }}>Annual Income</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#00D4FF" }}>₹{(viewApp.income / 100000).toFixed(1)}L</div>
              </div>
            </div>
            <div style={{ padding: "10px 14px", background: viewApp.risk === "High" ? "rgba(255,107,91,.06)" : "rgba(255,184,0,.04)", border: `1px solid ${viewApp.risk === "High" ? "rgba(255,107,91,.2)" : "rgba(255,184,0,.15)"}`, borderRadius: 9, borderLeft: `3px solid ${RC[viewApp.risk]}`, marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: RC[viewApp.risk], marginBottom: 4 }}>Risk Assessment: {viewApp.risk}</div>
              <div style={{ fontSize: 11, color: "rgba(240,238,255,.5)" }}>{viewApp.risk === "High" ? `High DTI (${viewApp.dti}%) and low credit score (${viewApp.creditScore}) are primary risk drivers.` : viewApp.risk === "Medium" ? `Moderate DTI (${viewApp.dti}%) — income is adequate but debt load needs monitoring.` : `Low DTI and strong credit score (${viewApp.creditScore}). Recommended for approval.`}</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-success" style={{ flex: 1, justifyContent: "center", padding: "11px" }} onClick={() => { manualDecision(viewApp, "Approved"); setViewApp(null); }}>Approve</button>
              <button className="btn btn-danger" style={{ flex: 1, justifyContent: "center", padding: "11px" }} onClick={() => { manualDecision(viewApp, "Rejected"); setViewApp(null); }}>Reject</button>
              <button className="btn btn-warn" style={{ flex: 1, justifyContent: "center", padding: "11px" }} onClick={() => { manualDecision(viewApp, "Review"); setViewApp(null); }}>Mark Review</button>
              <button className="btn btn-ghost" style={{ padding: "11px 18px" }} onClick={() => setViewApp(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── HIGH RISK DRILLDOWN PANEL ── */}
      {showHighRiskPanel && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setShowHighRiskPanel(false) }}>
          <div className="modal" style={{ width: 640, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#FF6B5B" }}>🚨 High-Risk Applications</div>
                <div className="mono" style={{ fontSize: 10, color: "rgba(240,238,255,.35)" }}>{apps.filter(a => a.risk === "High").length} USERS FLAGGED · IMMEDIATE ATTENTION REQUIRED</div>
              </div>
              <button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => setShowHighRiskPanel(false)}>✕</button>
            </div>
            {apps.filter(a => a.risk === "High" || a.score < 40).map((a, i) => (
              <div key={i} style={{ padding: "14px 16px", background: "rgba(255,107,91,.04)", border: "1px solid rgba(255,107,91,.15)", borderRadius: 12, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,107,91,.2)", border: "1px solid rgba(255,107,91,.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>{a.avatar}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{a.name}</div>
                      <div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,.3)" }}>{a.id}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 18, fontWeight: 900, color: "#FF6B5B" }}>{a.score}</span>
                    <StatusBadge s={a.status} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 10 }}>
                  <div style={{ padding: "8px 10px", background: "rgba(255,255,255,.03)", borderRadius: 8 }}>
                    <div style={{ fontSize: 9, color: "rgba(240,238,255,.35)", marginBottom: 3, fontWeight: 700 }}>DTI</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: a.dti > 50 ? "#FF6B5B" : "#FFB800" }}>{a.dti}%</div>
                  </div>
                  <div style={{ padding: "8px 10px", background: "rgba(255,255,255,.03)", borderRadius: 8 }}>
                    <div style={{ fontSize: 9, color: "rgba(240,238,255,.35)", marginBottom: 3, fontWeight: 700 }}>Credit Score</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: a.creditScore < 600 ? "#FF6B5B" : "#FFB800" }}>{a.creditScore}</div>
                  </div>
                  <div style={{ padding: "8px 10px", background: "rgba(255,255,255,.03)", borderRadius: 8 }}>
                    <div style={{ fontSize: 9, color: "rgba(240,238,255,.35)", marginBottom: 3, fontWeight: 700 }}>Income</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#00D4FF" }}>₹{(a.income / 100000).toFixed(1)}L</div>
                  </div>
                </div>
                <div style={{ padding: "7px 10px", background: "rgba(255,107,91,.06)", borderRadius: 7, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: "rgba(240,238,255,.55)" }}>⚠️ <strong style={{ color: "#FF6B5B" }}>Key Reason:</strong> {a.dti > 60 ? `Extreme debt-to-income ratio (${a.dti}%) — exceeds all safe thresholds.` : a.creditScore < 550 ? `Very low credit score (${a.creditScore}) — indicates poor repayment history.` : `High DTI (${a.dti}%) combined with insufficient income for loan size.`}</span>
                </div>
                <div style={{ display: "flex", gap: 7 }}>
                  <button className="btn btn-danger" style={{ fontSize: 11, padding: "6px 12px" }} onClick={() => { manualDecision(a, "Rejected"); setShowHighRiskPanel(false); }}>Reject</button>
                  <button className="btn btn-warn" style={{ fontSize: 11, padding: "6px 12px" }} onClick={() => { manualDecision(a, "Review"); setShowHighRiskPanel(false); }}>Send for Review</button>
                  <button className="btn btn-ghost" style={{ fontSize: 11, padding: "6px 12px" }} onClick={() => { setViewApp(a); setShowHighRiskPanel(false); }}>View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── OVERRIDE MODAL ── */}
      {overrideApp && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) { setOA(null); setOR("") } }}>
          <div className="modal">
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>Manual Override</div>
            <div className="mono" style={{ fontSize: 10, color: "rgba(240,238,255,.35)", marginBottom: 20 }}>{overrideApp.id} · {overrideApp.name}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "14px 16px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 10, color: "rgba(240,238,255,.38)", fontWeight: 700, marginBottom: 6 }}>SYSTEM DECISION</div>
                <StatusBadge s={overrideApp.status} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: "rgba(240,238,255,.38)", fontWeight: 700, marginBottom: 6 }}>RISK SCORE</div>
                <span style={{ fontSize: 20, fontWeight: 900, color: RC[overrideApp.risk] }}>{overrideApp.score}/100</span>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(240,238,255,.45)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>Admin Decision</label>
              <select className="select" style={{ width: "100%" }} value={overrideDec} onChange={e => setOD(e.target.value as Decision)}>
                {["Approved", "Rejected", "Review", "Pending"].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(240,238,255,.45)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>Reason for Override</label>
              <textarea className="input" rows={3} style={{ resize: "none" }} placeholder="Explain why you are overriding this decision…" value={overrideReason} onChange={e => setOR(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center", padding: "12px" }} onClick={submitOverride} disabled={!overrideReason}>Apply Override</button>
              <button className="btn btn-ghost" style={{ padding: "12px 20px" }} onClick={() => {
                setOA(null); setOR("")
              }
              }>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}