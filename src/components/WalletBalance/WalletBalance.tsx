import { Skeleton, Text } from "native-base";
import { useBalance } from "wagmi";

interface Props {
  walletAddress: string;
}

const WalletBalance = ({ walletAddress }: Props) => {
  const {
    data: balance,
    isLoading,
    error,
  } = useBalance({
    addressOrName: walletAddress,
    chainId: 5,
  });

  if (isLoading) return <Skeleton />;

  return <Text variant="h4">{balance?.formatted.slice(0, 6)} ETH</Text>;
};

export default WalletBalance;
