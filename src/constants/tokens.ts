import ethIcon from "crypto-icons-plus-128/src/ethereum.png";
import uniswapIcon from "crypto-icons-plus-128/src/uniswap.png";
import daiIcon from "crypto-icons-plus-128/src/multi-collateral-dai.png";

export const GOERLI_TOKENS = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x0000000000000000000000000000000000000000",
    icon: ethIcon,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ethereum",
    address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    icon: ethIcon,
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    icon: uniswapIcon,
  },
];

export const KOVAN_TOKENS = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x0000000000000000000000000000000000000000",
    icon: ethIcon,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ethereum",
    address: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
    icon: ethIcon,
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa",
    icon: daiIcon,
  },
];

export const CHAIN_TOKENS = {
  goerli: GOERLI_TOKENS,
  kovan: KOVAN_TOKENS,
};
