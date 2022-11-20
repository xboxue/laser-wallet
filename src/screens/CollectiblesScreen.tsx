import { Box } from "native-base";
import { useSelector } from "react-redux";
import CollectibleGrid from "../components/CollectibleGrid/CollectibleGrid";
import { selectWalletAddress } from "../features/wallet/walletSlice";

const CollectiblesScreen = () => {
  const walletAddress = useSelector(selectWalletAddress);

  return (
    <Box p="4" pt="0" flex="1">
      <CollectibleGrid walletAddress={walletAddress} />
    </Box>
  );
};

export default CollectiblesScreen;
