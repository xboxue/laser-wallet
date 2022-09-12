import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { generateMnemonic, mnemonicToSeed } from "bip39";
import { hdkey } from "ethereumjs-wallet";
import { utils } from "ethers";
import * as SecureStore from "expo-secure-store";
import { Box, Button, Text } from "native-base";
import { useMemo } from "react";
import { Platform } from "react-native";
import RNCloudFs from "react-native-cloud-fs";
import CopyIconButton from "../components/CopyIconButton/CopyIconButton";

const SignUpBackupScreen = () => {
  const navigation = useNavigation();
  const seedPhrase = useMemo(() => generateMnemonic(), []);

  const createWallet = async () => {
    const seed = await mnemonicToSeed(seedPhrase);
    const hdwallet = hdkey.fromMasterSeed(seed);
    const privateKeys: Record<string, string> = {};
    const wallets = [];
    for (let i = 0; i < 10; i++) {
      const wallet = hdwallet
        .derivePath(utils.defaultPath)
        .deriveChild(i)
        .getWallet();
      privateKeys[wallet.getAddressString()] = wallet.getPrivateKeyString();
      wallets.push({ address: wallet.getAddressString() });
    }
    await SecureStore.setItemAsync("seedPhrase", seedPhrase);
    await SecureStore.setItemAsync("privateKeys", JSON.stringify(privateKeys));
    return wallets;
  };

  const { mutate, isLoading: isCreating } = useMutation(
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return createWallet();
    },
    {
      onSuccess: (wallets) =>
        navigation.navigate("SignUpVerifySeedPhrase", { wallets }),
    }
  );

  const { mutateAsync: signInAndCreateWallet, isLoading: isSigningIn } =
    useMutation(
      async () => {
        if (Platform.OS === "android") {
          GoogleSignin.configure({
            scopes: ["https://www.googleapis.com/auth/drive.file"],
          });
          await GoogleSignin.hasPlayServices({
            showPlayServicesUpdateDialog: true,
          });
          const isSignedIn = await GoogleSignin.isSignedIn();
          if (!isSignedIn) {
            await GoogleSignin.signIn();
          }
          await RNCloudFs.loginIfNeeded();
        }

        return createWallet();
      },
      {
        onSuccess: (wallets) =>
          navigation.navigate("SignUpBackupPassword", { wallets }),
      }
    );

  return (
    <Box p="4">
      <Text variant="subtitle1">Back up your recovery phrase</Text>
      <Text>
        Your recovery phrase will be used to recover your wallet in case your
        device is lost.
      </Text>
      <Box
        rounded="md"
        borderWidth="1"
        borderColor="gray.200"
        p="3"
        mt="5"
        flexDir="row"
        position="relative"
        bgColor="gray.100"
      >
        <Text mr="1" flex="1">
          {seedPhrase}
        </Text>
        <CopyIconButton value={seedPhrase} />
      </Box>
      <Button
        mt="6"
        isLoading={isSigningIn}
        onPress={() => signInAndCreateWallet()}
      >
        {`Back up on ${Platform.OS === "ios" ? "iCloud" : "Google Drive"}`}
      </Button>
      <Button
        variant="subtle"
        mt="2"
        onPress={() => mutate()}
        isLoading={isCreating}
      >
        Back up manually
      </Button>
    </Box>
  );
};

export default SignUpBackupScreen;
