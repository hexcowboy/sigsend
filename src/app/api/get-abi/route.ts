import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { Abi } from "abitype";
import { NextResponse } from "next/server";
import { isAddress } from "viem";

import { supportedChains } from "@/lib/ethereum";
import { fetchAbiFromEtherscan } from "@/lib/ethereum/abi";

export type GetAbiResponse = {
  abi?: Abi;
  error?: string;
};

const redis = new Redis({
  url: "https://integral-gibbon-37698.upstash.io",
  token: process.env.UPSTASH_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(20, "1 m"),
});

export async function GET(
  request: Request
): Promise<NextResponse<GetAbiResponse>> {
  const result = await ratelimit.limit(
    request.headers.get("CF-Connecting-IP")!
  );
  const headers = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
  };

  if (!result.success) {
    return NextResponse.json(
      { error: "The request has been rate limited." },
      { status: 429, headers }
    );
  }

  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const chainId_ = searchParams.get("chainId");

  if (!address || !isAddress(address)) {
    return NextResponse.json(
      { error: "Invalid address" },
      { status: 400, headers }
    );
  }

  if (!chainId_) {
    return NextResponse.json(
      { error: "Missing chainId" },
      { status: 400, headers }
    );
  }

  let chainId: number;
  try {
    chainId = parseInt(chainId_);

    if (!supportedChains.find((chain) => chain.id === chainId)) {
      return NextResponse.json(
        { error: "Invalid chainId" },
        { status: 400, headers }
      );
    }
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid chainId" },
      { status: 400, headers }
    );
  }

  const abi: Abi | null = await redis.get(`${chainId}-${address}`);
  if (abi !== null) {
    return NextResponse.json({ abi }, { headers });
  }

  try {
    const abi = await fetchAbiFromEtherscan(chainId, address);
    redis.set(`${chainId}-${address}`, JSON.stringify(abi));
    return NextResponse.json({ abi: abi }, { headers });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not fetch contract ABI at this time" },
      { status: 400, headers }
    );
  }
}
