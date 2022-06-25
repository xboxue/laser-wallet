import ethIcon from "crypto-icons-plus-128/src/ethereum.png";
import uniswapIcon from "crypto-icons-plus-128/src/uniswap.png";

const tokens = [
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

export default tokens;
