import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BigNumber } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { round } from "lodash";
import { Skeleton, Text } from "native-base";
import { useSelector } from "react-redux";
import { useBalance } from "wagmi";
import { selectChainId } from "../../features/network/networkSlice";
import useExchangeRates from "../../hooks/useExchangeRates";
import formatAmount from "../../utils/formatAmount";

interface Props {
  walletAddress: string;
}

const WalletBalance = ({ walletAddress }: Props) => {
  const chainId = useSelector(selectChainId);
  const { data: balance, isLoading: balanceLoading } = useBalance({
    addressOrName: walletAddress,
    chainId,
  });
  const { data: exchangeRates, isLoading: exchangeRatesLoading } =
    useExchangeRates();

  if (balanceLoading || exchangeRatesLoading || !exchangeRates || !balance)
    return <Skeleton w="32" h="9" />;

  return (
    <Text variant="h2" fontWeight="600">
      ${(parseFloat(formatEther(balance.value)) * exchangeRates.USD).toFixed(2)}
    </Text>
  );
};

export default WalletBalance;
