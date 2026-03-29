"use client";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div
      style={{
        fontFamily: "'Outfit', sans-serif",
        background: "#050508",
        color: "#F0EEFF",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 0,
        textAlign: "center",
        padding: "0 24px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;700;900&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes shimmer { 0%{background-position:-400% center} 100%{background-position:400% center} }
      `}</style>

      {/* Glow */}
      <div style={{ position: "fixed", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,255,.12) 0%,transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />

      {/* 404 */}
      <div
        style={{
          fontSize: "clamp(96px, 20vw, 160px)",
          fontWeight: 900,
          lineHeight: 1,
          background: "linear-gradient(135deg,#FF6BFF 0%,#A855F7 40%,#00D4FF 70%,#00FFB3 100%)",
          backgroundSize: "300% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "shimmer 4s linear infinite, float 3s ease-in-out infinite",
          marginBottom: 24,
          letterSpacing: "-.04em",
        }}
      >
        404
      </div>

      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, letterSpacing: "-.02em" }}>
        Page not found
      </div>
      <div style={{ fontSize: 14, color: "rgba(240,238,255,0.4)", maxWidth: 340, lineHeight: 1.7, marginBottom: 36 }}>
        The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to access it.
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            padding: "12px 28px",
            background: "linear-gradient(135deg,#FF6BFF,#A855F7)",
            border: "none",
            borderRadius: 12,
            color: "#fff",
            fontFamily: "'Outfit',sans-serif",
            fontSize: 14,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 0 28px rgba(255,107,255,0.35)",
            transition: "transform .2s, box-shadow .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(255,107,255,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 28px rgba(255,107,255,0.35)"; }}
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => router.back()}
          style={{
            padding: "12px 28px",
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 12,
            color: "rgba(240,238,255,.6)",
            fontFamily: "'Outfit',sans-serif",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            transition: "border-color .2s, color .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,107,255,.4)"; e.currentTarget.style.color = "#FF6BFF"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.1)"; e.currentTarget.style.color = "rgba(240,238,255,.6)"; }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
