import { useNavigation } from "@react-navigation/native";
import icon from "crypto-icons-plus-128/src/ethereum.png";
import { Box, Image, Pressable, Text } from "native-base";
import useWalletContract from "../hooks/useWalletContract";

const SendAssetScreen = ({ route }) => {
  const navigation = useNavigation();
  const {
    data: balance,
    loading,
    error,
  } = useWalletContract("getBalanceInEth");

  return (
    <Box>
      <Box p="4">
        <Text variant="subtitle1" mb="3">
          Choose asset
        </Text>
        <Pressable
          onPress={() =>
            navigation.navigate("SendAmount", {
              ...route.params,
              asset: "eth",
            })
          }
        >
          {({ isPressed }) => (
            <Box
              flexDirection="row"
              alignItems="center"
              mt="2"
              opacity={isPressed ? 0.2 : 1}
            >
              <Image source={icon} size="10" alt="ethereum-icon" />
              <Text variant="subtitle1" ml="3">
                ETH
              </Text>
              <Text variant="subtitle1" ml="auto">
                {balance}
              </Text>
            </Box>
          )}
        </Pressable>
      </Box>
    </Box>
  );
};

export default SendAssetScreen;
