import { Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { redis } from "@/lib/redis";

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(20, "1 m"),
});

export async function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  const result = await ratelimit.limit(
    request.headers.get("CF-Connecting-IP")!
  );
  headers.set("X-RateLimit-Limit", result.limit.toString());
  headers.set("X-RateLimit-Remaining", result.remaining.toString());

  if (!result.success) {
    return NextResponse.json(
      { error: "The request has been rate limited." },
      { status: 429, headers }
    );
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: "/",
};
