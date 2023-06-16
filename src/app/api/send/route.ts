import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { isAddress } from "viem";

import { isValidChainId } from "@/lib/ethereum";
import { resolveEns } from "@/lib/ethereum/ens";
import { redis } from "@/lib/redis";

export type SendCreateResponse = {
  uuid?: string;
  error?: string;
};

// Good input examples:
// {
//   "chain": "1",
//   "address": "0x6339e5E072086621540D0362C4e3Cea0d643E114",
//   "args": [
//     ""
//   ],
//   "function": {
//     "inputs": [
//       {
//         "type": "Amount in ETH",
//         "name": "Pay ETH"
//       }
//     ]
//   }
// }
// {
//   "chain": "1",
//   "address": "0x6339e5E072086621540D0362C4e3Cea0d643E114",
//   "args": [],
//   "function": {
//     "inputs": [],
//     "name": "withdraw",
//     "outputs": [],
//     "stateMutability": "nonpayable",
//     "type": "function"
//   }
// }

export async function POST(
  request: Request
): Promise<NextResponse<SendCreateResponse>> {
  const res = await request.json();
  console.log(JSON.stringify(res, null, 2));

  if (res.length > 2000) {
    return NextResponse.json(
      { error: "Request body is too large" },
      { status: 400 }
    );
  }

  if (!res.chain) {
    return NextResponse.json({ error: "Chain is required" }, { status: 400 });
  }

  let chainId: number;
  try {
    chainId = parseInt(res.chain);
  } catch (e) {
    return NextResponse.json({ error: "Chain is invalid" }, { status: 400 });
  }

  if (!isValidChainId(chainId)) {
    return NextResponse.json({ error: "Chain is invalid" }, { status: 400 });
  }

  if (!res.address || !isAddress(res.address)) {
    return NextResponse.json({ error: "Address is invalid" }, { status: 400 });
  }

  if (!res.args || !Array.isArray(res.args)) {
    return NextResponse.json({ error: "Args is required" }, { status: 400 });
  }

  if (!res.function) {
    return NextResponse.json(
      { error: "Function is required" },
      { status: 400 }
    );
  }

  if (!res.function.inputs || !Array.isArray(res.function.inputs)) {
    return NextResponse.json(
      { error: "Function inputs is required" },
      { status: 400 }
    );
  }

  for (const { type, name } of res.function.inputs) {
    if (!name) {
      return NextResponse.json(
        { error: "Function input type is required" },
        { status: 400 }
      );
    }
    if (!type) {
      return NextResponse.json(
        { error: "Function input name is required" },
        { status: 400 }
      );
    }
  }

  if (res.function.inputs.length !== res.args.length) {
    return NextResponse.json(
      { error: "Function.inputs and args must be the same length" },
      { status: 400 }
    );
  }

  if (res.ens && typeof res.ens === "string") {
    const ens = resolveEns(chainId, res.ens);
    if (!ens) {
      return NextResponse.json({ error: "ENS is invalid" }, { status: 400 });
    }
  }

  // create the send
  try {
    const uuid = uuidv4();
    redis.set(`send:${uuid}`, JSON.stringify(res));
    return NextResponse.json({ uuid });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create send" },
      { status: 500 }
    );
  }
}
