import { Abi } from "abitype";
import { NextResponse } from "next/server";
import { isAddress } from "viem";

import { supportedChains } from "@/lib/ethereum";
import { createClient } from "@/lib/ethereum/client";

export type GetAbiResponse = {
  isContract?: boolean;
  abi?: Abi;
  error?: string;
};

export async function GET(
  request: Request
): Promise<NextResponse<GetAbiResponse>> {
  // TODO: Add rate limiting

  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const chainId_ = searchParams.get("chainId");

  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  if (!chainId_) {
    return NextResponse.json({ error: "Missing chainId" }, { status: 400 });
  }

  try {
    const chainId = parseInt(chainId_);

    if (!supportedChains.find((chain) => chain.id === chainId)) {
      return NextResponse.json({ error: "Invalid chainId" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: "Invalid chainId" }, { status: 400 });
  }

  // TODO: Add caching

  try {
    const res = await fetch(
      `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`
    );
    const json = await res.json();

    switch (json.status) {
      case "0":
        const client = createClient(parseInt(chainId_));
        const code = await client.getBytecode({ address });

        if (code === "0x") {
          return NextResponse.json({ isContract: false, abi: [] });
        }

        return NextResponse.json({ isContract: true, abi: [] });
      case "1":
        return NextResponse.json({
          isContract: true,
          abi: JSON.parse(json.result),
        });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not fetch contract ABI at this time" },
      { status: 400 }
    );
  }

  return NextResponse.json({ isContract: false, abi: [] });
}
