import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

import { supportedChains } from ".";

export const client = createPublicClient({
  chain: mainnet,
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
