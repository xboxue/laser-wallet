import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { Box, Button, Text } from "native-base";
import { useState } from "react";
import { Platform } from "react-native";
import EnableICloudPrompt from "../components/EnableICloudPrompt/EnableICloudPrompt";
import { signInToCloud } from "../services/cloudBackup";

const VaultBackupScreen = () => {
  const navigation = useNavigation();
  const [iCloudPromptOpen, setICloudPromptOpen] = useState(false);

  const { mutate: signIn, isLoading: isSigningIn } = useMutation(
    async () => signInToCloud(),
    {
      onSuccess: () => navigation.navigate("VaultBackupPassword"),
      onError: (error) => {
        if (error instanceof Error && error.message === "iCloud not available")
          setICloudPromptOpen(true);
      },
      meta: { disableErrorToast: true },
    }
  );

  return (
    <Box p="4">
      <Text variant="subtitle1">Back up your recovery key</Text>
      <Text>
        Your recovery key will be used to complete your wallet recovery in case
        your device is lost.
      </Text>

      <Button mt="4" onPress={async () => signIn()} isLoading={isSigningIn}>
        {`Back up on ${Platform.OS === "ios" ? "iCloud" : "Google Drive"}`}
      </Button>
      <EnableICloudPrompt
        open={iCloudPromptOpen}
        onClose={() => setICloudPromptOpen(false)}
      />
    </Box>
  );
};

export default VaultBackupScreen;
