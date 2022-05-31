import { Skeleton, Text } from "native-base";
import useWalletContract from "../../hooks/useWalletContract";

const WalletBalance = () => {
  const {
    data: balance,
    loading,
    error,
  } = useWalletContract("getBalanceInEth");

  if (loading) return <Skeleton />;

  return <Text variant="h4">{balance} ETH</Text>;
};

export default WalletBalance;
