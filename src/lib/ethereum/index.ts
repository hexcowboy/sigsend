import {
  arbitrum,
  arbitrumGoerli,
  aurora,
  auroraTestnet,
  avalanche,
  avalancheFuji,
  baseGoerli,
  foundry,
  goerli,
  hardhat,
  localhost,
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
  hardhat,
  localhost,
  arbitrum,
  arbitrumGoerli,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
  avalanche,
  avalancheFuji,
  aurora,
  auroraTestnet,
  foundry,
  sepolia,
  baseGoerli,
];

export const chainSelect: Array<{ label: string; value: string }> =
  supportedChains
    .sort((a, b) => a.id - b.id)
    .map((chain) => ({
      label: chain.name,
      value: chain.id.toString(),
    }));
