import { useNavigation } from "@react-navigation/native";
import { Box } from "native-base";
import { useMutation } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import BackupPasswordForm from "../components/BackupPasswordForm/BackupPasswordForm";
import { setBackupPassword } from "../features/auth/authSlice";
import {
  selectRecoveryOwnerAddress,
  selectRecoveryOwnerPrivateKey,
} from "../features/wallet/walletSlice";
import { createBackup } from "../services/cloudBackup";

const SettingsBackupPasswordScreen = () => {
  const recoveryOwnerAddress = useSelector(selectRecoveryOwnerAddress);
  const recoveryOwnerPrivateKey = useSelector(selectRecoveryOwnerPrivateKey);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { isLoading, mutate: handleSubmit } = useMutation(
    (password: string) => {
      if (!recoveryOwnerAddress || !recoveryOwnerPrivateKey) throw new Error();
      dispatch(setBackupPassword(password));
      return createBackup(
        recoveryOwnerPrivateKey,
        password,
        recoveryOwnerAddress
      );
    },
    {
      onSuccess: () => {
        navigation.goBack();
      },
    }
  );

  return (
    <Box p="4">
      <BackupPasswordForm onSubmit={handleSubmit} submitting={isLoading} />
    </Box>
  );
};

export default SettingsBackupPasswordScreen;
