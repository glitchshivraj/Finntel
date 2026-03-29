import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Finntel — Risk-Based Loan Approval System",
  description:
    "AI-powered risk assessment dashboard for real-time loan decisioning with transparent reasoning and audit trails.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={outfit.variable}
      style={{ background: "#050508", colorScheme: "dark" }}
    >
      <body
        style={{
          background: "#050508",
          color: "#F0EEFF",
          minHeight: "100vh",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
