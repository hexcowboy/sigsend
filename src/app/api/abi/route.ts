import { Abi } from "abitype";
import { NextResponse } from "next/server";
import { isAddress } from "viem";

import { supportedChains } from "@/lib/ethereum";
import { fetchAbiFromEtherscan } from "@/lib/ethereum/abi";
import { redis } from "@/lib/redis";

export type GetAbiResponse = {
  abi?: Abi;
  error?: string;
};

export async function GET(
  request: Request
): Promise<NextResponse<GetAbiResponse>> {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const chainId_ = searchParams.get("chainId");

  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  if (!chainId_) {
    return NextResponse.json({ error: "Missing chainId" }, { status: 400 });
  }

  let chainId: number;
  try {
    chainId = parseInt(chainId_);

    if (!supportedChains.find((chain) => chain.id === chainId)) {
      return NextResponse.json({ error: "Invalid chainId" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: "Invalid chainId" }, { status: 400 });
  }

  const abi: Abi | null = await redis.get(`${chainId}-${address}`);
  if (abi !== null) {
    return NextResponse.json({ abi });
  }

  try {
    const abi = await fetchAbiFromEtherscan(chainId, address);
    if (abi && abi.length) {
      redis.set(`abi:${chainId}-${address.toLowerCase()}`, JSON.stringify(abi));
    }
    return NextResponse.json({ abi: abi });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not fetch contract ABI at this time" },
      { status: 400 }
    );
  }
}
