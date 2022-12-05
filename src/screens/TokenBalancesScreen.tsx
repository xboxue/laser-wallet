import { Box } from "native-base";
import { useSelector } from "react-redux";
import TokenBalances from "../components/TokenBalances/TokenBalances";
import { selectWalletAddress } from "../features/wallet/walletSlice";

const TokenBalancesScreen = () => {
  const walletAddress = useSelector(selectWalletAddress);

  return (
    <Box p="4" pt="0" flex="1">
      <TokenBalances walletAddress={walletAddress} onPress={() => {}} />
    </Box>
  );
};

export default TokenBalancesScreen;
