import { formatEther, formatUnits } from "ethers/lib/utils";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useBalance } from "wagmi";
import { selectChainId } from "../features/network/networkSlice";
import useExchangeRates from "../hooks/useExchangeRates";
import formatAmount from "../utils/formatAmount";
import useTokenBalances from "./useTokenBalances";

const IPFS_GATEWAY_URL = "https://cloudflare-ipfs.com/ipfs/";

const useBalances = (walletAddress: string) => {
  const chainId = useSelector(selectChainId);
  const { data: exchangeRates, isLoading: exchangeRatesLoading } =
    useExchangeRates();

  const {
    data: balance,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useBalance({
    addressOrName: walletAddress,
    chainId,
    watch: true,
  });

  const {
    data: tokens = [],
    isLoading: tokensLoading,
    refetch: refetchTokens,
  } = useTokenBalances(walletAddress);

  const tokenData = useMemo(() => {
    return tokens.slice(0, 4).map((token) => ({
      title: token.name,
      subtitle: `${formatAmount(token.balance, token.decimals)} ${
        token.symbol
      }`,
      rightText: `$${(
        parseFloat(formatUnits(token.balance, token.decimals)) /
        exchangeRates[token.symbol === "WETH" ? "ETH" : token.symbol]
      ).toFixed(2)}`,
      iconUrl: token.logoURI.replace("ipfs://", IPFS_GATEWAY_URL),
      address: token.address,
      balance: token.balance.toString(),
      symbol: token.symbol,
      decimals: token.decimals,
      isToken: true,
    }));
  }, [tokens]);

  const balanceData = useMemo(() => {
    if (!balance) return [];
    return [
      {
        title: "Ethereum",
        subtitle: `${formatAmount(balance.value)} ${balance.symbol}`,
        rightText: `$${(
          parseFloat(formatEther(balance.value)) / exchangeRates.ETH
        ).toFixed(2)}`,
        balance: balance.value.toString(),
        symbol: balance.symbol,
        decimals: balance.decimals,
        isToken: false,
      },
    ];
  }, [balance]);

  const items = useMemo(
    () => [...balanceData, ...tokenData],
    [balanceData, tokenData]
  );

  return {
    data: items,
    isLoading: balanceLoading || tokensLoading || exchangeRatesLoading,
    refetch: () => {
      refetchBalance();
      refetchTokens();
    },
  };
};

export default useBalances;
