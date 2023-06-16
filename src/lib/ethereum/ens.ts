import { normalize } from "viem/ens";

import { client } from "@/lib/ethereum/client";

export const ENS_REGEX =
  /^[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?$/i;

export const isEns = (name: string) => ENS_REGEX.test(name);

export const resolveEns = async (chainId: number, name: string) => {
  const ensAddress = await client(chainId).getEnsAddress({
    name: normalize(name),
  });

  return ensAddress;
};
