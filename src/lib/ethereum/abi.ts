import { Abi, AbiFunction } from "abitype";

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
