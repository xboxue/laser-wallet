import { useNavigation } from "@react-navigation/native";
import { Box } from "native-base";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import BackupPasswordForm from "../components/BackupPasswordForm/BackupPasswordForm";
import EnableICloudPrompt from "../components/EnableICloudPrompt/EnableICloudPrompt";
import { setBackupPassword } from "../features/auth/authSlice";
import {
  selectRecoveryOwnerAddress,
  selectRecoveryOwnerPrivateKey,
  selectWallets,
} from "../features/wallet/walletSlice";
import { createBackup } from "../services/cloudBackup";

const SettingsBackupPasswordScreen = () => {
  const recoveryOwnerAddress = useSelector(selectRecoveryOwnerAddress);
  const recoveryOwnerPrivateKey = useSelector(selectRecoveryOwnerPrivateKey);
  const wallets = useSelector(selectWallets);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [iCloudPromptOpen, setICloudPromptOpen] = useState(false);

  const { isLoading, mutate: handleSubmit } = useMutation(
    (password: string) => {
      if (!recoveryOwnerAddress || !recoveryOwnerPrivateKey) throw new Error();
      dispatch(setBackupPassword(password));
      return createBackup(
        JSON.stringify({ privateKey: recoveryOwnerPrivateKey, wallets }),
        password,
        recoveryOwnerAddress
      );
    },
    {
      onSuccess: () => {
        navigation.goBack();
      },
      onError: (error) => {
        if (error instanceof Error && error.message === "iCloud not available")
          setICloudPromptOpen(true);
      },
    }
  );

  return (
    <Box p="4">
      <EnableICloudPrompt
        open={iCloudPromptOpen}
        onClose={() => setICloudPromptOpen(false)}
      />
      <BackupPasswordForm onSubmit={handleSubmit} submitting={isLoading} />
    </Box>
  );
};

export default SettingsBackupPasswordScreen;
