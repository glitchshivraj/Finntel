"use client";
import { useState, useEffect } from "react";

// ─── Applicant Data ───────────────────────────────────────────────────────────
const DATA = {
  id:                "#FNT-004821",
  name:              "Arjun Mehta",
  avatar:            "AM",
  decision:          "Approved" as "Approved" | "Rejected" | "Review",
  appliedDate:       "23 Mar 2024",
  loanAmount:        1200000,
  loanType:          "Home Improvement",
  annualIncome:      1840000,
  monthlyIncome:     153333,
  monthlyExpenses:   42000,
  emi:               38900,
  dti:               5,
  creditUtilization: 22,
  totalLiabilities:  420000,
  creditScore:       784,
  loanToIncome:      0.65,
  interestRate:      10.5,
  tenure:            36,
};

// Derived
const surplus     = DATA.monthlyIncome - DATA.monthlyExpenses - DATA.emi;
const expPct      = Math.round((DATA.monthlyExpenses / DATA.monthlyIncome) * 100);
const emiPct      = Math.round((DATA.emi / DATA.monthlyIncome) * 100);
const surplusPct  = Math.round((surplus / DATA.monthlyIncome) * 100);
const liabPct     = Math.round((DATA.totalLiabilities / DATA.annualIncome) * 100);

// ─── Risk Alerts ──────────────────────────────────────────────────────────────
type AlertLevel = "green" | "yellow" | "red";
interface Alert { level: AlertLevel; icon: string; title: string; detail: string; }

const ALERTS: Alert[] = [
  DATA.loanToIncome > 5
    ? { level:"red",    icon:"🚨", title:"Loan amount exceeds 5× annual income",   detail:`Loan is ${DATA.loanToIncome}× annual income — significantly above safe threshold of 5×` }
    : DATA.loanToIncome > 3
    ? { level:"yellow", icon:"⚠️", title:"Loan amount is moderately high vs income", detail:`Loan is ${DATA.loanToIncome}× annual income — within caution range (3–5×)` }
    : { level:"green",  icon:"✅", title:"Loan amount is within safe range",          detail:`Loan is ${DATA.loanToIncome}× annual income — well within the 5× limit` },

  DATA.creditUtilization > 50
    ? { level:"red",    icon:"🚨", title:"Credit utilization critically high",       detail:`${DATA.creditUtilization}% utilization — exceeds 50% threshold; indicates credit stress` }
    : DATA.creditUtilization > 30
    ? { level:"yellow", icon:"⚠️", title:"Credit utilization above ideal range",     detail:`${DATA.creditUtilization}% utilization — above the recommended 30% ceiling` }
    : { level:"green",  icon:"✅", title:"Credit utilization is healthy",             detail:`${DATA.creditUtilization}% utilization — well below the 30% recommended limit` },

  DATA.dti > 50
    ? { level:"red",    icon:"🚨", title:"Debt-to-income ratio is dangerously high", detail:`DTI of ${DATA.dti}% exceeds the 50% maximum threshold` }
    : DATA.dti > 35
    ? { level:"yellow", icon:"⚠️", title:"Debt-to-income ratio needs attention",     detail:`DTI of ${DATA.dti}% is above the safe limit of 35%` }
    : { level:"green",  icon:"✅", title:"Debt-to-income ratio is within limits",     detail:`DTI of ${DATA.dti}% is comfortably below the 35% threshold` },

  surplus < 0
    ? { level:"red",    icon:"🚨", title:"Negative monthly surplus after EMI",       detail:"Applicant cannot meet EMI from monthly income — high default risk" }
    : surplusPct < 15
    ? { level:"yellow", icon:"⚠️", title:"Monthly surplus is thin after EMI",        detail:`Only ${surplusPct}% income remaining after expenses and EMI — limited buffer` }
    : { level:"green",  icon:"✅", title:"Healthy surplus after all obligations",     detail:`${surplusPct}% income (₹${surplus.toLocaleString()}) remains after all deductions` },

  DATA.creditScore < 600
    ? { level:"red",    icon:"🚨", title:"Credit score is critically low",           detail:`Score of ${DATA.creditScore} is below the 600 minimum threshold` }
    : DATA.creditScore < 700
    ? { level:"yellow", icon:"⚠️", title:"Credit score is below optimal range",      detail:`Score of ${DATA.creditScore} is below the preferred 700 mark` }
    : { level:"green",  icon:"✅", title:"Credit score meets requirements",           detail:`Score of ${DATA.creditScore} exceeds the minimum threshold of 700` },
];

const ALERT_STYLE: Record<AlertLevel, { bg: string; border: string; icon_bg: string; title: string; badge_bg: string; badge_border: string; badge_text: string; label: string }> = {
  green:  { bg:"rgba(0,255,179,.05)",   border:"rgba(0,255,179,.2)",   icon_bg:"rgba(0,255,179,.12)",  title:"#00FFB3", badge_bg:"rgba(0,255,179,.1)",   badge_border:"rgba(0,255,179,.3)",   badge_text:"#00FFB3", label:"Clear"   },
  yellow: { bg:"rgba(255,184,0,.05)",   border:"rgba(255,184,0,.22)",  icon_bg:"rgba(255,184,0,.12)",  title:"#FFB800", badge_bg:"rgba(255,184,0,.1)",    badge_border:"rgba(255,184,0,.3)",   badge_text:"#FFB800", label:"Caution" },
  red:    { bg:"rgba(255,107,91,.06)",  border:"rgba(255,107,91,.25)", icon_bg:"rgba(255,107,91,.14)", title:"#FF6B5B", badge_bg:"rgba(255,107,91,.1)",   badge_border:"rgba(255,107,91,.3)",  badge_text:"#FF6B5B", label:"Risk"    },
};

const DC: Record<string,string> = { Approved:"#00FFB3", Review:"#FFB800", Rejected:"#FF6B5B" };

function AnimBar({ target, color, delay=0 }: { target:number; color:string; delay?:number }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(target), delay); return () => clearTimeout(t); }, [target, delay]);
  return (
    <div style={{ height:"100%", width:`${w}%`, background:`linear-gradient(90deg,${color}70,${color})`, borderRadius:"inherit", boxShadow:`0 0 10px ${color}50`, transition:"width 1.2s cubic-bezier(.16,1,.3,1)" }}/>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DecisionAnalysis() {
  const [mouse, setMouse]       = useState({ x:-100, y:-100 });
  const [visible, setVisible]   = useState(false);

  useEffect(() => {
    window.addEventListener("mousemove", e => setMouse({ x:e.clientX, y:e.clientY }));
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const decColor = DC[DATA.decision];

  const summaryItems = [
    { label:"Monthly Income",    value:`₹${DATA.monthlyIncome.toLocaleString()}`,    sub:"Gross monthly",         color:"#00FFB3", icon:"💰" },
    { label:"Monthly Expenses",  value:`₹${DATA.monthlyExpenses.toLocaleString()}`,  sub:`${expPct}% of income`,  color:"#FFB800", icon:"🧾" },
    { label:"Proposed EMI",      value:`₹${DATA.emi.toLocaleString()}`,              sub:`${emiPct}% of income`,  color:"#FF6BFF", icon:"🏦" },
    { label:"Monthly Surplus",   value:`₹${surplus.toLocaleString()}`,               sub:`${surplusPct}% remaining`, color: surplus>0?"#00D4FF":"#FF6B5B", icon:"📊" },
    { label:"Debt-to-Income",    value:`${DATA.dti}%`,                               sub: DATA.dti<=35?"Within limit":"Exceeds limit", color:DATA.dti>50?"#FF6B5B":DATA.dti>35?"#FFB800":"#00FFB3", icon:"⚖️" },
    { label:"Credit Utilization",value:`${DATA.creditUtilization}%`,                sub: DATA.creditUtilization<=30?"Healthy":"Above ideal", color:DATA.creditUtilization>50?"#FF6B5B":DATA.creditUtilization>30?"#FFB800":"#00FFB3", icon:"💳" },
  ];

  const obligations = [
    { label:"Monthly Income",    value:DATA.monthlyIncome,    pct:100,         color:"#00FFB3", desc:"Total gross income" },
    { label:"Living Expenses",   value:DATA.monthlyExpenses,  pct:expPct,      color:"#FFB800", desc:`${expPct}% of income` },
    { label:"Proposed EMI",      value:DATA.emi,              pct:emiPct,      color:"#FF6BFF", desc:`${emiPct}% of income` },
    { label:"Monthly Surplus",   value:surplus,               pct:surplusPct,  color: surplus>0?"#00D4FF":"#FF6B5B", desc:`${surplusPct}% remaining` },
  ];

  const thresholds = [
    { label:"Credit Score",       actual:`${DATA.creditScore}`,      benchmark:"≥ 700",   pass: DATA.creditScore>=700,      color:"#FF6BFF" },
    { label:"DTI Ratio",          actual:`${DATA.dti}%`,             benchmark:"≤ 35%",   pass: DATA.dti<=35,               color:"#FFB800" },
    { label:"Loan-to-Income",     actual:`${DATA.loanToIncome}×`,    benchmark:"≤ 5×",    pass: DATA.loanToIncome<=5,       color:"#00D4FF" },
    { label:"Credit Utilization", actual:`${DATA.creditUtilization}%`,benchmark:"≤ 30%",  pass: DATA.creditUtilization<=30, color:"#00FFB3" },
    { label:"Monthly Surplus",    actual:`₹${surplus.toLocaleString()}`, benchmark:"> ₹0", pass: surplus>0,                  color:"#A855F7" },
  ];

  if (!visible) return null;

  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", background:"#050508", color:"#F0EEFF", minHeight:"100vh", cursor:"none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:linear-gradient(#FF6BFF,#00D4FF);border-radius:2px;}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scan{0%{transform:translateX(-100%)}100%{transform:translateX(500%)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.12}}
        @keyframes orbF{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-28px)}}
        @keyframes countUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .mono{font-family:'Space Mono',monospace}
        .fu{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) both}
        .d1{animation-delay:.06s}.d2{animation-delay:.12s}.d3{animation-delay:.18s}
        .d4{animation-delay:.24s}.d5{animation-delay:.30s}.d6{animation-delay:.36s}
        .card{background:rgba(10,9,18,.82);border:1px solid rgba(255,255,255,.07);border-radius:18px;backdrop-filter:blur(22px);overflow:hidden;position:relative}
        .metric-card{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:20px 22px;position:relative;overflow:hidden;transition:all .3s;cursor:none}
        .metric-card:hover{transform:translateY(-3px);border-color:rgba(255,107,255,.2);box-shadow:0 16px 40px rgba(255,107,255,.07)}
        .btn-ghost{display:flex;align-items:center;gap:7px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:9px 18px;color:rgba(240,238,255,.6);font-family:'Outfit',sans-serif;font-weight:700;font-size:13px;cursor:none;transition:all .25s}
        .btn-ghost:hover{border-color:rgba(255,107,255,.3);color:#F0EEFF}
        .chip{display:inline-flex;align-items:center;gap:6px;border-radius:100px;padding:5px 14px;font-family:'Space Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.08em}
        .section-title{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(240,238,255,.38);font-family:'Space Mono',monospace;margin-bottom:18px;display:flex;align-items:center;gap:8px}
        .section-title::before{content:'';display:inline-block;width:3px;height:14px;border-radius:2px;background:currentColor;opacity:.8}
        .threshold-row{display:grid;grid-template-columns:1fr 80px 80px 80px;gap:0;align-items:center;padding:13px 18px;border-radius:10px;transition:background .2s;margin-bottom:6px}
        .threshold-row:hover{background:rgba(255,107,255,.04)}
      `}</style>

      {/* Cursor */}
      <div style={{ position:"fixed", zIndex:9999, pointerEvents:"none", left:mouse.x-8, top:mouse.y-8, width:16, height:16, borderRadius:"50%", background:"radial-gradient(circle,#FF6BFF,#00D4FF)", boxShadow:"0 0 20px 6px rgba(255,107,255,.55)", mixBlendMode:"screen" }}/>
      <div style={{ position:"fixed", zIndex:9998, pointerEvents:"none", left:mouse.x-28, top:mouse.y-28, width:56, height:56, borderRadius:"50%", border:"1px solid rgba(255,107,255,.22)", transition:"left .14s ease,top .14s ease" }}/>

      {/* BG */}
      <div style={{ position:"fixed", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,107,255,.08),transparent 70%)", top:"-8%", right:"8%", animation:"orbF 14s ease-in-out infinite", pointerEvents:"none", zIndex:0 }}/>
      <div style={{ position:"fixed", width:380, height:380, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,212,255,.06),transparent 70%)", bottom:"5%", left:"3%", animation:"orbF 11s ease-in-out infinite reverse", pointerEvents:"none", zIndex:0 }}/>
      <div style={{ position:"fixed", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(168,85,247,.06),transparent 70%)", top:"50%", left:"35%", animation:"orbF 16s ease-in-out infinite", pointerEvents:"none", zIndex:0 }}/>
      <div style={{ position:"fixed", inset:0, backgroundImage:"linear-gradient(rgba(255,107,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,255,.025) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none", zIndex:0 }}/>

      {/* ── NAV ── */}
      <nav style={{ position:"sticky", top:0, zIndex:50, height:62, background:"rgba(5,5,8,.9)", backdropFilter:"blur(24px)", borderBottom:"1px solid rgba(255,255,255,.05)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 40px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ position:"relative", width:32, height:32 }}>
              <div style={{ position:"absolute", inset:0, borderRadius:8, background:"linear-gradient(135deg,#FF6BFF,#00D4FF)", padding:1.5 }}>
                <div style={{ width:"100%", height:"100%", background:"#080810", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 1.5L15.5 5V9C15.5 13 12.5 16.5 9 17.5C5.5 16.5 2.5 13 2.5 9V5L9 1.5Z" fill="url(#dg)"/><defs><linearGradient id="dg" x1="2.5" y1="1.5" x2="15.5" y2="17.5" gradientUnits="userSpaceOnUse"><stop stopColor="#FF6BFF"/><stop offset="1" stopColor="#00D4FF"/></linearGradient></defs></svg>
                </div>
              </div>
            </div>
            <span style={{ fontWeight:900, fontSize:17, letterSpacing:"-0.03em" }}>Finn<span style={{ background:"linear-gradient(135deg,#FF6BFF,#A855F7,#00D4FF,#00FFB3)", backgroundSize:"250% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmer 5s linear infinite" }}>tel</span></span>
          </div>
          <div style={{ width:1, height:22, background:"rgba(255,255,255,.08)" }}/>
          <div>
            <div style={{ fontSize:14, fontWeight:800, letterSpacing:"-0.01em" }}>Decision Analysis</div>
            <div className="mono" style={{ fontSize:10, color:"rgba(240,238,255,.32)", letterSpacing:".06em" }}>{DATA.id} · {DATA.name}</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {/* Decision badge */}
          <div className="chip" style={{ background:`${decColor}12`, border:`1px solid ${decColor}30`, color:decColor }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:decColor, boxShadow:`0 0 8px ${decColor}`, animation:"blink 1.4s infinite" }}/>
            {DATA.decision.toUpperCase()}
          </div>
          <button className="btn-ghost">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
        </div>
      </nav>

      <main style={{ maxWidth:1200, margin:"0 auto", padding:"36px 40px", position:"relative", zIndex:1 }}>

        {/* ── APPLICANT STRIP ── */}
        <div className="fu d1 card" style={{ padding:"20px 28px", marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${decColor}80,transparent)`, animation:"scan 4s ease-in-out infinite", pointerEvents:"none" }}/>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:52, height:52, borderRadius:"50%", background:`linear-gradient(135deg,${decColor}30,rgba(0,212,255,.2))`, border:`1.5px solid ${decColor}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:900 }}>
              {DATA.avatar}
            </div>
            <div>
              <div style={{ fontSize:18, fontWeight:900, letterSpacing:"-0.02em", marginBottom:4 }}>{DATA.name}</div>
              <div style={{ display:"flex", gap:14 }}>
                {[DATA.id, DATA.loanType, `Applied: ${DATA.appliedDate}`].map(v => (
                  <span key={v} className="mono" style={{ fontSize:10, color:"rgba(240,238,255,.35)", letterSpacing:".06em" }}>{v}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:24 }}>
            {[
              { label:"Loan Amount",    value:`₹${(DATA.loanAmount/100000).toFixed(1)}L`,   color:"#F0EEFF" },
              { label:"Interest Rate",  value:`${DATA.interestRate}%`,                       color:"#FFB800" },
              { label:"Tenure",         value:`${DATA.tenure} months`,                       color:"#F0EEFF" },
              { label:"Decision",       value:DATA.decision,                                 color:decColor },
            ].map(x => (
              <div key={x.label} style={{ textAlign:"right" }}>
                <div style={{ fontSize:10, color:"rgba(240,238,255,.35)", fontWeight:700, letterSpacing:".06em", marginBottom:4, textTransform:"uppercase" }}>{x.label}</div>
                <div style={{ fontSize:16, fontWeight:900, color:x.color }}>{x.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 1 — RISK ALERTS
        ══════════════════════════════════════════════ */}
        <div className="fu d2" style={{ marginBottom:24 }}>
          <div className="section-title" style={{ color:"rgba(240,238,255,.38)", marginBottom:14 }}>Risk Alerts</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {ALERTS.map((a, i) => {
              const s = ALERT_STYLE[a.level];
              return (
                <div key={i} style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:14, padding:"16px 18px", display:"flex", gap:14, alignItems:"flex-start", transition:"transform .25s", cursor:"none" }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform="translateY(-2px)"}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform="translateY(0)"}>
                  <div style={{ width:36, height:36, borderRadius:10, background:s.icon_bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                    {a.icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:5 }}>
                      <div style={{ fontSize:13, fontWeight:800, color:s.title, lineHeight:1.3, paddingRight:8 }}>{a.title}</div>
                      <span className="chip" style={{ background:s.badge_bg, border:`1px solid ${s.badge_border}`, color:s.badge_text, fontSize:9, padding:"3px 9px", flexShrink:0 }}>
                        {s.label}
                      </span>
                    </div>
                    <div style={{ fontSize:12, color:"rgba(240,238,255,.5)", lineHeight:1.6, fontWeight:500 }}>{a.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 2 — FINANCIAL SUMMARY
        ══════════════════════════════════════════════ */}
        <div className="fu d3" style={{ marginBottom:24 }}>
          <div className="section-title" style={{ color:"rgba(240,238,255,.38)", marginBottom:14 }}>Financial Summary</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:12 }}>
            {summaryItems.map((c, i) => (
              <div key={c.label} className="metric-card"
                style={{ borderColor:`${c.color}18` }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor=`${c.color}35`; el.style.boxShadow=`0 16px 40px ${c.color}10`; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor=`${c.color}18`; el.style.boxShadow="none"; }}>
                {/* top glow */}
                <div style={{ position:"absolute", top:-24, right:-24, width:80, height:80, borderRadius:"50%", background:`radial-gradient(circle,${c.color}15,transparent)`, pointerEvents:"none" }}/>
                <div style={{ fontSize:20, marginBottom:12 }}>{c.icon}</div>
                <div style={{ fontSize:10, fontWeight:700, color:"rgba(240,238,255,.38)", letterSpacing:".08em", textTransform:"uppercase", marginBottom:6 }}>{c.label}</div>
                <div style={{ fontSize:22, fontWeight:900, color:c.color, letterSpacing:"-0.02em", lineHeight:1, marginBottom:5 }}>
                  {c.value}
                </div>
                <div style={{ fontSize:11, color:"rgba(240,238,255,.38)", fontWeight:600 }}>{c.sub}</div>
                {/* Bottom accent line */}
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${c.color}50,transparent)` }}/>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 3 — INCOME VS OBLIGATIONS VISUALIZATION
        ══════════════════════════════════════════════ */}
        <div className="fu d4 card" style={{ padding:"28px 32px", marginBottom:24 }}>
          <div className="section-title" style={{ color:"rgba(240,238,255,.38)" }}>Income vs Obligations</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:40, alignItems:"center" }}>

            {/* Bars */}
            <div>
              {obligations.map((o, i) => (
                <div key={o.label} style={{ marginBottom:22 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:9 }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:800, color:"rgba(240,238,255,.85)", marginBottom:2 }}>{o.label}</div>
                      <div style={{ fontSize:11, color:"rgba(240,238,255,.4)", fontWeight:600 }}>{o.desc}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:18, fontWeight:900, color:o.color, letterSpacing:"-0.02em" }}>₹{o.value.toLocaleString()}</div>
                      <div className="mono" style={{ fontSize:10, color:"rgba(240,238,255,.35)" }}>{o.pct}% of income</div>
                    </div>
                  </div>
                  {/* Track */}
                  <div style={{ height:10, background:"rgba(255,255,255,.05)", borderRadius:5, overflow:"hidden" }}>
                    <AnimBar target={o.pct} color={o.color} delay={400 + i * 120}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Stacked visual + legend */}
            <div>
              {/* Stacked bar */}
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:12, fontWeight:700, color:"rgba(240,238,255,.4)", marginBottom:10, letterSpacing:".06em", textTransform:"uppercase", fontFamily:"'Space Mono',monospace" }}>Income Allocation</div>
                <div style={{ display:"flex", height:48, borderRadius:10, overflow:"hidden", gap:2 }}>
                  {[
                    { pct:expPct,      color:"#FFB800", label:"Expenses" },
                    { pct:emiPct,      color:"#FF6BFF", label:"EMI" },
                    { pct:surplusPct,  color: surplus>0?"#00D4FF":"#FF6B5B", label:"Surplus" },
                  ].map((seg, i) => (
                    <div key={i} style={{ flex:seg.pct, background:`linear-gradient(135deg,${seg.color}80,${seg.color})`, display:"flex", alignItems:"center", justifyContent:"center", minWidth:seg.pct<8?0:undefined, transition:"flex 1.2s cubic-bezier(.16,1,.3,1)" }}>
                      {seg.pct >= 10 && <span style={{ fontSize:11, fontWeight:900, color:"#050508", letterSpacing:".04em" }}>{seg.pct}%</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                {[
                  { color:"#00FFB3", label:"Total Income",   value:`₹${DATA.monthlyIncome.toLocaleString()}` },
                  { color:"#FFB800", label:"Expenses",        value:`₹${DATA.monthlyExpenses.toLocaleString()} (${expPct}%)` },
                  { color:"#FF6BFF", label:"EMI",             value:`₹${DATA.emi.toLocaleString()} (${emiPct}%)` },
                  { color: surplus>0?"#00D4FF":"#FF6B5B", label:"Surplus", value:`₹${surplus.toLocaleString()} (${surplusPct}%)` },
                ].map(l => (
                  <div key={l.label} style={{ display:"flex", alignItems:"center", gap:9, padding:"10px 14px", background:"rgba(255,255,255,.025)", borderRadius:10, border:"1px solid rgba(255,255,255,.05)" }}>
                    <div style={{ width:10, height:10, borderRadius:3, background:l.color, boxShadow:`0 0 8px ${l.color}60`, flexShrink:0 }}/>
                    <div>
                      <div style={{ fontSize:11, color:"rgba(240,238,255,.45)", fontWeight:700 }}>{l.label}</div>
                      <div style={{ fontSize:13, fontWeight:800, color:l.color }}>{l.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Surplus health indicator */}
              <div style={{ padding:"14px 18px", background: surplus>0?"rgba(255,107,255,.06)":"rgba(255,107,91,.07)", border:`1px solid ${surplus>0?"rgba(255,107,255,.2)":"rgba(255,107,91,.25)"}`, borderRadius:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:18 }}>{surplus>0?"💡":"⚠️"}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:800, color: surplus>0?"#FF6BFF":"#FF6B5B", marginBottom:3 }}>
                      {surplus>0 ? "Repayment capacity looks healthy" : "Insufficient surplus for EMI"}
                    </div>
                    <div style={{ fontSize:11, color:"rgba(240,238,255,.45)", lineHeight:1.6 }}>
                      {surplus>0
                        ? `After all deductions, ₹${surplus.toLocaleString()}/mo remains — providing a comfortable repayment buffer.`
                        : "Monthly obligations exceed income. Loan repayment is at high risk of default."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 4 — FINANCIAL THRESHOLDS
        ══════════════════════════════════════════════ */}
        <div className="fu d5 card" style={{ padding:"28px 32px", marginBottom:24 }}>
          <div className="section-title" style={{ color:"rgba(240,238,255,.38)" }}>Key Financial Thresholds</div>
          {/* Header */}
          <div className="threshold-row" style={{ padding:"8px 18px", marginBottom:4 }}>
            {["Parameter","Applicant Value","Benchmark","Status"].map(h => (
              <span key={h} className="mono" style={{ fontSize:9, color:"rgba(240,238,255,.28)", letterSpacing:".12em", textTransform:"uppercase" }}>{h}</span>
            ))}
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,.05)", marginBottom:10 }}/>
          {thresholds.map((t, i) => (
            <div key={t.label} className="threshold-row">
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:8, height:8, borderRadius:2, background:t.color, boxShadow:`0 0 8px ${t.color}70` }}/>
                <span style={{ fontSize:14, fontWeight:700 }}>{t.label}</span>
              </div>
              <span style={{ fontSize:16, fontWeight:900, color:t.color }}>{t.actual}</span>
              <span className="mono" style={{ fontSize:12, color:"rgba(240,238,255,.4)" }}>{t.benchmark}</span>
              <div>
                <span className="chip" style={{
                  background: t.pass?"rgba(0,255,179,.08)":"rgba(255,107,91,.08)",
                  border:`1px solid ${t.pass?"rgba(0,255,179,.25)":"rgba(255,107,91,.25)"}`,
                  color: t.pass?"#00FFB3":"#FF6B5B",
                  fontSize:10
                }}>
                  {t.pass ? "✓  Passed" : "✕  Failed"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 5 — DECISION TRANSPARENCY
        ══════════════════════════════════════════════ */}
        <div className="fu d6">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

            {/* Verdict card */}
            <div className="card" style={{ padding:"28px 32px", background:`linear-gradient(135deg,${decColor}09,rgba(0,212,255,.05))`, borderColor:`${decColor}25`, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${decColor},transparent)`, animation:"scan 3.5s ease-in-out infinite", pointerEvents:"none" }}/>
              <div style={{ position:"absolute", top:-50, right:-50, width:160, height:160, borderRadius:"50%", background:`radial-gradient(circle,${decColor}12,transparent)`, pointerEvents:"none" }}/>
              <div className="mono" style={{ fontSize:10, color:"rgba(240,238,255,.38)", letterSpacing:".14em", marginBottom:14 }}>FINAL DECISION</div>
              <div style={{ fontSize:38, fontWeight:900, color:decColor, letterSpacing:"-0.03em", textShadow:`0 0 30px ${decColor}50`, marginBottom:10 }}>
                {DATA.decision==="Approved"?"✅":DATA.decision==="Review"?"⚠️":"❌"} {DATA.decision}
              </div>
              <div style={{ fontSize:14, color:"rgba(240,238,255,.55)", lineHeight:1.75, marginBottom:18 }}>
                {DATA.decision==="Approved"
                  ? `${DATA.name}'s application for ₹${(DATA.loanAmount/100000).toFixed(1)}L has been approved. All key financial indicators are within acceptable limits and the repayment capacity is adequate.`
                  : DATA.decision==="Review"
                  ? `${DATA.name}'s application requires manual review. One or more financial parameters need further verification before a decision can be issued.`
                  : `${DATA.name}'s application has been declined. One or more financial parameters exceed the acceptable risk thresholds for this loan amount.`
                }
              </div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {[
                  { label:"Application ID", value:DATA.id },
                  { label:"Loan Type",      value:DATA.loanType },
                  { label:"Decision Date",  value:DATA.appliedDate },
                ].map(x => (
                  <div key={x.label} style={{ padding:"7px 14px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)", borderRadius:8 }}>
                    <div style={{ fontSize:10, color:"rgba(240,238,255,.35)", fontWeight:700, marginBottom:2 }}>{x.label}</div>
                    <div style={{ fontSize:12, fontWeight:800 }}>{x.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transparency disclaimer */}
            <div className="card" style={{ padding:"28px 32px" }}>
              <div className="mono" style={{ fontSize:10, color:"rgba(240,238,255,.38)", letterSpacing:".14em", marginBottom:18 }}>DECISION TRANSPARENCY</div>

              {/* Key statement */}
              <div style={{ padding:"18px 20px", background:"linear-gradient(135deg,rgba(255,107,255,.07),rgba(168,85,247,.05))", border:"1px solid rgba(255,107,255,.2)", borderRadius:14, marginBottom:18 }}>
                <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <span style={{ fontSize:22, flexShrink:0 }}>⚖️</span>
                  <p style={{ fontSize:14, color:"rgba(240,238,255,.75)", lineHeight:1.75, fontWeight:500 }}>
                    This decision is based on <strong style={{ background:"linear-gradient(135deg,#FF6BFF,#00D4FF)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>predefined financial rules and risk thresholds</strong>. No subjective judgment or manual override has been applied. The evaluation is consistent, transparent, and applied uniformly to all applications.
                  </p>
                </div>
              </div>

              {/* What was evaluated */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:"rgba(240,238,255,.45)", letterSpacing:".06em", textTransform:"uppercase", marginBottom:12 }}>What was evaluated</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[
                    { icon:"💳", label:"Credit score & history" },
                    { icon:"💰", label:"Income & repayment ability" },
                    { icon:"⚖️", label:"Debt-to-income ratio" },
                    { icon:"📊", label:"Credit utilization level" },
                    { icon:"🏦", label:"Loan-to-income ratio" },
                    { icon:"📈", label:"Monthly surplus capacity" },
                  ].map(x => (
                    <div key={x.label} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,107,255,.08)", borderRadius:9 }}>
                      <span style={{ fontSize:14 }}>{x.icon}</span>
                      <span style={{ fontSize:12, color:"rgba(240,238,255,.6)", fontWeight:600 }}>{x.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div style={{ padding:"12px 16px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.06)", borderRadius:10 }}>
                <p style={{ fontSize:11, color:"rgba(240,238,255,.38)", lineHeight:1.7 }}>
                  For queries or appeals, applicants may contact the Finntel credit review team within 30 days of this decision. All financial data submitted is treated as confidential under applicable data protection regulations.
                </p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}