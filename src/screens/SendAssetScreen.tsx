import { useNavigation } from "@react-navigation/native";
import { Box, Text } from "native-base";
import { useSelector } from "react-redux";
import TokenBalances from "../components/TokenBalances/TokenBalances";
import { selectWalletAddress } from "../features/wallet/walletSlice";

const SendAssetScreen = ({ route }) => {
  const navigation = useNavigation();
  const walletAddress = useSelector(selectWalletAddress);

  return (
    <Box>
      <Text variant="subtitle1" p="4" pb="0">
        Choose asset
      </Text>
      {walletAddress && (
        <TokenBalances
          walletAddress={walletAddress}
          onPress={(token) =>
            navigation.navigate("SendAmount", {
              ...route.params,
              token,
            })
          }
        />
      )}
    </Box>
  );
};

export default SendAssetScreen;
