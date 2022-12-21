import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BigNumber } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { round } from "lodash";
import { Skeleton, Text } from "native-base";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useBalance } from "wagmi";
import { selectChainId } from "../../features/network/networkSlice";
import useBalances from "../../hooks/useBalances";
import useExchangeRates from "../../hooks/useExchangeRates";
import formatAmount from "../../utils/formatAmount";

interface Props {
  walletAddress: string;
}

const WalletBalance = ({ walletAddress }: Props) => {
  const { data: balances = [], isLoading: balancesLoading } =
    useBalances(walletAddress);

  const balance = useMemo(
    () =>
      balances.reduce((total, token) => {
        return total + (token.fiat ? parseInt(token.fiat[0].value) : 0);
      }, 0),
    [balances]
  );

  if (balancesLoading) return <Skeleton w="32" h="9" />;

  return (
    <Text variant="h2" fontWeight="600">
      {formatAmount(balance, {
        decimals: 2,
        style: "currency",
        currency: "USD",
      })}
    </Text>
  );
};

export default WalletBalance;
