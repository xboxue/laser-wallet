import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import Wallet from "ethereumjs-wallet";
import { ethers } from "ethers";
import { LaserFactory } from "laser-sdk";
import { random } from "lodash";
import { Box, Text } from "native-base";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useProvider } from "wagmi";
import BackupPasswordForm from "../components/BackupPasswordForm/BackupPasswordForm";
import EnableICloudPrompt from "../components/EnableICloudPrompt/EnableICloudPrompt";
import {
  setBackupPassword,
  setIsAuthenticated,
} from "../features/auth/authSlice";
import { selectGuardianAddresses } from "../features/guardians/guardiansSlice";
import { selectChainId } from "../features/network/networkSlice";
import {
  setOwnerAddress,
  setOwnerPrivateKey,
  setRecoveryOwnerAddress,
  setRecoveryOwnerPrivateKey,
  setSalt,
  setWalletAddress,
} from "../features/wallet/walletSlice";
import { createBackup } from "../services/cloudBackup";

const SignUpBackupPasswordScreen = () => {
  const dispatch = useDispatch();
  const [iCloudPromptOpen, setICloudPromptOpen] = useState(false);
  const guardianAddresses = useSelector(selectGuardianAddresses);
  const chainId = useSelector(selectChainId);
  const provider = useProvider({ chainId });
  const navigation = useNavigation();

  const { mutate: onBackup, isLoading } = useMutation(
    async (password: string) => {
      const owner = Wallet.generate();
      const recoveryOwner = Wallet.generate();
      const factory = new LaserFactory(
        provider,
        new ethers.Wallet(owner.getPrivateKeyString())
      );
      const salt = random(0, 1000000);

      const walletAddress = await factory.preComputeAddress(
        owner.getAddressString(),
        [recoveryOwner.getAddressString()],
        guardianAddresses,
        salt
      );

      await createBackup(
        recoveryOwner.getPrivateKeyString(),
        password,
        recoveryOwner.getAddressString()
      );

      dispatch(setBackupPassword(password));
      dispatch(setIsAuthenticated(true));
      dispatch(setSalt(salt));
      dispatch(setWalletAddress(walletAddress));
      dispatch(setOwnerPrivateKey(owner.getPrivateKeyString()));
      dispatch(setRecoveryOwnerAddress(recoveryOwner.getAddressString()));
      dispatch(setRecoveryOwnerPrivateKey(recoveryOwner.getPrivateKeyString()));
      dispatch(setOwnerAddress(owner.getAddressString()));
      navigation.navigate("SignUpDeployWallet");
    },
    {
      onError: (error) => {
        if (error instanceof Error && error.message === "iCloud not available")
          setICloudPromptOpen(true);
      },
    }
  );

  return (
    <Box p="4">
      <Text variant="subtitle1">Create password</Text>
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
