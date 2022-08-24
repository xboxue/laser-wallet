import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { generateMnemonic, mnemonicToSeed } from "bip39";
import { hdkey } from "ethereumjs-wallet";
import * as SecureStore from "expo-secure-store";
import { Box, Button, Text } from "native-base";
import { useMemo } from "react";
import { Platform } from "react-native";
import RNCloudFs from "react-native-cloud-fs";
import { useDispatch } from "react-redux";
import CopyIconButton from "../components/CopyIconButton/CopyIconButton";
import { setWalletAddress } from "../features/wallet/walletSlice";

const DEFAULT_DERIVATION_PATH = "m/44'/60'/0'/0";

const SignUpBackupScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const seedPhrase = useMemo(() => generateMnemonic(), []);

  const { mutateAsync: createWallet, isLoading: isCreating } = useMutation(
    async () => {
      const seed = await mnemonicToSeed(seedPhrase);
      const hdwallet = hdkey.fromMasterSeed(seed);
      const wallet = hdwallet.derivePath(DEFAULT_DERIVATION_PATH).getWallet();
      await SecureStore.setItemAsync("seedPhrase", seedPhrase);
      await SecureStore.setItemAsync(
        "privateKey",
        wallet.getPrivateKeyString()
      );
      dispatch(setWalletAddress(wallet.getAddressString()));
    }
  );

  const { mutateAsync: signInWithGoogle, isLoading: isSigningIn } = useMutation(
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
    }
  );

  return (
    <Box p="4">
      <Text variant="subtitle1">Back up your recovery key</Text>
      <Text>
        Your recovery key will be used to complete your wallet recovery in case
        your device is lost.
      </Text>
      <Box
        rounded="md"
        borderWidth="1"
        borderColor="gray.200"
        p="3"
        mt="3"
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
        mt="4"
        isLoading={isSigningIn || isCreating}
        onPress={async () => {
          if (Platform.OS === "android") await signInWithGoogle();
          await createWallet();
          navigation.navigate("SignUpBackupPassword");
        }}
      >
        {`Back up on ${Platform.OS === "ios" ? "iCloud" : "Google Drive"}`}
      </Button>
      <Button
        variant="subtle"
        mt="2"
        onPress={async () => {
          await createWallet();
          navigation.navigate("SignUpBackupPassword");
        }}
      >
        Back up manually
      </Button>
    </Box>
  );
};

export default SignUpBackupScreen;
