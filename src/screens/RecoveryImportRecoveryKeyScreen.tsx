import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { Box, Button, Text } from "native-base";
import { useState } from "react";
import { Platform } from "react-native";
import EnableICloudPrompt from "../components/EnableICloudPrompt/EnableICloudPrompt";
import { signInToCloud } from "../services/cloudBackup";

const RecoveryImportRecoveryKeyScreen = () => {
  const navigation = useNavigation();
  const [iCloudPromptOpen, setICloudPromptOpen] = useState(false);

  const { mutate: signIn, isLoading: isSigningIn } = useMutation(
    async () => signInToCloud(),
    {
      onSuccess: () => navigation.navigate("RecoverySignIn"),
      onError: (error) => {
        if (error instanceof Error && error.message === "iCloud not available")
          setICloudPromptOpen(true);
      },
      meta: { disableErrorToast: true },
    }
  );

  return (
    <Box p="4">
      <Text variant="subtitle1">Import your recovery key</Text>
      <Text>Import the recovery key backup associated with your vault.</Text>
      <Button mt="6" onPress={() => signIn()} isLoading={isSigningIn}>
        {`Import from ${Platform.OS === "ios" ? "iCloud" : "Google Drive"}`}
      </Button>
      <EnableICloudPrompt
        open={iCloudPromptOpen}
        onClose={() => setICloudPromptOpen(false)}
      />
    </Box>
  );
};

export default RecoveryImportRecoveryKeyScreen;