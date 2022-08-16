import { round } from "lodash";
import { Skeleton, Text } from "native-base";
import { useSelector } from "react-redux";
import { useBalance } from "wagmi";
import { selectChainId } from "../../features/network/networkSlice";
import formatAmount from "../../utils/formatAmount";

interface Props {
  walletAddress: string;
}

const WalletBalance = ({ walletAddress }: Props) => {
  const chainId = useSelector(selectChainId);
  const {
    data: balance,
    isLoading,
    error,
  } = useBalance({
    addressOrName: walletAddress,
    chainId,
  });

  if (isLoading || !balance) return <Skeleton w="32" h="9" />;

  return (
    <Text variant="h4">
      {formatAmount(balance.value)} {balance.symbol}
    </Text>
  );
};

export default WalletBalance;
