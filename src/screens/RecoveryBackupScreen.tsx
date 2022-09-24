import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { Box, Button, Text } from "native-base";
import { useState } from "react";
import { Platform } from "react-native";
import EnableICloudPrompt from "../components/EnableICloudPrompt/EnableICloudPrompt";
import { signInToCloud } from "../services/cloudBackup";

const RecoveryBackupScreen = ({ route }) => {
  const { wallets } = route.params;
  const navigation = useNavigation();
  const [iCloudPromptOpen, setICloudPromptOpen] = useState(false);

  const { mutate: signIn, isLoading: isSigningIn } = useMutation(
    async () => signInToCloud(),
    {
      onSuccess: () =>
        navigation.navigate("SignUpBackupPassword", {
          wallets,
          isRecovery: true,
        }),
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
      <Button mt="6" onPress={() => signIn()} isLoading={isSigningIn}>
        {`Back up on ${Platform.OS === "ios" ? "iCloud" : "Google Drive"}`}
      </Button>
      <Button
        variant="subtle"
        mt="2"
        onPress={() => navigation.navigate("RecoveryImportVault")}
      >
        Skip
      </Button>
      <EnableICloudPrompt
        open={iCloudPromptOpen}
        onClose={() => setICloudPromptOpen(false)}
      />
    </Box>
  );
};

export default RecoveryBackupScreen;
