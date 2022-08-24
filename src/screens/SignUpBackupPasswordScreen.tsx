import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { formatISO } from "date-fns";
import * as SecureStore from "expo-secure-store";
import { Box, Text } from "native-base";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BackupPasswordForm from "../components/BackupPasswordForm/BackupPasswordForm";
import EnableICloudPrompt from "../components/EnableICloudPrompt/EnableICloudPrompt";
import { setIsAuthenticated } from "../features/auth/authSlice";
import { selectChainId } from "../features/network/networkSlice";
import { createBackup } from "../services/cloudBackup";

const SignUpBackupPasswordScreen = () => {
  const dispatch = useDispatch();
  const [iCloudPromptOpen, setICloudPromptOpen] = useState(false);
  const navigation = useNavigation();

  const { mutate: onBackup, isLoading } = useMutation(
    async (password: string) => {
      const seedPhrase = await SecureStore.getItemAsync("seedPhrase");
      if (!seedPhrase) throw new Error("No seed phrase");
      await createBackup(seedPhrase, password, "backup");

      await SecureStore.setItemAsync("backupPassword", password);
      dispatch(setIsAuthenticated(true));
    },
    {
      onSuccess: () => navigation.navigate("Home"),
      onError: (error) => {
        if (error instanceof Error && error.message === "iCloud not available")
          setICloudPromptOpen(true);
      },
    }
  );

  return (
    <Box p="4">
      <Text variant="subtitle1">Create backup password</Text>
      <Text mb="4">
        We encrypt your backup so that only you can restore your wallet. Do not
        lose this password.
      </Text>
      <EnableICloudPrompt
        open={iCloudPromptOpen}
        onClose={() => setICloudPromptOpen(false)}
      />
      <BackupPasswordForm onSubmit={onBackup} submitting={isLoading} />
    </Box>
  );
};

export default SignUpBackupPasswordScreen;
