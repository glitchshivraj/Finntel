import { NextRequest, NextResponse } from "next/server";
import { signToken, setSessionCookie } from "@/lib/auth";
import { queryOne, query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // User denied access
  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/auth?error=google_cancelled`);
  }

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      console.error("[Google OAuth] Token exchange failed:", await tokenRes.text());
      return NextResponse.redirect(`${appUrl}/auth?error=google_failed`);
    }

    const { access_token } = await tokenRes.json();

    // 2. Get user info from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(`${appUrl}/auth?error=google_failed`);
    }

    const googleUser: { id: string; email: string; name: string; picture: string } = await userRes.json();
    const email = googleUser.email.toLowerCase().trim();
    const name = googleUser.name;

    // 3. Find or create user in DB
    let user = await queryOne<{ id: number; name: string; email: string; role: string; active: boolean }>(
      `SELECT id, name, email, role, active FROM users WHERE email = $1`,
      [email]
    );

    if (!user) {
      // Auto-register Google user as analyst
      const rows = await query<{ id: number; name: string; email: string; role: string }>(
        `INSERT INTO users (name, email, password, role, active)
         VALUES ($1, $2, $3, 'analyst', true)
         RETURNING id, name, email, role`,
        [name, email, "GOOGLE_OAUTH_NO_PASSWORD"]
      );
      user = { ...rows[0], active: true };
    }

    if (!user.active) {
      return NextResponse.redirect(`${appUrl}/auth?error=account_deactivated`);
    }

    // 4. Issue JWT session cookie
    const token = signToken({ userId: user.id, email: user.email, role: user.role, name: user.name });
    const cookieOpts = setSessionCookie(token);

    const res = NextResponse.redirect(`${appUrl}/dashboard`);
    res.cookies.set(cookieOpts);
    return res;

  } catch (err) {
    console.error("[Google OAuth Callback]", err);
    return NextResponse.redirect(`${appUrl}/auth?error=google_failed`);
  }
}
