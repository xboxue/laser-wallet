import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { generateMnemonic } from "bip39";
import { Box, Button, Text } from "native-base";
import { useState } from "react";
import { Platform } from "react-native";
import EnableICloudPrompt from "../components/EnableICloudPrompt/EnableICloudPrompt";
import { signInToCloud } from "../services/cloudBackup";

const SignUpBackupScreen = ({ route }) => {
  const navigation = useNavigation();
  const [iCloudPromptOpen, setICloudPromptOpen] = useState(false);

  const { mutate: signIn, isLoading } = useMutation(
    async () => await signInToCloud(),
    {
      onSuccess: () => {
        navigation.navigate("SignUpBackupPassword", route.params);
      },
      onError: (error) => {
        if (error instanceof Error && error.message === "iCloud not available")
          setICloudPromptOpen(true);
      },
      // meta: { disableErrorToast: true },
    }
  );

  return (
    <Box p="4">
      <Text variant="subtitle1">Back up your wallet</Text>
      <Text>
        Your backup will be used to recover your wallet in case your device is
        lost.
      </Text>
      <Button mt="6" isLoading={isLoading} onPress={() => signIn()}>
        {`Back up on ${Platform.OS === "ios" ? "iCloud" : "Google Drive"}`}
      </Button>
      <EnableICloudPrompt
        open={iCloudPromptOpen}
        onClose={() => setICloudPromptOpen(false)}
      />
    </Box>
  );
};

export default SignUpBackupScreen;
