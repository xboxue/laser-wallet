import { useNavigation } from "@react-navigation/native";
import { Box, Text } from "native-base";
import { useSelector } from "react-redux";
import TokenBalances from "../components/TokenBalances/TokenBalances";
import { selectWalletAddress } from "../features/auth/authSlice";

const SendAssetScreen = ({ route }) => {
  const navigation = useNavigation();
  const walletAddress = useSelector(selectWalletAddress);

  return (
    <Box>
      <Box p="4">
        <Text variant="subtitle1" mb="3">
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
    </Box>
  );
};

export default SendAssetScreen;
