import { BigNumber } from "ethers";
import { useSelector } from "react-redux";
import { erc20ABI, useContractReads } from "wagmi";
import { tokens } from "@uniswap/default-token-list";
import { selectChainId } from "../features/network/networkSlice";
import { useMemo } from "react";

export type TokenBalance = typeof tokens[number] & {
  balance: BigNumber;
};

const useTokenBalances = (walletAddress: string) => {
  const chainId = useSelector(selectChainId);
  const chainTokens = useMemo(
    () => tokens.filter((token) => token.chainId === chainId),
    [chainId]
  );

  return useContractReads({
    contracts: chainTokens.map((token) => ({
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
          ...chainTokens[index],
          balance,
        }))
        .filter(({ balance }) => !balance.isZero()),
  });
};

export default useTokenBalances;
