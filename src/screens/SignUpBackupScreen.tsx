import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { generateMnemonic } from "bip39";
import { Box, Button, Text } from "native-base";
import { useState } from "react";
import { Platform } from "react-native";
import EnableICloudPrompt from "../components/EnableICloudPrompt/EnableICloudPrompt";
import SignUpLayout from "../components/SignUpLayout/SignUpLayout";
import { signInToCloud } from "../services/cloudBackup";

const SignUpBackupScreen = () => {
  const navigation = useNavigation();
  const [iCloudPromptOpen, setICloudPromptOpen] = useState(false);

  const { mutate: signIn, isLoading } = useMutation(
    async () => await signInToCloud(),
    {
      onSuccess: () => {
        navigation.navigate("SignUpBackupPassword");
      },
      onError: (error) => {
        if (error instanceof Error && error.message === "iCloud not available")
          setICloudPromptOpen(true);
      },
      meta: { disableErrorToast: true },
    }
  );

  return (
    <SignUpLayout
      title="Back up your wallet"
      subtitle="Your backup will be used to recover your wallet in case your device is lost."
      isLoading={isLoading}
      onNext={signIn}
      nextText={`Back up on ${
        Platform.OS === "ios" ? "iCloud" : "Google Drive"
      }`}
    >
      <EnableICloudPrompt
        open={iCloudPromptOpen}
        onClose={() => setICloudPromptOpen(false)}
      />
    </SignUpLayout>
  );
};

export default SignUpBackupScreen;
