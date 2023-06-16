import { Abi, AbiFunction } from "abitype";
import { isDeepStrictEqual } from "util";
import { Hex } from "viem";

import { createClient } from "@/lib/ethereum/client";

import { getBaseApiUrl } from ".";

const proxyAbi = {
  anonymous: false,
  inputs: [
    {
      indexed: true,
      internalType: "address",
      name: "implementation",
      type: "address",
    },
  ],
  name: "Upgraded",
  type: "event",
} as const;

export const getWritableAbiFunctions = (abi: Abi): AbiFunction[] => {
  return abi.filter((item) => {
    if (item.type !== "function") {
      return false;
    }
    if (item.stateMutability === "view" || item.stateMutability === "pure") {
      return false;
    }
    return true;
  }) as AbiFunction[];
};

const hexToAddress = (hex: Hex): `0x${string}` => {
  return `0x${hex.slice(hex.length - 40, hex.length)}`;
};

export const fetchAbiFromEtherscan = async (
  chainId: number,
  address: `0x${string}`
): Promise<Abi> => {
  const baseUrl = getBaseApiUrl(chainId);
  const res = await fetch(
    `${baseUrl}?module=contract&action=getabi&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`
  );
  const json = await res.json();

  switch (json.status) {
    case "1":
      const abi: Abi = JSON.parse(json.result);
      const isProxy = abi.some((i) => isDeepStrictEqual(i, proxyAbi));

      if (isProxy) {
        const client = createClient(chainId);

        // https://eips.ethereum.org/EIPS/eip-1967#logic-contract-address
        const data = await client.getStorageAt({
          address,
          slot: "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
        });
        if (!data) return [];

        // proxy implementations will still register `true` for `isProxy`, but their
        // implementation address will be 0x0
        if (
          data ===
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        ) {
          return abi;
        }

        return await fetchAbiFromEtherscan(chainId, hexToAddress(data));
      } else {
        return abi;
      }
  }

  return [];
};
