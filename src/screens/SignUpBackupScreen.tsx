import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { generateMnemonic, mnemonicToSeed } from "bip39";
import { Box, Button, Text } from "native-base";
import { useMemo, useState } from "react";
import { Platform } from "react-native";
import CopyIconButton from "../components/CopyIconButton/CopyIconButton";
import EnableICloudPrompt from "../components/EnableICloudPrompt/EnableICloudPrompt";
import { signInToCloud } from "../services/cloudBackup";
import { createWallets } from "../utils/wallet";

const SignUpBackupScreen = () => {
  const navigation = useNavigation();
  const seedPhrase = useMemo(() => generateMnemonic(), []);
  const [iCloudPromptOpen, setICloudPromptOpen] = useState(false);

  const { mutate: createWallet, isLoading: isCreating } = useMutation(
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return createWallets(seedPhrase);
    },
    {
      onSuccess: (wallets) =>
        navigation.navigate("SignUpVerifySeedPhrase", { wallets }),
    }
  );

  const { mutate: signInAndCreateWallet, isLoading: isSigningIn } = useMutation(
    async () => {
      await signInToCloud();
      return createWallets(seedPhrase);
    },
    {
      onSuccess: (wallets) =>
        navigation.navigate("SignUpBackupPassword", { wallets }),
      onError: (error) => {
        if (error instanceof Error && error.message === "iCloud not available")
          setICloudPromptOpen(true);
      },
      meta: { disableErrorToast: true },
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
        onPress={() => createWallet()}
        isLoading={isCreating}
      >
        Back up manually
      </Button>
      <EnableICloudPrompt
        open={iCloudPromptOpen}
        onClose={() => setICloudPromptOpen(false)}
      />
    </Box>
  );
};

export default SignUpBackupScreen;
