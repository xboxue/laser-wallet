import { useNavigation } from "@react-navigation/native";
import "react-native-get-random-values";
import "@ethersproject/shims";
import { ethers } from "ethers";
import { Box, Button, Text } from "native-base";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as SecureStore from "expo-secure-store";

const SignUpBackUpScreen = () => {
  const navigation = useNavigation();

  const createWallet = async () => {
    const owner = ethers.Wallet.createRandom();
    await SecureStore.setItemAsync("ownerAddress", owner.address);
    await SecureStore.setItemAsync("ownerPrivateKey", owner.privateKey);
  };

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
          onPress={async () => {
            const recoveryWallet = ethers.Wallet.createRandom();
            try {
              GoogleSignin.configure({
                scopes: ["https://www.googleapis.com/auth/drive.file"],
              });
              await GoogleSignin.signIn();

              await createWallet();
              navigation.navigate("Home");
            } catch (error) {
              console.log(error);
            }
          }}
        >
          Back up on Google Drive
        </Button>
      </Box>
    </Box>
  );
};

export default SignUpBackUpScreen;
