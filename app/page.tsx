"use client";
import { useState, useEffect, useRef } from "react";

const stats = [
  { value: "98.4%", label: "Approval Accuracy" },
  { value: "<2s", label: "Decision Time" },
  { value: "500K+", label: "Loans Assessed" },
  { value: "3-Tier", label: "Risk Classification" },
];

const features = [
  {
    icon: "🛡",
    title: "Risk Classification",
    desc: "Every application scored into Low, Medium, or High risk tiers using multi-variable financial modeling — not black-box guesswork.",
    tag: "Core Engine",
    accent: "#FF6BFF",
  },
  {
    icon: "📋",
    title: "Transparent Reasoning",
    desc: "Finntel generates human-readable explanations for every decision. Applicants know exactly which factors drove approval or rejection.",
    tag: "Explainability",
    accent: "#00D4FF",
  },
  {
    icon: "⚡",
    title: "Real-Time Decisions",
    desc: "Submit financial data and receive an approve/reject verdict with full risk breakdown in under 2 seconds — built for modern lending pipelines.",
    tag: "Speed",
    accent: "#FFB800",
  },
  {
    icon: "📈",
    title: "Financial Data Analysis",
    desc: "Processes income, credit history, debt ratios, employment stability, and behavioral signals to compute a composite risk score.",
    tag: "Intelligence",
    accent: "#00FFB3",
  },
];

const steps = [
  { num: "01", title: "Submit Application", desc: "Applicant provides financial profile: income, liabilities, credit score, employment status, and loan purpose.", color: "#00D4FF" },
  { num: "02", title: "Risk Evaluation", desc: "Finntel's engine computes a composite risk score across multiple weighted financial factors.", color: "#FF6BFF" },
  { num: "03", title: "Tier Classification", desc: "The score maps to a risk tier: Low, Medium, or High — each with defined lending parameters.", color: "#FFB800" },
  { num: "04", title: "Decision + Reasoning", desc: "A final Approve or Reject verdict is issued alongside a full breakdown of every reasoning factor.", color: "#00FFB3" },
];

export default function FinntelLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [barWidths, setBarWidths] = useState([0, 0, 0, 0]);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveStep((s) => (s + 1) % steps.length), 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const targets = [92, 78, 65, 88];
    const timers = targets.map((target, i) =>
      setTimeout(() => {
        setBarWidths((prev) => {
          const next = [...prev];
          next[i] = target;
          return next;
        });
      }, 900 + i * 180)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Outfit', sans-serif",
        background: "#050508",
        color: "#F0EEFF",
        minHeight: "100vh",
        overflowX: "hidden",
        cursor: "none",
      }}
    >
      {/* Custom cursor */}
      <div
        style={{
          position: "fixed",
          zIndex: 9999,
          pointerEvents: "none",
          left: mousePos.x - 8,
          top: mousePos.y - 8,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "radial-gradient(circle, #FF6BFF, #00D4FF)",
          boxShadow: "0 0 20px 6px rgba(255,107,255,0.6)",
          mixBlendMode: "screen",
          transition: "transform 0.08s ease",
        }}
      />
      <div
        style={{
          position: "fixed",
          zIndex: 9998,
          pointerEvents: "none",
          left: mousePos.x - 28,
          top: mousePos.y - 28,
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "1px solid rgba(255,107,255,0.25)",
          transition: "left 0.15s ease, top 0.15s ease",
        }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #050508; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(#FF6BFF, #00D4FF); border-radius: 2px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(36px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spinReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -50px) scale(1.08); }
          66% { transform: translate(-25px, -20px) scale(0.96); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-50px, 30px) scale(0.92); }
          70% { transform: translate(20px, 50px) scale(1.06); }
        }
        @keyframes scanPulse {
          0% { transform: translateY(-200%); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(4000%); opacity: 0; }
        }
        @keyframes dotBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.15; }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(255,107,255,0.2), 0 0 0 1px rgba(255,107,255,0.3); }
          33%  { box-shadow: 0 0 30px rgba(0,212,255,0.2),   0 0 0 1px rgba(0,212,255,0.3); }
          66%  { box-shadow: 0 0 30px rgba(0,255,179,0.2),   0 0 0 1px rgba(0,255,179,0.3); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.06); }
        }

        .fade-up { animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
        .d1 { animation-delay: 0.1s; opacity: 0; }
        .d2 { animation-delay: 0.25s; opacity: 0; }
        .d3 { animation-delay: 0.42s; opacity: 0; }
        .d4 { animation-delay: 0.58s; opacity: 0; }
        .d5 { animation-delay: 0.72s; opacity: 0; }

        .gradient-text {
          background: linear-gradient(135deg, #FF6BFF 0%, #A855F7 25%, #00D4FF 60%, #00FFB3 100%);
          background-size: 250% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
        }

        .nav-glass {
          background: rgba(5,5,8,0.75);
          backdrop-filter: blur(28px);
          border-bottom: 1px solid rgba(255,107,255,0.1);
        }

        .cta-btn {
          position: relative;
          background: linear-gradient(135deg, #FF6BFF 0%, #A855F7 50%, #00D4FF 100%);
          background-size: 200% 200%;
          animation: gradientShift 4s ease infinite;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          cursor: none;
          transition: all 0.3s ease;
          overflow: hidden;
          letter-spacing: 0.01em;
        }
        .cta-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.15);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .cta-btn:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 20px 60px rgba(255,107,255,0.5), 0 0 40px rgba(168,85,247,0.4); }
        .cta-btn:hover::after { opacity: 1; }

        .outline-btn {
          background: transparent;
          color: #F0EEFF;
          border: 1px solid rgba(255,107,255,0.3);
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          cursor: none;
          transition: all 0.3s ease;
        }
        .outline-btn:hover {
          border-color: #FF6BFF;
          box-shadow: 0 0 30px rgba(255,107,255,0.3), inset 0 0 30px rgba(255,107,255,0.05);
          transform: translateY(-2px);
          color: #FF6BFF;
        }

        .feature-card {
          position: relative;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 22px;
          padding: 38px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          cursor: none;
        }
        .feature-card:hover { transform: translateY(-10px) scale(1.01); }

        .card-verdict { animation: borderGlow 5s ease infinite; }

        .mono { font-family: 'Space Mono', monospace; }

        .section-tag {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          background: linear-gradient(135deg, rgba(255,107,255,0.12), rgba(0,212,255,0.12));
          border: 1px solid rgba(255,107,255,0.2);
          padding: 6px 16px;
          border-radius: 100px;
          color: #FF6BFF;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .ring-spin-1 { animation: spinSlow 24s linear infinite; }
        .ring-spin-2 { animation: spinReverse 18s linear infinite; }

        .ticker-inner { display: inline-flex; animation: ticker 34s linear infinite; white-space: nowrap; }

        .grid-bg {
          background-image:
            linear-gradient(rgba(255,107,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,107,255,0.035) 1px, transparent 1px);
          background-size: 64px 64px;
        }
      `}</style>

      {/* NAV */}
      <nav
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 48px", height: 68 }}
        className={scrolled ? "nav-glass" : ""}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", width: 38, height: 38 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "linear-gradient(135deg, #FF6BFF, #00D4FF)", padding: 1.5 }}>
                <div style={{ width: "100%", height: "100%", background: "#080810", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L17 6V10C17 14.4 13.8 18.2 10 19.5C6.2 18.2 3 14.4 3 10V6L10 2Z" fill="url(#logo-g)" />
                    <defs>
                      <linearGradient id="logo-g" x1="3" y1="2" x2="17" y2="19.5" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FF6BFF" /><stop offset="1" stopColor="#00D4FF" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
            <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.03em" }}>
              Finn<span className="gradient-text">tel</span>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
            {["Product", "How it works", "API", "Pricing"].map((item) => (
              <a
                key={item} href="#"
                style={{ color: "rgba(240,238,255,0.4)", textDecoration: "none", fontSize: 14, fontWeight: 700, transition: "all 0.25s", cursor: "none" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#FF6BFF"; e.currentTarget.style.textShadow = "0 0 20px rgba(255,107,255,0.6)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(240,238,255,0.4)"; e.currentTarget.style.textShadow = "none"; }}
              >
                {item}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button className="outline-btn" style={{ padding: "9px 22px", fontSize: 13 }}>Log in</button>
            <button className="cta-btn" style={{ padding: "9px 22px", fontSize: 13 }}>Get started →</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="grid-bg"
        style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 68, overflow: "hidden" }}
      >
        {/* BG orbs */}
        <div style={{ position: "absolute", width: 720, height: 720, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,255,0.14) 0%, transparent 70%)", top: "-15%", left: "55%", animation: "orbFloat1 14s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)", bottom: "0%", left: "-5%", animation: "orbFloat2 11s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)", top: "35%", right: "2%", animation: "orbFloat1 16s ease-in-out infinite reverse", pointerEvents: "none" }} />

        {/* vertical accent line */}
        <div style={{ position: "absolute", top: 0, left: "44%", width: 1, height: "100%", background: "linear-gradient(180deg, transparent 0%, rgba(255,107,255,0.12) 30%, rgba(0,212,255,0.12) 70%, transparent 100%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 48px", position: "relative", zIndex: 2, width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>

            {/* LEFT */}
            <div>
              <div className="fade-up d1" style={{ marginBottom: 30 }}>
                <span className="section-tag">
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FFB3", display: "inline-block", animation: "dotBlink 1.4s infinite" }} />
                  AI-Powered Risk Engine
                </span>
              </div>

              <h1 className="fade-up d2" style={{ fontSize: "clamp(46px, 5.5vw, 74px)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: 28 }}>
                Risk-Based<br />
                <span className="gradient-text">Loan Approval</span><br />
                System
              </h1>

              <p className="fade-up d3" style={{ fontSize: 18, lineHeight: 1.82, color: "rgba(240,238,255,0.52)", maxWidth: 490, marginBottom: 46 }}>
                Finntel evaluates financial data, classifies risk tiers, and delivers transparent approve/reject decisions —{" "}
                <strong style={{ color: "#FF6BFF", fontWeight: 700 }}>with full reasoning every single time.</strong>
              </p>

              <div className="fade-up d4" style={{ display: "flex", gap: 14 }}>
                <button className="cta-btn" style={{ fontSize: 15, padding: "15px 38px" }}>Start Free Trial</button>
                <button className="outline-btn" style={{ fontSize: 15, padding: "15px 38px" }}>View API Docs</button>
              </div>

              {/* Stats */}
              <div
                className="fade-up d5"
                style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", marginTop: 60, paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                {stats.map((s, i) => (
                  <div key={s.label} style={{ padding: i === 0 ? "0 20px 0 0" : i === 3 ? "0 0 0 20px" : "0 20px", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                    <div style={{
                      fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em",
                      background: "linear-gradient(135deg, #FF6BFF, #A855F7, #00D4FF)",
                      backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                      animation: "shimmer 5s linear infinite"
                    }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "rgba(240,238,255,0.38)", marginTop: 4, fontWeight: 700, letterSpacing: "0.04em" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Decision Card */}
            <div className="fade-up d3" style={{ position: "relative" }}>
              {/* spinning rings */}
              <div className="ring-spin-1" style={{ position: "absolute", inset: -48, borderRadius: "50%", border: "1px solid rgba(255,107,255,0.07)", pointerEvents: "none" }} />
              <div className="ring-spin-2" style={{ position: "absolute", inset: -24, borderRadius: "50%", border: "1px dashed rgba(0,212,255,0.06)", pointerEvents: "none" }} />

              <div
                className="card-verdict"
                style={{
                  background: "rgba(12,10,20,0.85)",
                  border: "1px solid rgba(255,107,255,0.3)",
                  borderRadius: 24, padding: 32,
                  position: "relative", overflow: "hidden",
                  backdropFilter: "blur(24px)",
                }}
              >
                {/* inner top glow */}
                <div style={{ position: "absolute", top: -50, left: "50%", transform: "translateX(-50%)", width: 240, height: 120, borderRadius: "50%", background: "rgba(255,107,255,0.12)", filter: "blur(40px)", pointerEvents: "none" }} />

                {/* scan line */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent 0%, #FF6BFF 30%, #00D4FF 70%, transparent 100%)", animation: "scanPulse 4s ease-in-out infinite", pointerEvents: "none" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, position: "relative" }}>
                  <div>
                    <div className="mono" style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(240,238,255,0.28)", marginBottom: 6, textTransform: "uppercase" }}>Assessment ID</div>
                    <div className="mono" style={{ fontSize: 13, fontWeight: 700, background: "linear-gradient(135deg, #FF6BFF, #00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>#FNT-2024-004821</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(0,255,179,0.08)", border: "1px solid rgba(0,255,179,0.28)", borderRadius: 100, padding: "5px 14px" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FFB3", display: "inline-block", animation: "dotBlink 1.3s infinite", boxShadow: "0 0 8px #00FFB3" }} />
                    <span className="mono" style={{ fontSize: 10, color: "#00FFB3", letterSpacing: "0.1em", fontWeight: 700 }}>LOW RISK</span>
                  </div>
                </div>

                {/* Profile */}
                <div style={{ background: "rgba(255,107,255,0.04)", border: "1px solid rgba(255,107,255,0.1)", borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
                  <div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,0.28)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>Applicant Profile</div>
                  {[["Annual Income","₹ 18,40,000"],["Credit Score","784"],["Debt-to-Income","22.4%"],["Employment","4.2 yrs (Stable)"]].map(([k,v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                      <span style={{ color: "rgba(240,238,255,0.42)", fontWeight: 600 }}>{k}</span>
                      <span style={{ fontWeight: 800 }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Bars */}
                <div style={{ marginBottom: 20 }}>
                  <div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,0.28)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>Risk Factors</div>
                  {[
                    { label: "Credit History",    pct: barWidths[0], color: "#00FFB3" },
                    { label: "Income Stability",  pct: barWidths[1], color: "#00D4FF" },
                    { label: "Debt Ratio",         pct: barWidths[2], color: "#FFB800" },
                    { label: "Loan Purpose",       pct: barWidths[3], color: "#FF6BFF" },
                  ].map((item) => (
                    <div key={item.label} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                        <span style={{ color: "rgba(240,238,255,0.52)", fontWeight: 700 }}>{item.label}</span>
                        <span className="mono" style={{ color: item.color, fontWeight: 700, fontSize: 11 }}>{item.pct}%</span>
                      </div>
                      <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${item.pct}%`, background: `linear-gradient(90deg, ${item.color}80, ${item.color})`, borderRadius: 3, transition: "width 1.3s cubic-bezier(0.16,1,0.3,1)", boxShadow: `0 0 12px ${item.color}70` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reasoning */}
                <div style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.18)", borderRadius: 14, padding: "14px 18px", marginBottom: 20 }}>
                  <div className="mono" style={{ fontSize: 9, color: "#00D4FF", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Reasoning</div>
                  <p style={{ fontSize: 12, lineHeight: 1.85, color: "rgba(240,238,255,0.62)" }}>
                    Strong credit score (784) with stable long-term employment. DTI of 22.4% is within acceptable range. Loan purpose indicates productive use. Low default probability.
                  </p>
                </div>

                {/* Verdict */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(0,255,179,0.12), rgba(0,212,255,0.08))",
                  border: "1px solid rgba(0,255,179,0.3)",
                  borderRadius: 14, padding: "18px 22px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  boxShadow: "0 0 40px rgba(0,255,179,0.12), inset 0 0 30px rgba(0,255,179,0.04)"
                }}>
                  <div>
                    <div className="mono" style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(240,238,255,0.38)", textTransform: "uppercase", marginBottom: 7 }}>Final Verdict</div>
                    <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", color: "#00FFB3", textShadow: "0 0 24px rgba(0,255,179,0.6)" }}>✅ APPROVED</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="mono" style={{ fontSize: 9, color: "rgba(240,238,255,0.38)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Risk Score</div>
                    <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-0.03em", background: "linear-gradient(135deg, #00FFB3, #00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", textShadow: "none" }}>
                      91<span style={{ fontSize: 16, opacity: 0.5 }}>/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ background: "linear-gradient(90deg, #FF6BFF 0%, #A855F7 25%, #00D4FF 60%, #00FFB3 85%, #FF6BFF 100%)", backgroundSize: "300% 100%", animation: "gradientShift 5s ease infinite", padding: "1.5px 0" }}>
        <div style={{ background: "#07070E", padding: "13px 0", overflow: "hidden" }}>
          <div style={{ overflow: "hidden" }}>
            <div className="ticker-inner">
              {[...Array(2)].map((_, i) => (
                <span key={i} className="mono" style={{ fontSize: 11, letterSpacing: "0.12em" }}>
                  {["APPROVE / REJECT IN UNDER 2 SECONDS","TRANSPARENT REASONING ON EVERY DECISION","LOW · MEDIUM · HIGH RISK CLASSIFICATION","BUILT FOR MODERN LENDING PIPELINES","BANK-GRADE EXPLAINABILITY","REAL-TIME FINANCIAL RISK SCORING"].map((t) => (
                    <span key={t} style={{ marginRight: 56, background: "linear-gradient(135deg, #FF6BFF, #00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontWeight: 700 }}>◆ {t}</span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section style={{ padding: "130px 48px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <div style={{ marginBottom: 20 }}><span className="section-tag">What we do</span></div>
          <h2 style={{ fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05 }}>
            Not just a score.<br /><span className="gradient-text">An explanation.</span>
          </h2>
          <p style={{ color: "rgba(240,238,255,0.44)", fontSize: 17, marginTop: 18, maxWidth: 520, margin: "18px auto 0", lineHeight: 1.8 }}>
            Banks don't just say "rejected." They say why. Finntel brings that standard of transparency to every automated loan decision.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
          {features.map((f) => (
            <div
              key={f.title}
              className="feature-card"
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = `0 32px 64px ${f.accent}18, 0 0 0 1px ${f.accent}35`;
                el.style.background = `${f.accent}07`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "none";
                el.style.background = "rgba(255,255,255,0.02)";
              }}
            >
              {/* top corner glow */}
              <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${f.accent}18, transparent)`, pointerEvents: "none" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26 }}>
                <div style={{ width: 58, height: 58, borderRadius: 16, background: `${f.accent}14`, border: `1px solid ${f.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: `0 0 24px ${f.accent}20` }}>
                  {f.icon}
                </div>
                <span className="mono" style={{ fontSize: 9, color: f.accent, letterSpacing: "0.16em", background: `${f.accent}10`, border: `1px solid ${f.accent}25`, padding: "5px 12px", borderRadius: 100, textTransform: "uppercase" }}>
                  {f.tag}
                </span>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12, letterSpacing: "-0.025em" }}>{f.title}</h3>
              <p style={{ color: "rgba(240,238,255,0.48)", fontSize: 14, lineHeight: 1.82 }}>{f.desc}</p>
              <div style={{ marginTop: 26, height: 1, background: `linear-gradient(90deg, ${f.accent}50, transparent)` }} />
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "110px 48px", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(168,85,247,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 100, alignItems: "center" }}>
            <div>
              <div style={{ marginBottom: 22 }}><span className="section-tag">Process</span></div>
              <h2 style={{ fontSize: "clamp(32px, 3.5vw, 50px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 20 }}>
                How Finntel<br /><span className="gradient-text">makes decisions</span>
              </h2>
              <p style={{ color: "rgba(240,238,255,0.44)", lineHeight: 1.82, marginBottom: 44, fontSize: 15 }}>
                A four-stage pipeline from raw financial data to a fully reasoned, auditable credit decision.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {steps.map((step, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    style={{
                      display: "flex", alignItems: "center", gap: 16,
                      background: activeStep === i ? `${step.color}0E` : "transparent",
                      border: `1px solid ${activeStep === i ? step.color + "40" : "rgba(255,255,255,0.05)"}`,
                      borderRadius: 12, padding: "13px 20px",
                      cursor: "none", transition: "all 0.3s ease", textAlign: "left",
                      boxShadow: activeStep === i ? `0 0 24px ${step.color}14` : "none"
                    }}
                  >
                    <span className="mono" style={{ fontSize: 11, color: activeStep === i ? step.color : "rgba(240,238,255,0.22)", fontWeight: 700, minWidth: 28 }}>{step.num}</span>
                    <span style={{ fontWeight: 800, fontSize: 15, color: activeStep === i ? "#F0EEFF" : "rgba(240,238,255,0.45)" }}>{step.title}</span>
                    {activeStep === i && <span style={{ marginLeft: "auto", color: step.color, fontSize: 14 }}>→</span>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ position: "relative", minHeight: 340 }}>
              {steps.map((step, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute", inset: 0,
                    opacity: activeStep === i ? 1 : 0,
                    transform: activeStep === i ? "translateY(0) scale(1)" : "translateY(22px) scale(0.97)",
                    transition: "all 0.55s cubic-bezier(0.16,1,0.3,1)",
                    pointerEvents: activeStep === i ? "auto" : "none"
                  }}
                >
                  <div style={{
                    background: `${step.color}07`, border: `1px solid ${step.color}28`, borderRadius: 26, padding: 46, height: "100%",
                    boxShadow: `0 40px 80px ${step.color}10, 0 0 60px ${step.color}08, inset 0 1px 0 ${step.color}20`
                  }}>
                    <div className="mono" style={{ fontSize: 56, fontWeight: 700, color: step.color, opacity: 0.15, lineHeight: 1, marginBottom: 22 }}>{step.num}</div>
                    <h3 style={{ fontSize: 28, fontWeight: 900, marginBottom: 16, letterSpacing: "-0.03em", color: step.color, textShadow: `0 0 30px ${step.color}50` }}>{step.title}</h3>
                    <p style={{ color: "rgba(240,238,255,0.58)", lineHeight: 1.85, fontSize: 15 }}>{step.desc}</p>
                    <div style={{ marginTop: 34, display: "flex", gap: 6 }}>
                      {steps.map((s, j) => (
                        <div key={j} style={{ flex: 1, height: 3, background: j <= i ? `linear-gradient(90deg, ${step.color}, ${s.color})` : "rgba(255,255,255,0.07)", borderRadius: 2, transition: "background 0.5s ease", boxShadow: j <= i ? `0 0 10px ${step.color}50` : "none" }} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RISK TIERS */}
      <section style={{ padding: "130px 48px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <div style={{ marginBottom: 20 }}><span className="section-tag">Classification</span></div>
          <h2 style={{ fontSize: "clamp(32px, 3.5vw, 52px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05 }}>
            Three tiers.<br /><span className="gradient-text">Infinite clarity.</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {[
            { tier: "Low Risk", score: "75–100", color: "#00FFB3", outcome: "✅ Approved", desc: "Strong credit, stable income, healthy debt ratios. Standard terms with competitive interest rates." },
            { tier: "Medium Risk", score: "40–74", color: "#FFB800", outcome: "⚠️ Conditional", desc: "Mixed indicators. May require collateral, co-signer, or adjusted amount. Manual review triggered." },
            { tier: "High Risk", score: "0–39", color: "#FF6B5B", outcome: "❌ Rejected", desc: "Significant risk markers present. Declined with detailed reasoning for each disqualifying factor." },
          ].map((t) => (
            <div
              key={t.tier}
              style={{ position: "relative", background: `${t.color}06`, border: `1px solid ${t.color}22`, borderRadius: 22, padding: 38, overflow: "hidden", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)", cursor: "none" }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-10px)"; el.style.boxShadow = `0 36px 72px ${t.color}18, 0 0 0 1px ${t.color}40`; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}
            >
              <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${t.color}14, transparent)`, pointerEvents: "none" }} />
              <div className="mono" style={{ fontSize: 10, color: t.color, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 18, opacity: 0.65 }}>Score Range: {t.score}</div>
              <h3 style={{ fontSize: 27, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 14, color: t.color, textShadow: `0 0 30px ${t.color}45` }}>{t.tier}</h3>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>{t.outcome}</div>
              <p style={{ fontSize: 13, color: "rgba(240,238,255,0.52)", lineHeight: 1.85 }}>{t.desc}</p>
              <div style={{ marginTop: 26, height: 2, background: `linear-gradient(90deg, ${t.color}55, transparent)`, borderRadius: 1, boxShadow: `0 0 8px ${t.color}40` }} />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 48px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ position: "relative", borderRadius: 36, overflow: "hidden", padding: "88px 80px", textAlign: "center" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,107,255,0.1) 0%, rgba(168,85,247,0.08) 35%, rgba(0,212,255,0.09) 65%, rgba(0,255,179,0.1) 100%)" }} />
            <div style={{ position: "absolute", inset: 0, border: "1px solid rgba(255,107,255,0.18)", borderRadius: 36 }} />
            <div style={{ position: "absolute", inset: 0, border: "1px solid transparent", borderRadius: 36, background: "linear-gradient(#05050800, #05050800) padding-box, linear-gradient(135deg, rgba(255,107,255,0.35), rgba(0,212,255,0.35)) border-box" }} />
            <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 500, height: 220, borderRadius: "50%", background: "rgba(255,107,255,0.1)", filter: "blur(70px)", animation: "glowPulse 4s ease-in-out infinite", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -80, left: "15%", width: 360, height: 160, borderRadius: "50%", background: "rgba(0,212,255,0.08)", filter: "blur(60px)", animation: "glowPulse 5s ease-in-out infinite reverse", pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ marginBottom: 28 }}><span className="section-tag">Get started</span></div>
              <h2 style={{ fontSize: "clamp(34px, 4.5vw, 58px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.02, marginBottom: 20 }}>
                Build smarter<br /><span className="gradient-text">lending decisions</span>
              </h2>
              <p style={{ color: "rgba(240,238,255,0.48)", fontSize: 16, lineHeight: 1.82, marginBottom: 52, maxWidth: 520, margin: "0 auto 52px" }}>
                Integrate Finntel into your lending pipeline in under a day. Full API documentation, sandbox environment, and dedicated support included.
              </p>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="cta-btn" style={{ fontSize: 16, padding: "17px 48px" }}>Start for free →</button>
                <button className="outline-btn" style={{ fontSize: 16, padding: "17px 48px" }}>Schedule a demo</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "44px 48px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", width: 34, height: 34 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 9, background: "linear-gradient(135deg, #FF6BFF, #00D4FF)", padding: 1.5 }}>
                <div style={{ width: "100%", height: "100%", background: "#050508", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                    <path d="M8.5 1.5L15 5V9C15 13 12 16.5 8.5 17.5C5 16.5 2 13 2 9V5L8.5 1.5Z" fill="url(#fl2)" />
                    <defs><linearGradient id="fl2" x1="2" y1="1.5" x2="15" y2="17.5" gradientUnits="userSpaceOnUse"><stop stopColor="#FF6BFF"/><stop offset="1" stopColor="#00D4FF"/></linearGradient></defs>
                  </svg>
                </div>
              </div>
            </div>
            <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.03em" }}>Finn<span className="gradient-text">tel</span></span>
          </div>
          <p className="mono" style={{ fontSize: 11, color: "rgba(240,238,255,0.22)" }}>© 2026 Finntel Technologies · Risk-Based Loan Approval System</p>
          <div style={{ display: "flex", gap: 28 }}>
            {["Privacy","Terms","API","Contact"].map((l) => (
              <a key={l} href="#" style={{ color: "rgba(240,238,255,0.28)", fontSize: 13, textDecoration: "none", fontWeight: 700, transition: "color 0.2s", cursor: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FF6BFF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,238,255,0.28)")}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}