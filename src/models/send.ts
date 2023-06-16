export type Send = {
  chain: string;
  address: string;
  args: string[];
  function: {
    inputs: {
      type: string;
      name: string;
    }[];
  };
  ens?: string;
};
