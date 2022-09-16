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
import { setWalletAddress } from "../features/wallet/walletSlice";
import { createBackup } from "../services/cloudBackup";
import * as SecureStore from "expo-secure-store";

const VaultBackupPasswordScreen = () => {
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
      const salt = random(0, 1000000);

      await SecureStore.setItemAsync(
        "ownerPrivateKey",
        owner.getPrivateKeyString()
      );

      const factory = new LaserFactory(
        provider,
        new ethers.Wallet(owner.getPrivateKeyString()),
        new ethers.Wallet(owner.getPrivateKeyString())
      );

      const vaultAddress = await factory.preComputeAddress(
        owner.getAddressString(),
        [recoveryOwner.getAddressString()],
        guardianAddresses,
        salt
      );

      await createBackup(
        JSON.stringify({
          privateKey: recoveryOwner.getPrivateKeyString(),
          wallets: [{ address: vaultAddress, chainId }],
        }),
        password,
        recoveryOwner.getAddressString()
      );
      navigation.navigate("SignUpDeployWallet", {
        recoveryOwnerAddress: recoveryOwner.getAddressString(),
        salt,
      });
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
      <Text variant="subtitle1">Create backup password</Text>
      <Text mb="4">
        We encrypt your recovery key backup so that only you can restore your
        wallet. Do not lose this password.
      </Text>
      <EnableICloudPrompt
        open={iCloudPromptOpen}
        onClose={() => setICloudPromptOpen(false)}
      />
      <BackupPasswordForm onSubmit={onBackup} submitting={isLoading} />
    </Box>
  );
};

export default VaultBackupPasswordScreen;