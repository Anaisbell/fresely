// Placeholder — real auth middleware is added in Phase 0 Week 3.
import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
}

export const config = { matcher: [] };
