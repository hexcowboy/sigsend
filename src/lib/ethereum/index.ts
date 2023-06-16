import {
  arbitrum,
  arbitrumGoerli,
  baseGoerli,
  goerli,
  mainnet,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
  sepolia,
} from "@wagmi/core/chains";

export const supportedChains = [
  mainnet,
  goerli,
  arbitrum,
  arbitrumGoerli,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
  sepolia,
  baseGoerli,
];

export const getBaseApiUrl = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return "https://api.etherscan.io/api";
    case 5:
      return "https://api-goerli.etherscan.io/api";
    case 11155111:
      return "https://api-sepolia.etherscan.io/api";
    case 137:
      return "https://api.polygonscan.com/api";
    case 80001:
      return "https://api-testnet.polygonscan.com/api";
    case 42161:
      return "https://api.arbiscan.io/api";
    case 421613:
      return "https://api-goerli.arbiscan.io/api";
    case 10:
      return "https://api-optimistic.etherscan.io/api";
    case 420:
      return "https://api-goerli-optimistic.etherscan.io/api";
    default:
      throw new Error("Invalid chainId");
  }
};

export const chainSelect: Array<{ label: string; value: string }> =
  supportedChains
    .sort((a, b) => a.id - b.id)
    .map((chain) => ({
      label: chain.name,
      value: chain.id.toString(),
    }));

export const isValidChainId = (chainId: number): boolean =>
  supportedChains.some((chain) => chain.id === chainId);

export const truncateAddress = (address: string): string => {
  const prefix = address.substring(0, 6);
  const suffix = address.substring(address.length - 4);
  return prefix + "..." + suffix;
};

export const getBlockExplorer = (chainId: number): string | null => {
  const chain = supportedChains.find((chain) => chain.id === chainId);

  if (!chain) {
    throw new Error("Invalid chainId");
  }

  return (chain as any).blockExplorers?.etherscan?.url ?? null;
};
