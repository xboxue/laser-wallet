import { useNavigation } from "@react-navigation/native";
import { Box, Text } from "native-base";
import { useSelector } from "react-redux";
import TokenBalances from "../components/TokenBalances/TokenBalances";
import { selectWalletAddress } from "../features/wallet/walletSlice";

const SendAssetScreen = ({ route }) => {
  const navigation = useNavigation();
  const walletAddress = useSelector(selectWalletAddress);

  return (
    <Box flex={1} px="4">
      <TokenBalances
        walletAddress={walletAddress}
        onPress={(token) =>
          navigation.navigate("Enter Amount", {
            ...route.params,
            token,
          })
        }
      />
    </Box>
  );
};

export default SendAssetScreen;
