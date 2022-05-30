import { useNavigation } from "@react-navigation/native";
import "react-native-get-random-values";
import "@ethersproject/shims";
import { ethers } from "ethers";
import { Box, Button, Text } from "native-base";

const SignUpBackUpScreen = () => {
  const navigation = useNavigation();

  return (
    <Box>
      <Box p="4">
        <Text variant="subtitle1">Back up your recovery wallet</Text>
        <Text>
          Store the encrypted key of your recovery wallet. This will be used to
          recover your funds in case your device is lost.
        </Text>

        <Button
          mt="4"
          onPress={() => {
            const recoveryWallet = ethers.Wallet.createRandom();
          }}
        >
          Back up on Google Drive
        </Button>
      </Box>
    </Box>
  );
};

export default SignUpBackUpScreen;
