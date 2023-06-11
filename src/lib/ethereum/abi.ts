import { Abi, AbiFunction } from "abitype";

import { createClient } from "@/lib/ethereum/client";

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

export const isProxy = (abi: Abi): boolean => {
  return (
    abi.find((item) => {
      if (item.type !== "function") {
        return false;
      }
      if (item.name !== "implementation") {
        return false;
      }
      if (item.stateMutability !== "view") {
        return false;
      }
      return true;
    }) !== undefined
  );
};

const proxyAbi = [
  {
    constant: true,
    inputs: [],
    name: "implementation",
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
] as const;

export const fetchAbiFromEtherscan = async (
  chainId: number,
  address: `0x${string}`
): Promise<Abi> => {
  const res = await fetch(
    `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`
  );
  const json = await res.json();

  switch (json.status) {
    case "1":
      const abi = JSON.parse(json.result);
      const proxy = isProxy(abi);

      if (proxy) {
        const client = createClient(chainId);
        const data = await client.readContract({
          address,
          abi: proxyAbi,
          functionName: "implementation",
        });
        return await fetchAbiFromEtherscan(chainId, data);
      } else {
        return abi;
      }
  }

  return [];
};
