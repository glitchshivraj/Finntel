"use client";
import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Application {
  id: string; name: string; avatar: string;
  income: number; creditScore: number; loanAmount: number; dti: number;
  score: number; risk: "Low" | "Medium" | "High"; decision: "Approved" | "Rejected" | "Review";
  reasons: string[]; flags: string[]; confidence: number;
  time: string; breakdown: { label: string; contribution: number; color: string }[];
}

// ─── Risk Engine ──────────────────────────────────────────────────────────────
function runRiskEngine(income: number, creditScore: number, loanAmount: number): Omit<Application, "id"|"name"|"avatar"|"time"> {
  const dti = loanAmount > 0 && income > 0 ? Math.round((loanAmount / (income * 12)) * 100) : 0;

  // Score components
  let creditPts = 0;
  if (creditScore >= 750) creditPts = 35;
  else if (creditScore >= 700) creditPts = 28;
  else if (creditScore >= 650) creditPts = 20;
  else if (creditScore >= 600) creditPts = 12;
  else creditPts = 4;

  let incomePts = 0;
  if (income >= 1500000) incomePts = 30;
  else if (income >= 800000) incomePts = 24;
  else if (income >= 400000) incomePts = 16;
  else if (income >= 200000) incomePts = 8;
  else incomePts = 2;

  let dtiPts = 0;
  if (dti <= 20) dtiPts = 25;
  else if (dti <= 35) dtiPts = 18;
  else if (dti <= 50) dtiPts = 10;
  else if (dti <= 65) dtiPts = 4;
  else dtiPts = 0;

  const loanRatio = income > 0 ? loanAmount / income : 99;
  let loanPts = 0;
  if (loanRatio <= 2) loanPts = 10;
  else if (loanRatio <= 4) loanPts = 7;
  else if (loanRatio <= 6) loanPts = 3;
  else loanPts = 0;

  const score = Math.min(100, creditPts + incomePts + dtiPts + loanPts);

  let risk: Application["risk"] = score >= 70 ? "Low" : score >= 40 ? "Medium" : "High";
  let decision: Application["decision"] = score >= 70 ? "Approved" : score >= 40 ? "Review" : "Rejected";

  // Reasons
  const reasons: string[] = [];
  if (creditScore < 600) reasons.push("Credit score below 600 (critical threshold)");
  else if (creditScore < 700) reasons.push("Credit score below 700 (suboptimal)");
  if (dti > 50) reasons.push(`Very high DTI of ${dti}% (limit: 50%)`);
  else if (dti > 35) reasons.push(`Elevated DTI of ${dti}% (target: ≤35%)`);
  if (loanRatio > 5) reasons.push(`Loan is ${loanRatio.toFixed(1)}× annual income (limit: 5×)`);
  if (income < 300000) reasons.push("Annual income below minimum threshold (₹3,00,000)");


  // Flags (fraud/anomaly)
  const flags: string[] = [];
  if (loanRatio > 5) flags.push("OVER_LIMIT");
  if (creditScore < 580 && loanAmount > 1000000) flags.push("HIGH_RISK_COMBO");
  if (dti > 60) flags.push("HIGH_DTI");
  if (creditScore < 600) flags.push("LOW_CREDIT");
  if (loanAmount > income * 8) flags.push("FRAUD_RISK");

  const confidence = Math.round(50 + Math.abs(score - 55) * 0.9);

  const breakdown = [
    { label: "Credit Score",  contribution: creditPts, color: "#FF6BFF" },
    { label: "Income Level",  contribution: incomePts, color: "#00D4FF" },
    { label: "DTI Ratio",     contribution: dtiPts,    color: "#FFB800" },
    { label: "Loan-to-Income",contribution: loanPts,   color: "#00FFB3" },
  ];

  return { income, creditScore, loanAmount, dti, score, risk, decision, reasons, flags, confidence, breakdown };
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED: Application[] = [
  { id:"#FNT-4821", name:"Arjun Mehta",   avatar:"AM", time:"2m ago",  ...runRiskEngine(1840000,784,1200000) },
  { id:"#FNT-4820", name:"Priya Sharma",  avatar:"PS", time:"14m ago", ...runRiskEngine(720000, 632,850000)  },
  { id:"#FNT-4819", name:"Rohan Das",     avatar:"RD", time:"31m ago", ...runRiskEngine(380000, 520,2500000) },
  { id:"#FNT-4818", name:"Kavya Nair",    avatar:"KN", time:"1h ago",  ...runRiskEngine(1100000,768,575000)  },
  { id:"#FNT-4817", name:"Vikram Singh",  avatar:"VS", time:"2h ago",  ...runRiskEngine(950000, 648,1800000) },
  { id:"#FNT-4816", name:"Sneha Pillai",  avatar:"SP", time:"3h ago",  ...runRiskEngine(620000, 710,320000)  },
  { id:"#FNT-4815", name:"Aditya Kumar",  avatar:"AK", time:"5h ago",  ...runRiskEngine(280000, 490,4000000) },
  { id:"#FNT-4814", name:"Meera Iyer",    avatar:"MI", time:"6h ago",  ...runRiskEngine(2200000,810,3000000) },
  { id:"#FNT-4813", name:"Suresh Rao",    avatar:"SR", time:"8h ago",  ...runRiskEngine(450000, 670,600000)  },
  { id:"#FNT-4812", name:"Divya Thomas",  avatar:"DT", time:"10h ago", ...runRiskEngine(1500000,745,1500000) },
];

const WEEKLY = [
  { day:"Mon", a:34, r:8,  v:12 },
  { day:"Tue", a:41, r:11, v:9  },
  { day:"Wed", a:28, r:14, v:18 },
  { day:"Thu", a:52, r:7,  v:11 },
  { day:"Fri", a:47, r:9,  v:14 },
  { day:"Sat", a:19, r:4,  v:6  },
  { day:"Sun", a:23, r:5,  v:8  },
];

const SEGMENTS = [
  { label:"< 600",    rate:14, count:312  },
  { label:"600–649",  rate:38, count:487  },
  { label:"650–699",  rate:61, count:634  },
  { label:"700–749",  rate:78, count:892  },
  { label:"750+",     rate:93, count:1104 },
];

const REJECTION_REASONS = [
  { label:"Low Credit Score",   count:142, color:"#FF6BFF" },
  { label:"High DTI",           count:98,  color:"#FFB800" },
  { label:"Loan Over Limit",    count:76,  color:"#FF6B5B" },
  { label:"Low Income",         count:54,  color:"#A855F7" },
  { label:"High Risk Combo",    count:31,  color:"#00D4FF" },
];

const STATUS_S: Record<string, { color:string; bg:string; border:string }> = {
  Approved:{ color:"#00FFB3", bg:"rgba(0,255,179,0.08)",  border:"rgba(0,255,179,0.25)"  },
  Review:  { color:"#FFB800", bg:"rgba(255,184,0,0.08)",  border:"rgba(255,184,0,0.25)"  },
  Rejected:{ color:"#FF6B5B", bg:"rgba(255,107,91,0.08)", border:"rgba(255,107,91,0.25)" },
};
const RISK_S: Record<string, { color:string }> = {
  Low:   { color:"#00FFB3" },
  Medium:{ color:"#FFB800" },
  High:  { color:"#FF6B5B" },
};
const FLAG_S: Record<string, { color:string; bg:string }> = {
  OVER_LIMIT:     { color:"#FFB800", bg:"rgba(255,184,0,0.1)"    },
  HIGH_DTI:       { color:"#FF6BFF", bg:"rgba(255,107,255,0.1)"  },
  LOW_CREDIT:     { color:"#FF6B5B", bg:"rgba(255,107,91,0.1)"   },
  HIGH_RISK_COMBO:{ color:"#FF6B5B", bg:"rgba(255,107,91,0.12)"  },
  FRAUD_RISK:     { color:"#FF3B3B", bg:"rgba(255,59,59,0.15)"   },
};

function AnimNum({ target, suffix="" }: { target:number; suffix?:string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let cur = 0; const step = target / 50;
    const t = setInterval(() => { cur += step; if (cur >= target){ setV(target); clearInterval(t); } else setV(Math.floor(cur)); }, 18);
    return () => clearInterval(t);
  }, [target]);
  return <>{v.toLocaleString()}{suffix}</>;
}

const NAVS = [
  { icon:"⬡", label:"Overview",     id:"overview"   },
  { icon:"📋", label:"Applications", id:"applications"},
  { icon:"🧠", label:"Risk Engine",  id:"engine"     },
  { icon:"🔮", label:"Simulator",    id:"simulator"  },
  { icon:"📊", label:"Analytics",    id:"analytics"  },
  { icon:"🚨", label:"Fraud Alerts", id:"fraud"      },
  { icon:"⚙",  label:"Settings",     id:"settings"   },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeNav, setActiveNav]       = useState("overview");
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [apps, setApps]                 = useState<Application[]>(SEED);
  const [expandedRow, setExpandedRow]   = useState<string|null>(null);
  const [searchQ, setSearchQ]           = useState("");
  const [filterRisk, setFilterRisk]     = useState("All");
  const [filterDec, setFilterDec]       = useState("All");
  const [barH, setBarH]                 = useState(WEEKLY.map(()=>0));
  const [time, setTime]                 = useState(new Date());
  const [liveCount, setLiveCount]       = useState(3);
  const [mousePos, setMousePos]         = useState({ x:-100, y:-100 });

  // New assessment form
  const [formIncome, setFormIncome]     = useState("");
  const [formCredit, setFormCredit]     = useState("");
  const [formLoan, setFormLoan]         = useState("");
  const [formName, setFormName]         = useState("");
  const [formResult, setFormResult]     = useState<Application|null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // What-if simulator
  const [simIncome, setSimIncome]       = useState(800000);
  const [simCredit, setSimCredit]       = useState(680);
  const [simLoan, setSimLoan]           = useState(1000000);
  const simResult = runRiskEngine(simIncome, simCredit, simLoan);

  useEffect(() => {
    window.addEventListener("mousemove", (e) => setMousePos({ x:e.clientX, y:e.clientY }));
  }, []);
  useEffect(() => { const t = setTimeout(()=>setBarH(WEEKLY.map(d=>d.a+d.r+d.v)),400); return ()=>clearTimeout(t); }, []);
  useEffect(() => { const t = setInterval(()=>setTime(new Date()),1000); return ()=>clearInterval(t); }, []);
  useEffect(() => { const t = setInterval(()=>setLiveCount(n=>(n%5)+1),3200); return ()=>clearInterval(t); }, []);

  const handleSubmit = useCallback(() => {
    if (!formIncome || !formCredit || !formLoan || !formName) return;
    setFormSubmitting(true);
    setTimeout(() => {
      const result = runRiskEngine(Number(formIncome), Number(formCredit), Number(formLoan));
      const initials = formName.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
      const newApp: Application = {
        id: `#FNT-${4822 + apps.length - SEED.length}`,
        name: formName, avatar: initials, time: "just now", ...result
      };
      setFormResult(newApp);
      setApps(prev => [newApp, ...prev]);
      setFormSubmitting(false);
    }, 1800);
  }, [formIncome, formCredit, formLoan, formName, apps.length]);

  // Filtered apps
  const filtered = apps.filter(a => {
    const matchSearch = searchQ === "" || a.name.toLowerCase().includes(searchQ.toLowerCase()) || a.id.includes(searchQ);
    const matchRisk   = filterRisk === "All" || a.risk === filterRisk;
    const matchDec    = filterDec  === "All" || a.decision === filterDec;
    return matchSearch && matchRisk && matchDec;
  });

  const totalApps    = apps.length;
  const approvedCount= apps.filter(a=>a.decision==="Approved").length;
  const rejectedCount= apps.filter(a=>a.decision==="Rejected").length;
  const avgScore     = Math.round(apps.reduce((s,a)=>s+a.score,0)/apps.length);
  const approvalRate = Math.round((approvedCount/totalApps)*100);
  const fraudCount   = apps.filter(a=>a.flags.length>0).length;
  const maxBar       = Math.max(...WEEKLY.map(d=>d.a+d.r+d.v));
  const maxRej       = Math.max(...REJECTION_REASONS.map(r=>r.count));

  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", background:"#050508", color:"#F0EEFF", minHeight:"100vh", display:"flex", cursor:"none", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:linear-gradient(#FF6BFF,#00D4FF);border-radius:2px;}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dotBlink{0%,100%{opacity:1}50%{opacity:0.1}}
        @keyframes scanPulse{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}
        @keyframes pulseRing{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.4);opacity:0}}
        @keyframes orbFloat{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(20px,-30px) scale(1.05)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes barGrow{from{height:0}to{height:var(--h)}}
        .gradient-text{background:linear-gradient(135deg,#FF6BFF 0%,#A855F7 30%,#00D4FF 65%,#00FFB3 100%);background-size:250% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 5s linear infinite}
        .fade-up{animation:fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) both}
        .d1{animation-delay:.04s}.d2{animation-delay:.1s}.d3{animation-delay:.16s}.d4{animation-delay:.22s}.d5{animation-delay:.28s}.d6{animation-delay:.34s}
        .mono{font-family:'Space Mono',monospace}
        .nav-item{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:11px;font-weight:700;font-size:13px;cursor:none;transition:all .25s;border:1px solid transparent;color:rgba(240,238,255,0.38);}
        .nav-item:hover{background:rgba(255,107,255,0.06);color:rgba(240,238,255,0.75);border-color:rgba(255,107,255,0.1);}
        .nav-item.active{background:linear-gradient(135deg,rgba(255,107,255,0.15),rgba(168,85,247,0.1),rgba(0,212,255,0.08));border-color:rgba(255,107,255,0.25);color:#F0EEFF;box-shadow:0 0 20px rgba(255,107,255,0.1);}
        .stat-card{background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);border-radius:18px;padding:22px 24px;position:relative;overflow:hidden;transition:all .3s;cursor:none;}
        .stat-card:hover{transform:translateY(-4px);border-color:rgba(255,107,255,0.2);box-shadow:0 20px 40px rgba(255,107,255,0.07);}
        .glass-panel{background:rgba(12,10,20,0.72);border:1px solid rgba(255,255,255,0.07);border-radius:20px;overflow:hidden;backdrop-filter:blur(20px);}
        .data-row{display:grid;align-items:center;padding:13px 18px;border-radius:11px;transition:all .2s;cursor:none;border:1px solid transparent;}
        .data-row:hover{background:rgba(255,107,255,0.04);border-color:rgba(255,107,255,0.1);}
        .top-btn{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:9px 16px;color:rgba(240,238,255,0.55);font-family:'Outfit',sans-serif;font-weight:700;font-size:13px;cursor:none;transition:all .25s;display:flex;align-items:center;gap:7px;}
        .top-btn:hover{border-color:rgba(255,107,255,0.3);color:#F0EEFF;background:rgba(255,107,255,0.06);}
        .cta-btn{background:linear-gradient(135deg,#FF6BFF 0%,#A855F7 50%,#00D4FF 100%);background-size:200% 200%;animation:gradientShift 4s ease infinite;color:#fff;border:none;border-radius:10px;padding:9px 18px;font-family:'Outfit',sans-serif;font-weight:800;font-size:13px;cursor:none;transition:all .25s;display:flex;align-items:center;gap:7px;}
        .cta-btn:hover{transform:translateY(-1px);box-shadow:0 12px 30px rgba(255,107,255,0.35);}
        .cta-btn:disabled{opacity:.6;transform:none;}
        .auth-input{width:100%;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:11px;padding:13px 16px;color:#F0EEFF;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;outline:none;transition:all .3s;cursor:none;}
        .auth-input::placeholder{color:rgba(240,238,255,0.25);}
        .auth-input:focus{border-color:rgba(255,107,255,0.45);background:rgba(255,107,255,0.04);box-shadow:0 0 0 3px rgba(255,107,255,0.08);}
        .sim-slider{width:100%;-webkit-appearance:none;appearance:none;height:4px;border-radius:2px;background:rgba(255,255,255,0.08);outline:none;cursor:none;}
        .sim-slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#FF6BFF,#00D4FF);cursor:none;box-shadow:0 0 12px rgba(255,107,255,0.5);}
        .expand-panel{animation:slideDown .3s cubic-bezier(0.16,1,0.3,1) both;}
        .chart-bar{border-radius:4px 4px 0 0;transition:height 1.2s cubic-bezier(0.16,1,0.3,1);}
        .activity-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
        .tab-pill{padding:7px 16px;border-radius:100px;font-weight:700;font-size:13px;cursor:none;transition:all .25s;border:1px solid transparent;}
        .tab-pill.active{background:linear-gradient(135deg,rgba(255,107,255,0.2),rgba(0,212,255,0.15));border-color:rgba(255,107,255,0.3);color:#F0EEFF;}
        .tab-pill:not(.active){color:rgba(240,238,255,0.38);}
        .tab-pill:not(.active):hover{color:rgba(240,238,255,0.7);border-color:rgba(255,255,255,0.08);}
      `}</style>

      {/* cursor */}
      <div style={{ position:"fixed", zIndex:9999, pointerEvents:"none", left:mousePos.x-8, top:mousePos.y-8, width:16, height:16, borderRadius:"50%", background:"radial-gradient(circle,#FF6BFF,#00D4FF)", boxShadow:"0 0 20px 6px rgba(255,107,255,0.55)", mixBlendMode:"screen" }} />
      <div style={{ position:"fixed", zIndex:9998, pointerEvents:"none", left:mousePos.x-28, top:mousePos.y-28, width:56, height:56, borderRadius:"50%", border:"1px solid rgba(255,107,255,0.2)", transition:"left .14s ease,top .14s ease" }} />

      {/* orbs + grid */}
      <div style={{ position:"fixed", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,107,255,0.07) 0%,transparent 70%)", top:"-5%", right:"10%", animation:"orbFloat 14s ease-in-out infinite", pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,212,255,0.05) 0%,transparent 70%)", bottom:"5%", left:"20%", animation:"orbFloat 11s ease-in-out infinite reverse", pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", inset:0, backgroundImage:"linear-gradient(rgba(255,107,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,255,0.025) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none", zIndex:0 }} />

      {/* ── SIDEBAR ── */}
      <aside style={{ width:sidebarOpen?232:68, flexShrink:0, background:"rgba(8,7,14,0.96)", borderRight:"1px solid rgba(255,255,255,0.05)", display:"flex", flexDirection:"column", position:"fixed", top:0, left:0, bottom:0, zIndex:50, transition:"width .35s cubic-bezier(0.16,1,0.3,1)", overflow:"hidden" }}>
        <div style={{ padding:"18px 14px 14px", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", gap:10, minHeight:62 }}>
          <div style={{ position:"relative", width:32, height:32, flexShrink:0 }}>
            <div style={{ position:"absolute", inset:0, borderRadius:8, background:"linear-gradient(135deg,#FF6BFF,#00D4FF)", padding:1.5 }}>
              <div style={{ width:"100%", height:"100%", background:"#080810", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 1.5L15.5 5V9C15.5 13 12.5 16.5 9 17.5C5.5 16.5 2.5 13 2.5 9V5L9 1.5Z" fill="url(#sg)"/><defs><linearGradient id="sg" x1="2.5" y1="1.5" x2="15.5" y2="17.5" gradientUnits="userSpaceOnUse"><stop stopColor="#FF6BFF"/><stop offset="1" stopColor="#00D4FF"/></linearGradient></defs></svg>
              </div>
            </div>
          </div>
          {sidebarOpen && <span style={{ fontWeight:900, fontSize:17, letterSpacing:"-0.03em", whiteSpace:"nowrap" }}>Finn<span className="gradient-text">tel</span></span>}
        </div>
        <nav style={{ padding:"10px 8px", flex:1, display:"flex", flexDirection:"column", gap:3 }}>
          {NAVS.map(item => (
            <button key={item.id} className={`nav-item ${activeNav===item.id?"active":""}`} onClick={()=>setActiveNav(item.id)} style={{ justifyContent:sidebarOpen?"flex-start":"center" }}>
              <span style={{ fontSize:15, flexShrink:0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ whiteSpace:"nowrap" }}>{item.label}</span>}
              {item.id==="fraud" && fraudCount>0 && sidebarOpen && (
                <span style={{ marginLeft:"auto", background:"#FF6B5B", borderRadius:100, padding:"2px 7px", fontSize:10, fontWeight:800, color:"#fff" }}>{fraudCount}</span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ padding:"10px 8px 18px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 10px", borderRadius:11, background:"rgba(255,107,255,0.05)", border:"1px solid rgba(255,107,255,0.1)" }}>
            <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#FF6BFF,#A855F7)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, flexShrink:0 }}>AJ</div>
            {sidebarOpen && <div style={{ overflow:"hidden" }}><div style={{ fontSize:12, fontWeight:800, whiteSpace:"nowrap" }}>EL Mencho</div><div className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.32)", whiteSpace:"nowrap" }}>Risk Analyst</div></div>}
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex:1, marginLeft:sidebarOpen?232:68, transition:"margin-left .35s cubic-bezier(0.16,1,0.3,1)", display:"flex", flexDirection:"column", minHeight:"100vh", position:"relative", zIndex:1 }}>

        {/* TOP BAR */}
        <header style={{ height:62, borderBottom:"1px solid rgba(255,255,255,0.05)", background:"rgba(5,5,8,0.85)", backdropFilter:"blur(20px)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", position:"sticky", top:0, zIndex:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <button className="top-btn" style={{ padding:"8px 9px" }} onClick={()=>setSidebarOpen(o=>!o)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div>
              <div style={{ fontSize:15, fontWeight:800, letterSpacing:"-0.02em" }}>
                {NAVS.find(n=>n.id===activeNav)?.icon} {NAVS.find(n=>n.id===activeNav)?.label}
              </div>
              <div className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.3)", letterSpacing:"0.06em" }}>
                {time.toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short"})} · {time.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
              </div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(0,255,179,0.07)", border:"1px solid rgba(0,255,179,0.2)", borderRadius:100, padding:"5px 12px" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#00FFB3", animation:"dotBlink 1.4s infinite", boxShadow:"0 0 8px #00FFB3" }} />
              <span className="mono" style={{ fontSize:9, color:"#00FFB3", fontWeight:700, letterSpacing:"0.1em" }}>{liveCount} LIVE</span>
            </div>
            {fraudCount > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(255,107,91,0.08)", border:"1px solid rgba(255,107,91,0.25)", borderRadius:100, padding:"5px 12px", cursor:"none" }} onClick={()=>setActiveNav("fraud")}>
                <span style={{ fontSize:12 }}>🚨</span>
                <span className="mono" style={{ fontSize:9, color:"#FF6B5B", fontWeight:700 }}>{fraudCount} FLAGGED</span>
              </div>
            )}
            <button className="cta-btn" onClick={()=>setActiveNav("engine")}>+ New Assessment</button>
          </div>
        </header>

        {/* CONTENT */}
        <main style={{ flex:1, padding:"28px", overflowY:"auto" }}>

          {/* ══ OVERVIEW ══ */}
          {activeNav === "overview" && (
            <div>
              {/* KPI Row */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginBottom:20 }}>
                {[
                  { label:"Total Apps",    v:totalApps,    suffix:"",   accent:"#FF6BFF", icon:"📋", delta:"+12.4%", up:true  },
                  { label:"Approved",      v:approvedCount,suffix:"",   accent:"#00FFB3", icon:"✅", delta:"+8.1%",  up:true  },
                  { label:"Rejected",      v:rejectedCount,suffix:"",   accent:"#FF6B5B", icon:"❌", delta:"-3.2%",  up:false },
                  { label:"Approval Rate", v:approvalRate, suffix:"%",  accent:"#00D4FF", icon:"📊", delta:"+1.5pt", up:true  },
                  { label:"Avg Score",     v:avgScore,     suffix:"/100",accent:"#A855F7", icon:"🎯", delta:"+2.1pt", up:true  },
                ].map((c,i) => (
                  <div key={c.label} className={`stat-card fade-up d${i+1}`}>
                    <div style={{ position:"absolute", top:-28, right:-28, width:90, height:90, borderRadius:"50%", background:`radial-gradient(circle,${c.accent}12,transparent)`, pointerEvents:"none" }} />
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${c.accent}60,transparent)`, animation:"scanPulse 3s ease-in-out infinite", animationDelay:`${i*.5}s`, pointerEvents:"none" }} />
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                      <span style={{ fontSize:10, fontWeight:700, color:"rgba(240,238,255,0.38)", letterSpacing:"0.05em", textTransform:"uppercase" }}>{c.label}</span>
                      <span style={{ fontSize:16 }}>{c.icon}</span>
                    </div>
                    <div style={{ fontSize:32, fontWeight:900, letterSpacing:"-0.04em", lineHeight:1, marginBottom:8, background:`linear-gradient(135deg,${c.accent},#F0EEFF)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                      <AnimNum target={c.v} suffix={c.suffix} />
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <span style={{ fontSize:11, color:c.up?"#00FFB3":"#FF6B5B", fontWeight:700 }}>{c.delta}</span>
                      <span style={{ fontSize:10, color:"rgba(240,238,255,0.3)", fontWeight:600 }}>vs yesterday</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:14, marginBottom:20 }}>
                {/* Bar chart */}
                <div className="glass-panel fade-up d3" style={{ padding:"22px 24px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                    <div><div style={{ fontSize:14, fontWeight:800, marginBottom:3 }}>Weekly Activity</div><div className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.32)", letterSpacing:"0.08em" }}>APPLICATIONS PER DAY</div></div>
                    <div style={{ display:"flex", gap:12 }}>
                      {[{c:"#00FFB3",l:"Approved"},{c:"#FFB800",l:"Review"},{c:"#FF6B5B",l:"Rejected"}].map(x=>(
                        <div key={x.l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                          <div style={{ width:7, height:7, borderRadius:2, background:x.c }} />
                          <span style={{ fontSize:10, color:"rgba(240,238,255,0.4)", fontWeight:700 }}>{x.l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:9, alignItems:"flex-end", height:140 }}>
                    {WEEKLY.map((d,i) => {
                      const total=d.a+d.r+d.v; const h=barH[i]?(total/maxBar)*130:0;
                      return (
                        <div key={d.day} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                          <div style={{ width:"100%", display:"flex", flexDirection:"column", justifyContent:"flex-end", height:130, gap:1 }}>
                            <div className="chart-bar" style={{ width:"100%", height:h?`${(d.r/total)*h}px`:"0px", background:"#FF6B5B" }} />
                            <div className="chart-bar" style={{ width:"100%", height:h?`${(d.v/total)*h}px`:"0px", background:"#FFB800" }} />
                            <div className="chart-bar" style={{ width:"100%", height:h?`${(d.a/total)*h}px`:"0px", background:"linear-gradient(180deg,#00FFB3,#00D4FF)" }} />
                          </div>
                          <span className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.32)" }}>{d.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Donut */}
                <div className="glass-panel fade-up d4" style={{ padding:"22px 20px" }}>
                  <div style={{ fontSize:14, fontWeight:800, marginBottom:3 }}>Risk Split</div>
                  <div className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.32)", letterSpacing:"0.08em", marginBottom:18 }}>TODAY</div>
                  <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}>
                    <div style={{ position:"relative", width:130, height:130 }}>
                      <svg width="130" height="130" viewBox="0 0 130 130">
                        <circle cx="65" cy="65" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16"/>
                        <circle cx="65" cy="65" r="48" fill="none" stroke="url(#dg1)" strokeWidth="16" strokeDasharray="301" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 65 65)"/>
                        <circle cx="65" cy="65" r="48" fill="none" stroke="#FFB800" strokeWidth="16" strokeDasharray={`${.28*301} ${.72*301}`} strokeDashoffset={`${-.62*301}`} strokeLinecap="round" transform="rotate(-90 65 65)"/>
                        <circle cx="65" cy="65" r="48" fill="none" stroke="#FF6B5B" strokeWidth="16" strokeDasharray={`${.1*301} ${.9*301}`} strokeDashoffset={`${-.9*301}`} strokeLinecap="round" transform="rotate(-90 65 65)"/>
                        <defs><linearGradient id="dg1" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#00FFB3"/><stop offset="1" stopColor="#00D4FF"/></linearGradient></defs>
                      </svg>
                      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                        <div style={{ fontSize:22, fontWeight:900, background:"linear-gradient(135deg,#00FFB3,#00D4FF)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>62%</div>
                        <div style={{ fontSize:9, color:"rgba(240,238,255,0.35)", fontWeight:700 }}>Low Risk</div>
                      </div>
                    </div>
                  </div>
                  {[{c:"#00FFB3",l:"Low",p:"62%"},{c:"#FFB800",l:"Medium",p:"28%"},{c:"#FF6B5B",l:"High",p:"10%"}].map(x=>(
                    <div key={x.l} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:9 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7 }}><div style={{ width:7, height:7, borderRadius:2, background:x.c, boxShadow:`0 0 8px ${x.c}80` }}/><span style={{ fontSize:12, fontWeight:700, color:"rgba(240,238,255,0.6)" }}>{x.l} Risk</span></div>
                      <span style={{ fontSize:12, fontWeight:700, color:x.c }}>{x.p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live feed + Segment analysis */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {/* Live Decision Feed */}
                <div className="glass-panel fade-up d5" style={{ padding:"22px 22px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                    <div><div style={{ fontSize:14, fontWeight:800, marginBottom:3 }}>Live Decision Feed</div><div className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.32)", letterSpacing:"0.08em" }}>REAL-TIME</div></div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:6, height:6, borderRadius:"50%", background:"#00FFB3", animation:"dotBlink 1.2s infinite", boxShadow:"0 0 8px #00FFB3" }}/><span className="mono" style={{ fontSize:9, color:"#00FFB3" }}>LIVE</span></div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {apps.slice(0,6).map((a,i) => (
                      <div key={a.id} style={{ display:"flex", gap:11, alignItems:"flex-start", padding:"10px 12px", borderRadius:11, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.04)" }}>
                        <div className="activity-dot" style={{ background:STATUS_S[a.decision].color, marginTop:3, position:"relative" }}>
                          <div style={{ position:"absolute", inset:-2, borderRadius:"50%", border:`1px solid ${STATUS_S[a.decision].color}`, animation:"pulseRing 2.5s ease-out infinite", animationDelay:`${i*.3}s` }} />
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                            <span style={{ fontSize:12, fontWeight:800 }}>{a.name}</span>
                            <span style={{ fontSize:11, fontWeight:800, color:STATUS_S[a.decision].color }}>{a.decision}</span>
                          </div>
                          <div style={{ fontSize:11, color:"rgba(240,238,255,0.38)", fontWeight:600 }}>
                            {a.id} · Score {a.score} · {a.risk} Risk · Reason: {a.reasons[0]?.split("(")[0].trim()}
                          </div>
                        </div>
                        <span className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.25)", whiteSpace:"nowrap" }}>{a.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User Segment Analysis */}
                <div className="glass-panel fade-up d6" style={{ padding:"22px 22px" }}>
                  <div style={{ fontSize:14, fontWeight:800, marginBottom:3 }}>User Segment Analysis</div>
                  <div className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.32)", letterSpacing:"0.08em", marginBottom:18 }}>APPROVAL RATE BY CREDIT SCORE</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    {SEGMENTS.map(s => (
                      <div key={s.label}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <span className="mono" style={{ fontSize:10, color:"rgba(240,238,255,0.5)", fontWeight:700 }}>{s.label}</span>
                            <span style={{ fontSize:10, color:"rgba(240,238,255,0.3)" }}>{s.count.toLocaleString()} apps</span>
                          </div>
                          <span style={{ fontSize:12, fontWeight:800, color: s.rate>=70?"#00FFB3":s.rate>=50?"#FFB800":"#FF6B5B" }}>{s.rate}%</span>
                        </div>
                        <div style={{ height:5, background:"rgba(255,255,255,0.05)", borderRadius:3, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${s.rate}%`, background: s.rate>=70?"linear-gradient(90deg,#00FFB3,#00D4FF)":s.rate>=50?"#FFB800":"#FF6B5B", borderRadius:3, transition:"width 1.2s cubic-bezier(0.16,1,0.3,1)", boxShadow: `0 0 10px ${s.rate>=70?"#00FFB380":s.rate>=50?"#FFB80080":"#FF6B5B80"}` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:16, padding:"10px 14px", background:"rgba(255,107,255,0.06)", border:"1px solid rgba(255,107,255,0.15)", borderRadius:10 }}>
                    <span style={{ fontSize:12, color:"rgba(240,238,255,0.65)" }}>💡 Users below <strong style={{ color:"#FF6BFF" }}>credit score 600</strong> have an <strong style={{ color:"#FF6B5B" }}>86% rejection rate</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* ══ APPLICATIONS ══ */}
          {activeNav === "applications" && (
            <div>
              {/* Filters */}
              <div className="glass-panel fade-up d1" style={{ padding:"18px 22px", marginBottom:16, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <div style={{ position:"relative", flex:1, minWidth:200 }}>
                  <svg style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"rgba(240,238,255,0.3)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input className="auth-input" placeholder="Search by name or ID…" style={{ paddingLeft:36 }} value={searchQ} onChange={e=>setSearchQ(e.target.value)} />
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  {["All","Low","Medium","High"].map(r=>(
                    <button key={r} className={`tab-pill ${filterRisk===r?"active":""}`} onClick={()=>setFilterRisk(r)} style={{ background:filterRisk===r?"rgba(255,107,255,0.1)":undefined }}>{r}</button>
                  ))}
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  {["All","Approved","Review","Rejected"].map(d=>(
                    <button key={d} className={`tab-pill ${filterDec===d?"active":""}`} onClick={()=>setFilterDec(d)}>{d}</button>
                  ))}
                </div>
                <button className="top-btn">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export CSV
                </button>
              </div>

              {/* Table — no expandable panel on click */}
              <div className="glass-panel fade-up d2">
                <div style={{ padding:"18px 20px 14px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize:14, fontWeight:800 }}>All Applications <span className="mono" style={{ fontSize:11, color:"rgba(240,238,255,0.35)" }}>({filtered.length})</span></div>
                </div>
                {/* Column headers */}
                <div className="data-row" style={{ gridTemplateColumns:"1.8fr 1fr 0.9fr 0.8fr 0.8fr 1fr", borderRadius:0, padding:"9px 18px", cursor:"default" }}>
                  {["Applicant","Amount","Score","Risk","Decision","Flags"].map(h=>(
                    <span key={h} className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.28)", letterSpacing:"0.1em", textTransform:"uppercase" }}>{h}</span>
                  ))}
                </div>
                {/* Rows — plain, no onClick expand */}
                <div style={{ padding:"6px 4px" }}>
                  {filtered.map(app => {
                    const ss=STATUS_S[app.decision]; const rs=RISK_S[app.risk];
                    return (
                      <div key={app.id} className="data-row" style={{ gridTemplateColumns:"1.8fr 1fr 0.9fr 0.8fr 0.8fr 1fr" }}>
                        {/* Applicant */}
                        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                          <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,rgba(255,107,255,0.3),rgba(168,85,247,0.3))", border:"1px solid rgba(255,107,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0 }}>{app.avatar}</div>
                          <div>
                            <div style={{ fontSize:13, fontWeight:800 }}>{app.name}</div>
                            <div className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.3)" }}>{app.id}</div>
                          </div>
                        </div>
                        {/* Amount */}
                        <span style={{ fontSize:13, fontWeight:700 }}>₹{(app.loanAmount/100000).toFixed(1)}L</span>
                        {/* Score ring */}
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:30, height:30, borderRadius:"50%", background:`conic-gradient(${rs.color} ${app.score*3.6}deg,rgba(255,255,255,0.05) 0deg)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <div style={{ width:21, height:21, borderRadius:"50%", background:"#07070E", display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <span style={{ fontSize:8, fontWeight:900, color:rs.color }}>{app.score}</span>
                            </div>
                          </div>
                          <span className="mono" style={{ fontSize:10, color:"rgba(240,238,255,0.4)" }}>{app.confidence}%</span>
                        </div>
                        {/* Risk tier */}
                        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                          <div style={{ width:5, height:5, borderRadius:"50%", background:rs.color, boxShadow:`0 0 8px ${rs.color}` }}/>
                          <span style={{ fontSize:12, fontWeight:700, color:rs.color }}>{app.risk}</span>
                        </div>
                        {/* Decision badge */}
                        <div style={{ display:"inline-flex", alignItems:"center", background:ss.bg, border:`1px solid ${ss.border}`, borderRadius:100, padding:"3px 10px" }}>
                          <span className="mono" style={{ fontSize:9, color:ss.color, fontWeight:700, letterSpacing:"0.08em" }}>{app.decision.toUpperCase()}</span>
                        </div>
                        {/* Flags */}
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                          {app.flags.length===0
                            ? <span style={{ fontSize:11, color:"rgba(240,238,255,0.2)" }}>—</span>
                            : app.flags.map(f=>(
                                <span key={f} style={{ fontSize:8, fontWeight:800, background:FLAG_S[f]?.bg||"rgba(255,107,255,0.1)", color:FLAG_S[f]?.color||"#FF6BFF", padding:"2px 6px", borderRadius:4, letterSpacing:"0.05em" }}>{f.replace(/_/g," ")}</span>
                              ))
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══ RISK ENGINE (New Assessment Form) ══ */}
          {activeNav === "engine" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              {/* Form */}
              <div className="glass-panel fade-up d1" style={{ padding:"28px" }}>
                <div style={{ fontSize:16, fontWeight:900, marginBottom:4 }}>New Risk Assessment</div>
                <div className="mono" style={{ fontSize:10, color:"rgba(240,238,255,0.35)", marginBottom:24, letterSpacing:"0.08em" }}>ENTER APPLICANT FINANCIAL DATA</div>
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(240,238,255,0.5)", marginBottom:8, letterSpacing:"0.06em" }}>APPLICANT NAME</label>
                    <input className="auth-input" placeholder="Full name" value={formName} onChange={e=>setFormName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(240,238,255,0.5)", marginBottom:8, letterSpacing:"0.06em" }}>ANNUAL INCOME (₹)</label>
                    <input className="auth-input" type="number" placeholder="e.g. 1200000" value={formIncome} onChange={e=>setFormIncome(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(240,238,255,0.5)", marginBottom:8, letterSpacing:"0.06em" }}>CREDIT SCORE (300–900)</label>
                    <input className="auth-input" type="number" placeholder="e.g. 720" value={formCredit} onChange={e=>setFormCredit(e.target.value)} />
                    {formCredit && (
                      <div style={{ marginTop:8, display:"flex", gap:5 }}>
                        {[300,500,600,650,700,750,900].map((v,i,a) => Number(formCredit)>=v && Number(formCredit)<(a[i+1]||901) ? (
                          <span key={v} style={{ fontSize:11, fontWeight:700, color: Number(formCredit)>=750?"#00FFB3":Number(formCredit)>=700?"#00D4FF":Number(formCredit)>=650?"#FFB800":"#FF6B5B" }}>
                            {Number(formCredit)>=750?"Excellent":Number(formCredit)>=700?"Good":Number(formCredit)>=650?"Fair":Number(formCredit)>=600?"Poor":"Very Poor"}
                          </span>
                        ):null)}
                        <div style={{ flex:1, display:"flex", gap:3, alignItems:"center" }}>
                          {[300,450,600,750].map(v=>(<div key={v} style={{ flex:1, height:3, borderRadius:2, background: Number(formCredit)>=v?"linear-gradient(90deg,#FF6B5B,#FFB800,#00FFB3)":"rgba(255,255,255,0.06)" }}/>))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(240,238,255,0.5)", marginBottom:8, letterSpacing:"0.06em" }}>LOAN AMOUNT (₹)</label>
                    <input className="auth-input" type="number" placeholder="e.g. 500000" value={formLoan} onChange={e=>setFormLoan(e.target.value)} />
                    {formIncome && formLoan && (
                      <div style={{ marginTop:6, fontSize:11, color:"rgba(240,238,255,0.4)" }}>
                        DTI: <strong style={{ color: (Number(formLoan)/(Number(formIncome)*12)*100)>50?"#FF6B5B":"#00FFB3" }}>{Math.round(Number(formLoan)/(Number(formIncome)*12)*100)}%</strong>
                        &nbsp;· Loan-to-Income: <strong style={{ color: Number(formLoan)/Number(formIncome)>5?"#FF6B5B":"#00FFB3" }}>{(Number(formLoan)/Number(formIncome)).toFixed(1)}×</strong>
                      </div>
                    )}
                  </div>
                  <button className="cta-btn" style={{ justifyContent:"center", padding:"13px", fontSize:15, marginTop:4 }} onClick={handleSubmit} disabled={formSubmitting||!formName||!formIncome||!formCredit||!formLoan}>
                    {formSubmitting ? <><svg style={{ animation:"spin .8s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>Evaluating…</> : "Run Risk Assessment →"}
                  </button>
                </div>
              </div>

              {/* Result */}
              <div className="glass-panel fade-up d2" style={{ padding:"28px", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,#FF6BFF,#00D4FF,transparent)", animation:"scanPulse 4s ease-in-out infinite", pointerEvents:"none" }} />
                <div style={{ fontSize:16, fontWeight:900, marginBottom:4 }}>Assessment Result</div>
                <div className="mono" style={{ fontSize:10, color:"rgba(240,238,255,0.35)", marginBottom:24, letterSpacing:"0.08em" }}>AI DECISION OUTPUT</div>

                {!formResult ? (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:300, gap:16, color:"rgba(240,238,255,0.2)" }}>
                    <div style={{ fontSize:48 }}>🧠</div>
                    <div style={{ fontSize:14, fontWeight:700, textAlign:"center" }}>Submit an application to see<br/>the risk assessment result</div>
                  </div>
                ) : (
                  <div>
                    {/* Verdict */}
                    <div style={{ background: formResult.decision==="Approved"?"linear-gradient(135deg,rgba(0,255,179,0.12),rgba(0,212,255,0.08))":formResult.decision==="Review"?"linear-gradient(135deg,rgba(255,184,0,0.12),rgba(255,107,255,0.08))":"linear-gradient(135deg,rgba(255,107,91,0.12),rgba(255,107,255,0.08))", border:`1px solid ${STATUS_S[formResult.decision].border}`, borderRadius:16, padding:"20px 22px", marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.4)", letterSpacing:"0.14em", marginBottom:7 }}>FINAL VERDICT</div>
                        <div style={{ fontSize:26, fontWeight:900, color:STATUS_S[formResult.decision].color, textShadow:`0 0 24px ${STATUS_S[formResult.decision].color}60` }}>
                          {formResult.decision==="Approved"?"✅":formResult.decision==="Review"?"⚠️":"❌"} {formResult.decision.toUpperCase()}
                        </div>
                        <div style={{ fontSize:12, color:"rgba(240,238,255,0.5)", marginTop:6 }}>Risk: <strong style={{ color:RISK_S[formResult.risk].color }}>{formResult.risk}</strong> · Confidence: <strong style={{ color:"#FF6BFF" }}>{formResult.confidence}%</strong></div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.38)", letterSpacing:"0.12em", marginBottom:5 }}>RISK SCORE</div>
                        <div style={{ fontSize:48, fontWeight:900, letterSpacing:"-0.04em", background:`linear-gradient(135deg,${RISK_S[formResult.risk].color},#F0EEFF)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{formResult.score}</div>
                        <div style={{ fontSize:10, color:"rgba(240,238,255,0.3)" }}>out of 100</div>
                      </div>
                    </div>

                    {/* Breakdown bars */}
                    <div style={{ marginBottom:18 }}>
                      <div className="mono" style={{ fontSize:9, color:"#FF6BFF", letterSpacing:"0.12em", marginBottom:12 }}>SCORE BREAKDOWN</div>
                      {formResult.breakdown.map(b=>(
                        <div key={b.label} style={{ marginBottom:10 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                            <span style={{ fontSize:12, fontWeight:700, color:"rgba(240,238,255,0.6)" }}>{b.label}</span>
                            <span className="mono" style={{ fontSize:11, color:b.color, fontWeight:700 }}>+{b.contribution}pts</span>
                          </div>
                          <div style={{ height:5, background:"rgba(255,255,255,0.05)", borderRadius:3 }}>
                            <div style={{ height:"100%", width:`${(b.contribution/35)*100}%`, background:b.color, borderRadius:3, boxShadow:`0 0 10px ${b.color}60`, transition:"width 1s ease" }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reasons — only shown when there are actual issues */}
                    {formResult.reasons.length > 0 && (
                      <div>
                        <div className="mono" style={{ fontSize:9, color:"#00D4FF", letterSpacing:"0.12em", marginBottom:10 }}>DECISION REASONING</div>
                        {formResult.reasons.map((r,i)=>(
                          <div key={i} style={{ display:"flex", gap:8, marginBottom:8, padding:"9px 12px", background:"rgba(0,212,255,0.05)", border:"1px solid rgba(0,212,255,0.12)", borderRadius:9 }}>
                            <span style={{ fontSize:12, color:"#FF6B5B" }}>✕</span>
                            <span style={{ fontSize:12, color:"rgba(240,238,255,0.65)", lineHeight:1.6 }}>{r}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {formResult.flags.length > 0 && (
                      <div style={{ marginTop:14, padding:"12px 14px", background:"rgba(255,107,91,0.08)", border:"1px solid rgba(255,107,91,0.22)", borderRadius:10 }}>
                        <div style={{ fontSize:12, color:"#FF6B5B", fontWeight:800, marginBottom:7 }}>🚨 Anomaly Flags Detected</div>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                          {formResult.flags.map(f=>(
                            <span key={f} style={{ fontSize:10, fontWeight:800, background:FLAG_S[f]?.bg, color:FLAG_S[f]?.color, padding:"3px 8px", borderRadius:5 }}>{f.replace(/_/g," ")}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ WHAT-IF SIMULATOR ══ */}
          {activeNav === "simulator" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              <div className="glass-panel fade-up d1" style={{ padding:"28px" }}>
                <div style={{ fontSize:16, fontWeight:900, marginBottom:4 }}>What-If Simulator</div>
                <div className="mono" style={{ fontSize:10, color:"rgba(240,238,255,0.35)", marginBottom:6, letterSpacing:"0.08em" }}>INTERACTIVE RISK EXPLORER 🔮</div>
                <p style={{ fontSize:13, color:"rgba(240,238,255,0.45)", lineHeight:1.7, marginBottom:28 }}>Drag the sliders to instantly see how changes in income, credit score, or loan amount affect the decision and risk score.</p>

                {[
                  { label:"Annual Income", min:100000, max:5000000, step:50000, val:simIncome, set:setSimIncome, fmt:(v:number)=>`₹${(v/100000).toFixed(1)}L`, color:"#00D4FF" },
                  { label:"Credit Score",  min:300,    max:900,     step:5,     val:simCredit, set:setSimCredit, fmt:(v:number)=>`${v}`,                   color:"#FF6BFF" },
                  { label:"Loan Amount",  min:50000,  max:10000000,step:50000, val:simLoan,   set:setSimLoan,   fmt:(v:number)=>`₹${(v/100000).toFixed(1)}L`, color:"#FFB800" },
                ].map(s=>(
                  <div key={s.label} style={{ marginBottom:28 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                      <label style={{ fontSize:12, fontWeight:700, color:"rgba(240,238,255,0.55)", letterSpacing:"0.05em", textTransform:"uppercase" }}>{s.label}</label>
                      <span style={{ fontSize:16, fontWeight:900, color:s.color, fontFamily:"'Space Mono',monospace" }}>{s.fmt(s.val)}</span>
                    </div>
                    <div style={{ position:"relative" }}>
                      <div style={{ position:"absolute", top:"50%", left:0, right:0, height:4, background:`linear-gradient(90deg,${s.color}60,${s.color})`, borderRadius:2, transform:"translateY(-50%)", width:`${((s.val-s.min)/(s.max-s.min))*100}%` }} />
                      <input className="sim-slider" type="range" min={s.min} max={s.max} step={s.step} value={s.val} onChange={e=>s.set(Number(e.target.value))} style={{ position:"relative", zIndex:1 }} />
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                      <span className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.25)" }}>{s.fmt(s.min)}</span>
                      <span className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.25)" }}>{s.fmt(s.max)}</span>
                    </div>
                  </div>
                ))}

                <div style={{ padding:"14px 16px", background:"rgba(255,107,255,0.06)", border:"1px solid rgba(255,107,255,0.15)", borderRadius:12 }}>
                  <div className="mono" style={{ fontSize:9, color:"#FF6BFF", letterSpacing:"0.1em", marginBottom:8 }}>REAL-TIME METRICS</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {[
                      ["DTI Ratio", `${simResult.dti}%`, simResult.dti>50?"#FF6B5B":simResult.dti>35?"#FFB800":"#00FFB3"],
                      ["Loan-to-Income", `${(simLoan/simIncome).toFixed(1)}×`, simLoan/simIncome>5?"#FF6B5B":simLoan/simIncome>3?"#FFB800":"#00FFB3"],
                    ].map(([k,v,c])=>(
                      <div key={k as string} style={{ padding:"8px 12px", background:"rgba(255,255,255,0.03)", borderRadius:8 }}>
                        <div style={{ fontSize:10, color:"rgba(240,238,255,0.4)", fontWeight:700, marginBottom:4 }}>{k}</div>
                        <div style={{ fontSize:18, fontWeight:900, color:c as string }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live result */}
              <div className="glass-panel fade-up d2" style={{ padding:"28px", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${RISK_S[simResult.risk].color},transparent)`, animation:"scanPulse 3s ease-in-out infinite", pointerEvents:"none" }} />
                <div style={{ fontSize:16, fontWeight:900, marginBottom:4 }}>Live Prediction</div>
                <div className="mono" style={{ fontSize:10, color:"rgba(240,238,255,0.35)", letterSpacing:"0.08em", marginBottom:24 }}>UPDATES INSTANTLY AS YOU MOVE SLIDERS</div>

                {/* Big score */}
                <div style={{ textAlign:"center", marginBottom:28 }}>
                  <div style={{ position:"relative", width:160, height:160, margin:"0 auto 16px" }}>
                    <svg width="160" height="160" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"/>
                      <circle cx="80" cy="80" r="68" fill="none" stroke={RISK_S[simResult.risk].color} strokeWidth="12" strokeDasharray={`${2*Math.PI*68}`} strokeDashoffset={`${2*Math.PI*68*(1-simResult.score/100)}`} strokeLinecap="round" transform="rotate(-90 80 80)" style={{ transition:"stroke-dashoffset .6s ease, stroke .4s ease" }}/>
                    </svg>
                    <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                      <div style={{ fontSize:48, fontWeight:900, letterSpacing:"-0.04em", color:RISK_S[simResult.risk].color, textShadow:`0 0 30px ${RISK_S[simResult.risk].color}60`, transition:"color .4s ease" }}>{simResult.score}</div>
                      <div style={{ fontSize:11, color:"rgba(240,238,255,0.35)", fontWeight:700 }}>RISK SCORE</div>
                    </div>
                  </div>
                  <div style={{ fontSize:28, fontWeight:900, color:STATUS_S[simResult.decision].color, marginBottom:6, textShadow:`0 0 20px ${STATUS_S[simResult.decision].color}50` }}>
                    {simResult.decision==="Approved"?"✅":simResult.decision==="Review"?"⚠️":"❌"} {simResult.decision.toUpperCase()}
                  </div>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:RISK_S[simResult.risk].color+"15", border:`1px solid ${RISK_S[simResult.risk].color}30`, borderRadius:100, padding:"4px 14px" }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:RISK_S[simResult.risk].color }}/> 
                    <span className="mono" style={{ fontSize:10, color:RISK_S[simResult.risk].color, fontWeight:700 }}>{simResult.risk.toUpperCase()} RISK</span>
                  </span>
                </div>

                {/* Breakdown */}
                <div style={{ marginBottom:18 }}>
                  {simResult.breakdown.map(b=>(
                    <div key={b.label} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                        <span style={{ fontSize:12, fontWeight:700, color:"rgba(240,238,255,0.55)" }}>{b.label}</span>
                        <span className="mono" style={{ fontSize:11, color:b.color, fontWeight:700 }}>+{b.contribution}pts</span>
                      </div>
                      <div style={{ height:5, background:"rgba(255,255,255,0.05)", borderRadius:3 }}>
                        <div style={{ height:"100%", width:`${(b.contribution/35)*100}%`, background:b.color, borderRadius:3, boxShadow:`0 0 10px ${b.color}60`, transition:"width .5s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Flags */}
                {simResult.flags.length > 0 && (
                  <div style={{ padding:"12px 14px", background:"rgba(255,107,91,0.08)", border:"1px solid rgba(255,107,91,0.22)", borderRadius:10 }}>
                    <div style={{ fontSize:11, color:"#FF6B5B", fontWeight:800, marginBottom:6 }}>🚨 Anomaly Flags</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {simResult.flags.map(f=>(<span key={f} style={{ fontSize:9, fontWeight:800, background:FLAG_S[f]?.bg, color:FLAG_S[f]?.color, padding:"2px 7px", borderRadius:4 }}>{f.replace(/_/g," ")}</span>))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ ANALYTICS ══ */}
          {activeNav === "analytics" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {/* Rejection Reasons */}
              <div className="glass-panel fade-up d1" style={{ padding:"24px" }}>
                <div style={{ fontSize:15, fontWeight:800, marginBottom:3 }}>Top Rejection Reasons</div>
                <div className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.32)", letterSpacing:"0.08em", marginBottom:20 }}>THIS MONTH</div>
                {REJECTION_REASONS.map(r=>(
                  <div key={r.label} style={{ marginBottom:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:"rgba(240,238,255,0.65)" }}>{r.label}</span>
                      <span className="mono" style={{ fontSize:12, color:r.color, fontWeight:700 }}>{r.count}</span>
                    </div>
                    <div style={{ height:6, background:"rgba(255,255,255,0.05)", borderRadius:3 }}>
                      <div style={{ height:"100%", width:`${(r.count/maxRej)*100}%`, background:`linear-gradient(90deg,${r.color}80,${r.color})`, borderRadius:3, boxShadow:`0 0 12px ${r.color}50`, transition:"width 1.2s cubic-bezier(0.16,1,0.3,1)" }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Segment analysis deeper */}
              <div className="glass-panel fade-up d2" style={{ padding:"24px" }}>
                <div style={{ fontSize:15, fontWeight:800, marginBottom:3 }}>Approval by Credit Band</div>
                <div className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.32)", letterSpacing:"0.08em", marginBottom:20 }}>SEGMENT BREAKDOWN</div>
                {SEGMENTS.map(s=>(
                  <div key={s.label} style={{ marginBottom:14, padding:"12px 16px", background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                      <div>
                        <div className="mono" style={{ fontSize:11, fontWeight:700, color:"rgba(240,238,255,0.6)" }}>Credit {s.label}</div>
                        <div style={{ fontSize:11, color:"rgba(240,238,255,0.3)", marginTop:2 }}>{s.count.toLocaleString()} applications</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:22, fontWeight:900, color:s.rate>=70?"#00FFB3":s.rate>=50?"#FFB800":"#FF6B5B" }}>{s.rate}%</div>
                        <div style={{ fontSize:10, color:"rgba(240,238,255,0.3)" }}>approval rate</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:4 }}>
                      <div style={{ flex:s.rate, height:4, background:"linear-gradient(90deg,#00FFB390,#00FFB3)", borderRadius:2 }} />
                      <div style={{ flex:100-s.rate, height:4, background:"rgba(255,107,91,0.3)", borderRadius:2 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly trend */}
              <div className="glass-panel fade-up d3" style={{ padding:"24px", gridColumn:"1/-1" }}>
                <div style={{ fontSize:15, fontWeight:800, marginBottom:3 }}>Weekly Approval Trends</div>
                <div className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.32)", letterSpacing:"0.08em", marginBottom:20 }}>LAST 7 DAYS</div>
                <div style={{ display:"flex", gap:10, alignItems:"flex-end", height:160 }}>
                  {WEEKLY.map((d,i)=>{
                    const total=d.a+d.r+d.v; const h=barH[i]?(total/maxBar)*140:0;
                    return (
                      <div key={d.day} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:10, color:"rgba(240,238,255,0.4)", fontWeight:700 }}>{total}</span>
                        <div style={{ width:"100%", display:"flex", flexDirection:"column", justifyContent:"flex-end", height:130, gap:1 }}>
                          <div className="chart-bar" style={{ width:"100%", height:h?`${(d.r/total)*h}px`:"0", background:"#FF6B5B" }}/>
                          <div className="chart-bar" style={{ width:"100%", height:h?`${(d.v/total)*h}px`:"0", background:"#FFB800" }}/>
                          <div className="chart-bar" style={{ width:"100%", height:h?`${(d.a/total)*h}px`:"0", background:"linear-gradient(180deg,#00FFB3,#00D4FF)" }}/>
                        </div>
                        <span className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.32)" }}>{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══ FRAUD ALERTS ══ */}
          {activeNav === "fraud" && (
            <div>
              <div style={{ marginBottom:16, padding:"14px 20px", background:"rgba(255,107,91,0.08)", border:"1px solid rgba(255,107,91,0.25)", borderRadius:14, display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:20 }}>🚨</span>
                <div>
                  <div style={{ fontSize:14, fontWeight:800, color:"#FF6B5B" }}>{fraudCount} Anomalous Applications Detected</div>
                  <div style={{ fontSize:12, color:"rgba(240,238,255,0.45)", marginTop:2 }}>These applications have triggered one or more fraud/anomaly detection rules. Review immediately.</div>
                </div>
              </div>
              <div className="glass-panel fade-up d1">
                <div className="data-row" style={{ gridTemplateColumns:"1.5fr 1fr 0.8fr 0.8fr 1.2fr 1.5fr", borderRadius:0, padding:"9px 18px", cursor:"default" }}>
                  {["Applicant","Amount","Score","Decision","Risk Flags","Anomaly Detail"].map(h=>(
                    <span key={h} className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.28)", letterSpacing:"0.1em", textTransform:"uppercase" }}>{h}</span>
                  ))}
                </div>
                <div style={{ padding:"6px 4px" }}>
                  {apps.filter(a=>a.flags.length>0).map(app=>(
                    <div key={app.id} className="data-row" style={{ gridTemplateColumns:"1.5fr 1fr 0.8fr 0.8fr 1.2fr 1.5fr", borderColor:"rgba(255,107,91,0.1)", background:"rgba(255,107,91,0.03)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                        <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,rgba(255,107,91,0.3),rgba(255,107,255,0.2))", border:"1px solid rgba(255,107,91,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800 }}>{app.avatar}</div>
                        <div><div style={{ fontSize:13, fontWeight:800 }}>{app.name}</div><div className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.3)" }}>{app.id}</div></div>
                      </div>
                      <span style={{ fontSize:13, fontWeight:700 }}>₹{(app.loanAmount/100000).toFixed(1)}L</span>
                      <span style={{ fontSize:14, fontWeight:900, color:RISK_S[app.risk].color }}>{app.score}</span>
                      <div style={{ display:"inline-flex", alignItems:"center", background:STATUS_S[app.decision].bg, border:`1px solid ${STATUS_S[app.decision].border}`, borderRadius:100, padding:"3px 10px" }}>
                        <span className="mono" style={{ fontSize:9, color:STATUS_S[app.decision].color, fontWeight:700 }}>{app.decision.toUpperCase()}</span>
                      </div>
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                        {app.flags.map(f=>(<span key={f} style={{ fontSize:8, fontWeight:800, background:FLAG_S[f]?.bg, color:FLAG_S[f]?.color, padding:"2px 6px", borderRadius:4 }}>{f.replace(/_/g," ")}</span>))}
                      </div>
                      <div style={{ fontSize:11, color:"rgba(240,238,255,0.5)", lineHeight:1.5 }}>
                        {app.flags.includes("FRAUD_RISK") && "Loan is "+((app.loanAmount/app.income).toFixed(1))+"× income"}
                        {app.flags.includes("HIGH_RISK_COMBO") && "Low credit + high loan amount"}
                        {app.flags.includes("OVER_LIMIT") && !app.flags.includes("FRAUD_RISK") && "Exceeds 5× income threshold"}
                        {app.flags.includes("HIGH_DTI") && " · DTI "+app.dti+"%"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ SETTINGS ══ */}
          {activeNav === "settings" && (
            <div style={{ maxWidth:600 }}>
              <div className="glass-panel fade-up d1" style={{ padding:"28px", marginBottom:16 }}>
                <div style={{ fontSize:15, fontWeight:800, marginBottom:4 }}>Risk Engine Thresholds</div>
                <div className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.32)", letterSpacing:"0.08em", marginBottom:22 }}>CONFIGURE DECISION RULES</div>
                {[
                  { label:"Minimum Credit Score for Approval", val:"700", accent:"#FF6BFF" },
                  { label:"Maximum DTI Ratio (%)", val:"50", accent:"#FFB800" },
                  { label:"Max Loan-to-Income Multiplier", val:"5", accent:"#00D4FF" },
                  { label:"Minimum Annual Income (₹)", val:"3,00,000", accent:"#00FFB3" },
                ].map(s=>(
                  <div key={s.label} style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(240,238,255,0.45)", marginBottom:8, letterSpacing:"0.06em" }}>{s.label.toUpperCase()}</label>
                    <input className="auth-input" defaultValue={s.val} style={{ borderColor:`${s.accent}30` }} />
                  </div>
                ))}
                <button className="cta-btn" style={{ justifyContent:"center", padding:"12px", fontSize:14, marginTop:4 }}>Save Configuration</button>
              </div>
              <div className="glass-panel fade-up d2" style={{ padding:"28px" }}>
                <div style={{ fontSize:15, fontWeight:800, marginBottom:4 }}>Account</div>
                <div className="mono" style={{ fontSize:9, color:"rgba(240,238,255,0.32)", letterSpacing:"0.08em", marginBottom:22 }}>PROFILE SETTINGS</div>
                {[["Full Name","Aryan Joshi"],["Email","aryan@finntel.ai"],["Role","Risk Analyst"],["Organization","Finntel Technologies"]].map(([k,v])=>(
                  <div key={k} style={{ marginBottom:14 }}>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(240,238,255,0.45)", marginBottom:7, letterSpacing:"0.06em" }}>{(k as string).toUpperCase()}</label>
                    <input className="auth-input" defaultValue={v as string} />
                  </div>
                ))}
                <button className="cta-btn" style={{ justifyContent:"center", padding:"12px", fontSize:14, marginTop:4 }}>Update Profile</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}