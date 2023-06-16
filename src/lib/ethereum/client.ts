import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

import { supportedChains } from "@/lib/ethereum";

export const client = (chainId: number) =>
  createPublicClient({
    chain: supportedChains.find((chain) => chain.id === chainId) || mainnet,
    transport: http(),
  });

export const createClient = (chainId: number) => {
  const chain = supportedChains.find((chain) => chain.id === chainId);

  if (!chain) {
    throw new Error("Invalid chainId");
  }

  return createPublicClient({
    chain,
    transport: http(),
  });
};
