"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: loginEmail, password: loginPass }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Login failed"); setLoading(false); return; }
        router.push("/dashboard");
      } else {
        if (signupPass !== signupConfirm) { setError("Passwords don't match"); setLoading(false); return; }
        if (!agree) { setError("Please accept the terms"); setLoading(false); return; }
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPass }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Sign up failed"); setLoading(false); return; }
        router.push("/dashboard");
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const passStrength = (p: string) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength = passStrength(signupPass);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "#FF6B5B", "#FFB800", "#00D4FF", "#00FFB3"];

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: "#050508", color: "#F0EEFF", minHeight: "100vh", display: "flex", flexDirection: "column", cursor: "none", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(#FF6BFF, #00D4FF); border-radius: 2px; }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes orbFloat1 { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(40px,-50px) scale(1.08); } 66% { transform: translate(-25px,-20px) scale(0.96); } }
        @keyframes orbFloat2 { 0%,100% { transform: translate(0,0) scale(1); } 40% { transform: translate(-50px,30px) scale(0.92); } 70% { transform: translate(20px,50px) scale(1.06); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes dotBlink { 0%,100% { opacity:1; } 50% { opacity:0.1; } }
        @keyframes slideIn { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
        @keyframes scanPulse { 0% { transform:translateY(-200%); opacity:0; } 15% { opacity:1; } 85% { opacity:1; } 100% { transform:translateY(4000%); opacity:0; } }
        @keyframes checkBounce { 0% { transform:scale(0) rotate(-10deg); opacity:0; } 60% { transform:scale(1.2) rotate(4deg); opacity:1; } 100% { transform:scale(1) rotate(0deg); opacity:1; } }
        .gradient-text { background: linear-gradient(135deg, #FF6BFF 0%, #A855F7 30%, #00D4FF 65%, #00FFB3 100%); background-size: 250% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer 5s linear infinite; }
        .auth-input { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px 16px; color: #F0EEFF; font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 500; outline: none; transition: all 0.3s ease; cursor: none; }
        .auth-input::placeholder { color: rgba(240,238,255,0.28); }
        .auth-input:focus { border-color: rgba(255,107,255,0.45); background: rgba(255,107,255,0.04); box-shadow: 0 0 0 3px rgba(255,107,255,0.08), 0 0 20px rgba(255,107,255,0.1); }
        .cta-btn { width: 100%; background: linear-gradient(135deg, #FF6BFF 0%, #A855F7 50%, #00D4FF 100%); background-size: 200% 200%; animation: gradientShift 4s ease infinite; color: #fff; border: none; border-radius: 12px; padding: 15px; font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 16px; cursor: none; transition: all 0.3s ease; letter-spacing: 0.01em; position: relative; overflow: hidden; }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 20px 50px rgba(255,107,255,0.45), 0 0 30px rgba(168,85,247,0.35); }
        .cta-btn:disabled { opacity: 0.7; transform: none; }
        .google-btn { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.09); border-radius: 12px; padding: 14px 20px; color: rgba(240,238,255,0.75); font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 15px; cursor: none; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 12px; }
        .google-btn:hover { border-color: rgba(255,107,255,0.35); background: rgba(255,107,255,0.05); color: #F0EEFF; transform: translateY(-2px); box-shadow: 0 12px 36px rgba(255,107,255,0.14); }
        .tab-btn { flex: 1; padding: 11px; border: none; border-radius: 10px; font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 14px; cursor: none; transition: all 0.3s ease; letter-spacing: 0.01em; }
        .form-slide { animation: slideIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fade-up { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
        .d1 { animation-delay:0.05s; opacity:0; } .d2 { animation-delay:0.18s; opacity:0; } .d3 { animation-delay:0.3s; opacity:0; }
        .mono { font-family:'Space Mono', monospace; }
        .check-animate { animation: checkBounce 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .divider-line { flex:1; height:1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.09), transparent); }
      `}</style>

      {/* Custom cursor */}
      <div style={{ position:"fixed", zIndex:9999, pointerEvents:"none", left:mousePos.x-8, top:mousePos.y-8, width:16, height:16, borderRadius:"50%", background:"radial-gradient(circle, #FF6BFF, #00D4FF)", boxShadow:"0 0 20px 6px rgba(255,107,255,0.55)", mixBlendMode:"screen" }} />
      <div style={{ position:"fixed", zIndex:9998, pointerEvents:"none", left:mousePos.x-28, top:mousePos.y-28, width:56, height:56, borderRadius:"50%", border:"1px solid rgba(255,107,255,0.22)", transition:"left 0.14s ease, top 0.14s ease" }} />

      {/* BG orbs */}
      <div style={{ position:"fixed", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,107,255,0.1) 0%, transparent 70%)", top:"-10%", right:"5%", animation:"orbFloat1 14s ease-in-out infinite", pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:480, height:480, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)", bottom:"0%", left:"-5%", animation:"orbFloat2 11s ease-in-out infinite", pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", inset:0, backgroundImage:"linear-gradient(rgba(255,107,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,255,0.03) 1px, transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none", zIndex:0 }} />

      {/* NAV */}
      <nav style={{ position:"relative", zIndex:10, padding:"0 48px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
        <a href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", cursor:"none" }}>
          <div style={{ position:"relative", width:34, height:34 }}>
            <div style={{ position:"absolute", inset:0, borderRadius:9, background:"linear-gradient(135deg, #FF6BFF, #00D4FF)", padding:1.5 }}>
              <div style={{ width:"100%", height:"100%", background:"#080810", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5L15.5 5V9C15.5 13 12.5 16.5 9 17.5C5.5 16.5 2.5 13 2.5 9V5L9 1.5Z" fill="url(#nav-g)" /><defs><linearGradient id="nav-g" x1="2.5" y1="1.5" x2="15.5" y2="17.5" gradientUnits="userSpaceOnUse"><stop stopColor="#FF6BFF"/><stop offset="1" stopColor="#00D4FF"/></linearGradient></defs></svg>
              </div>
            </div>
          </div>
          <span style={{ fontWeight:900, fontSize:20, letterSpacing:"-0.03em", color:"#F0EEFF" }}>Finn<span className="gradient-text">tel</span></span>
        </a>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#00FFB3", display:"inline-block", animation:"dotBlink 1.4s infinite", boxShadow:"0 0 8px #00FFB3" }} />
          <span className="mono" style={{ fontSize:11, color:"rgba(240,238,255,0.35)", letterSpacing:"0.1em" }}>SECURE CONNECTION</span>
        </div>
      </nav>

      {/* MAIN */}
      <main style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px", position:"relative", zIndex:1 }}>
        <div style={{ width:"100%", maxWidth:440 }}>
          {/* Header */}
          <div className="fade-up d1" style={{ textAlign:"center", marginBottom:32 }}>
            <h1 style={{ fontSize:"clamp(30px,4vw,42px)", fontWeight:900, letterSpacing:"-0.04em", lineHeight:1.05, marginBottom:10 }}>
              {tab === "login" ? <>Welcome back to <span className="gradient-text">Finntel</span></> : <>Join <span className="gradient-text">Finntel</span></>}
            </h1>
            <p style={{ color:"rgba(240,238,255,0.42)", fontSize:15, lineHeight:1.7 }}>
              {tab === "login" ? "Sign in to access your risk assessment dashboard." : "Start evaluating loan risk with AI-powered decisions."}
            </p>
          </div>

          {/* Card */}
          <div className="fade-up d2" style={{ background:"rgba(12,10,20,0.85)", border:"1px solid rgba(255,107,255,0.16)", borderRadius:24, padding:34, backdropFilter:"blur(28px)", position:"relative", overflow:"hidden", boxShadow:"0 40px 80px rgba(255,107,255,0.07)" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg, transparent, #FF6BFF, #00D4FF, transparent)", animation:"scanPulse 4s ease-in-out infinite", pointerEvents:"none" }} />

            {/* TABS */}
            <div style={{ display:"flex", gap:5, background:"rgba(255,255,255,0.035)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:13, padding:5, marginBottom:28, position:"relative", zIndex:1 }}>
              {(["login","signup"] as const).map((t) => (
                <button key={t} className="tab-btn" onClick={() => { setTab(t); setError(""); }}
                  style={{ background: tab === t ? "linear-gradient(135deg, rgba(255,107,255,0.22), rgba(168,85,247,0.18), rgba(0,212,255,0.14))" : "transparent", color: tab === t ? "#F0EEFF" : "rgba(240,238,255,0.36)", border: tab === t ? "1px solid rgba(255,107,255,0.28)" : "1px solid transparent", boxShadow: tab === t ? "0 0 20px rgba(255,107,255,0.14)" : "none" }}>
                  {t === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* GOOGLE BTN */}
            <div style={{ position:"relative", zIndex:1, marginBottom:22 }}>
              <button className="google-btn">
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
            </div>

            {/* Divider */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22, position:"relative", zIndex:1 }}>
              <div className="divider-line" />
              <span className="mono" style={{ fontSize:10, color:"rgba(240,238,255,0.25)", letterSpacing:"0.12em", whiteSpace:"nowrap" }}>OR WITH EMAIL</span>
              <div className="divider-line" />
            </div>

            {/* Error Banner */}
            {error && (
              <div style={{ padding:"10px 14px", background:"rgba(255,107,91,0.1)", border:"1px solid rgba(255,107,91,0.3)", borderRadius:10, marginBottom:16, fontSize:13, color:"#FF6B5B", fontWeight:600, position:"relative", zIndex:1 }}>
                ⚠️ {error}
              </div>
            )}

            {/* FORM */}
            <div key={tab} className="form-slide" style={{ position:"relative", zIndex:1 }}>
              {tab === "login" ? (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(240,238,255,0.5)", marginBottom:8, letterSpacing:"0.06em" }}>EMAIL ADDRESS</label>
                    <input id="login-email" className="auth-input" type="email" placeholder="Enter your email address" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                  </div>
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                      <label style={{ fontSize:11, fontWeight:700, color:"rgba(240,238,255,0.5)", letterSpacing:"0.06em" }}>PASSWORD</label>
                      <a href="#" style={{ fontSize:12, color:"#FF6BFF", textDecoration:"none", fontWeight:700, cursor:"none" }}>Forgot password?</a>
                    </div>
                    <div style={{ position:"relative" }}>
                      <input id="login-password" className="auth-input" type={showPass ? "text" : "password"} placeholder="Enter your account password" style={{ paddingRight:48 }} value={loginPass} onChange={e => setLoginPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                      <button onClick={() => setShowPass(!showPass)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"rgba(240,238,255,0.32)", cursor:"none", padding:4, transition:"color 0.2s" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#FF6BFF")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,238,255,0.32)")}>
                        {showPass ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(240,238,255,0.5)", marginBottom:8, letterSpacing:"0.06em" }}>FULL NAME</label>
                    <input id="signup-name" className="auth-input" type="text" placeholder="Enter your full name" value={signupName} onChange={e => setSignupName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(240,238,255,0.5)", marginBottom:8, letterSpacing:"0.06em" }}>WORK EMAIL</label>
                    <input id="signup-email" className="auth-input" type="email" placeholder="Enter your work email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(240,238,255,0.5)", marginBottom:8, letterSpacing:"0.06em" }}>PASSWORD</label>
                    <div style={{ position:"relative" }}>
                      <input id="signup-password" className="auth-input" type={showPass ? "text" : "password"} placeholder="Create a strong password" style={{ paddingRight:48 }} value={signupPass} onChange={e => setSignupPass(e.target.value)} />
                      <button onClick={() => setShowPass(!showPass)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"rgba(240,238,255,0.32)", cursor:"none", padding:4 }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                    </div>
                    {signupPass && (
                      <div style={{ marginTop:10 }}>
                        <div style={{ display:"flex", gap:5, marginBottom:6 }}>
                          {[1,2,3,4].map(n => <div key={n} style={{ flex:1, height:3, borderRadius:2, background: n <= strength ? strengthColor[strength] : "rgba(255,255,255,0.07)", transition:"background 0.3s" }} />)}
                        </div>
                        <span className="mono" style={{ fontSize:10, color:strengthColor[strength], fontWeight:700, letterSpacing:"0.1em" }}>{strengthLabel[strength]}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(240,238,255,0.5)", marginBottom:8, letterSpacing:"0.06em" }}>CONFIRM PASSWORD</label>
                    <div style={{ position:"relative" }}>
                      <input id="signup-confirm" className="auth-input" type={showConfirm ? "text" : "password"} placeholder="Confirm your password" style={{ paddingRight:48, borderColor: signupConfirm && signupPass !== signupConfirm ? "rgba(255,107,107,0.4)" : undefined }} value={signupConfirm} onChange={e => setSignupConfirm(e.target.value)} />
                      {signupConfirm && signupPass === signupConfirm
                        ? <div className="check-animate" style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)" }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#00FFB3" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                        : <button onClick={() => setShowConfirm(!showConfirm)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"rgba(240,238,255,0.32)", cursor:"none", padding:4 }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                      }
                    </div>
                    {signupConfirm && signupPass !== signupConfirm && <p style={{ fontSize:12, color:"#FF6B5B", marginTop:6, fontWeight:600 }}>Passwords don&apos;t match</p>}
                  </div>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                    <div onClick={() => setAgree(!agree)} style={{ width:18, height:18, borderRadius:5, border:`1px solid ${agree ? "#FF6BFF" : "rgba(255,107,255,0.22)"}`, background: agree ? "rgba(255,107,255,0.14)" : "rgba(255,107,255,0.04)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"none", flexShrink:0, marginTop:2, transition:"all 0.25s" }}>
                      {agree && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="10 2 5 9 2 6" stroke="#FF6BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <span style={{ fontSize:13, color:"rgba(240,238,255,0.42)", lineHeight:1.65, fontWeight:500 }}>
                      I agree to the <a href="#" style={{ color:"#FF6BFF", textDecoration:"none", fontWeight:700, cursor:"none" }}>Terms of Service</a> and <a href="#" style={{ color:"#FF6BFF", textDecoration:"none", fontWeight:700, cursor:"none" }}>Privacy Policy</a>
                    </span>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button id="auth-submit" className="cta-btn" style={{ marginTop:22 }} onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                    <svg style={{ animation:"spin 0.8s linear infinite" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                    {tab === "login" ? "Signing in…" : "Creating account…"}
                  </span>
                ) : (tab === "login" ? "Sign In →" : "Create Account →")}
              </button>

              <p style={{ textAlign:"center", marginTop:18, fontSize:14, color:"rgba(240,238,255,0.38)" }}>
                {tab === "login" ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => { setTab(tab === "login" ? "signup" : "login"); setError(""); }} style={{ background:"none", border:"none", color:"#FF6BFF", fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:14, cursor:"none", padding:0 }}>
                  {tab === "login" ? "Sign up free" : "Sign in"}
                </button>
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="fade-up d3" style={{ display:"flex", justifyContent:"center", gap:28, marginTop:26, flexWrap:"wrap" }}>
            {[{ icon:"🔒", label:"256-bit SSL" }, { icon:"🛡", label:"SOC 2 Type II" }, { icon:"✅", label:"GDPR Compliant" }].map(b => (
              <div key={b.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:13 }}>{b.icon}</span>
                <span className="mono" style={{ fontSize:10, color:"rgba(240,238,255,0.25)", letterSpacing:"0.1em" }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <div style={{ position:"relative", zIndex:1, borderTop:"1px solid rgba(255,255,255,0.04)", padding:"16px 48px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <span className="mono" style={{ fontSize:11, color:"rgba(240,238,255,0.18)" }}>© 2026 Finntel Technologies</span>
        <div style={{ display:"flex", gap:24 }}>
          {["Privacy","Terms","Support"].map(l => (
            <a key={l} href="#" style={{ color:"rgba(240,238,255,0.22)", fontSize:12, textDecoration:"none", fontWeight:700, cursor:"none", transition:"color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "#FF6BFF")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,238,255,0.22)")}>{l}</a>
          ))}
        </div>
      </div>
    </div>
  );
}