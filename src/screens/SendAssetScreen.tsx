import { useNavigation } from "@react-navigation/native";
import icon from "crypto-icons-plus-128/src/ethereum.png";
import { Box, Image, Pressable, Text } from "native-base";
import TokenBalances from "../components/TokenBalances/TokenBalances";
import useSecureStore from "../hooks/useSecureStore";
import useWalletContract from "../hooks/useWalletContract";

const SendAssetScreen = ({ route }) => {
  const navigation = useNavigation();
  const walletAddress = useSecureStore("walletAddress");

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
