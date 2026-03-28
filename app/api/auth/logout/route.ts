import { NextResponse } from "next/server";
import { COOKIE_NAME_EXPORT } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });
  res.cookies.set({ name: COOKIE_NAME_EXPORT, value: "", maxAge: 0, path: "/" });
  return res;
}
