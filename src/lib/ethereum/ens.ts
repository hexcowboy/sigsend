import { normalize } from "viem/ens";

import { client } from "./client";

export const ENS_REGEX =
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/i;

export const isEns = (name: string) => ENS_REGEX.test(name);

export const resolveEns = async (name: string) => {
  const ensAddress = await client.getEnsAddress({
    name: normalize(name),
  });

  return ensAddress;
};
