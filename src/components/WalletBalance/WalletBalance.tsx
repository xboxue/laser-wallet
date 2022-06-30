import { Skeleton, Text } from "native-base";
import { useSelector } from "react-redux";
import { useBalance } from "wagmi";
import { selectChainId } from "../../features/network/networkSlice";

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
    watch: true,
  });

  if (isLoading) return <Skeleton />;

  return <Text variant="h4">{balance?.formatted.slice(0, 6)} ETH</Text>;
};

export default WalletBalance;
