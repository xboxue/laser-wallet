import { BigNumber } from "ethers";
import { useSelector } from "react-redux";
import { erc20ABI, useContractReads } from "wagmi";
import TOKENS from "../constants/tokens";
import { selectChainId } from "../features/network/networkSlice";

export type TokenBalance = typeof TOKENS[number] & {
  balance: BigNumber;
};

const useTokenBalances = (walletAddress: string) => {
  const chainId = useSelector(selectChainId);
  const tokens = TOKENS.filter((token) => token.chainId === chainId);

  return useContractReads({
    contracts: tokens.map((token) => ({
      addressOrName: token.address,
      contractInterface: erc20ABI,
      functionName: "balanceOf",
      args: [walletAddress],
      chainId,
    })),
    watch: true,
    select: (data) =>
      data
        .map((balance, index) => ({
          ...tokens[index],
          balance,
        }))
        .filter(({ balance }) => !balance.isZero()),
  });
};

export default useTokenBalances;
