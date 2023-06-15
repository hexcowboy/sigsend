import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { isAddress } from "viem";

import { isValidChainId } from "@/lib/ethereum";
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
  console.log("POST", JSON.stringify(res, null, 2));

  if (!res.chain) {
    return NextResponse.json({ error: "chain is required" }, { status: 400 });
  }

  let chainId: number;
  try {
    chainId = parseInt(res.chain);
  } catch (e) {
    return NextResponse.json({ error: "chain is invalid" }, { status: 400 });
  }

  if (!isValidChainId(chainId)) {
    return NextResponse.json({ error: "chain is invalid" }, { status: 400 });
  }

  if (!res.address || !isAddress(res.address)) {
    return NextResponse.json({ error: "address is invalid" }, { status: 400 });
  }

  if (!res.args || !Array.isArray(res.args)) {
    return NextResponse.json({ error: "args is required" }, { status: 400 });
  }

  if (!res.function) {
    return NextResponse.json(
      { error: "function is required" },
      { status: 400 }
    );
  }

  if (!res.function.name) {
    return NextResponse.json(
      { error: "function.name is required" },
      { status: 400 }
    );
  }

  if (!res.function.inputs || !Array.isArray(res.function.inputs)) {
    return NextResponse.json(
      { error: "function.inputs is required" },
      { status: 400 }
    );
  }

  if (res.function.inputs.length !== res.args.length) {
    return NextResponse.json(
      { error: "function.inputs and args must be the same length" },
      { status: 400 }
    );
  }

  // create the send
  const uuid = uuidv4();
  redis.set(`send:${uuid}`, res);

  return NextResponse.json({ uuid });
}
