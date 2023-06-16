export type Send = {
  chain: string;
  address: string;
  args: string[];
  function: {
    name: string;
    inputs: {
      type: string;
      name: string;
    }[];
    outputs: {
      type: string;
      name: string;
    }[];
    stateMutability: string;
  };
  ens?: string;
};

export const SendEthInteraction: Send["function"] = {
  name: "Pay ETH",
  inputs: [{ type: "Amount in ETH", name: "Payable Amount" }],
  outputs: [],
  stateMutability: "payable",
};
