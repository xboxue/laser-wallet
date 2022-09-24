import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import Wallet from "ethereumjs-wallet";
import { ethers } from "ethers";
import * as SecureStore from "expo-secure-store";
import { LaserFactory } from "laser-sdk";
import { random } from "lodash";
import { Box, Text } from "native-base";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useProvider } from "wagmi";
import BackupPasswordForm from "../components/BackupPasswordForm/BackupPasswordForm";
import EnableICloudPrompt from "../components/EnableICloudPrompt/EnableICloudPrompt";
import { selectGuardianAddresses } from "../features/guardians/guardiansSlice";
import { selectChainId } from "../features/network/networkSlice";
import { createBackup } from "../services/cloudBackup";

const VaultBackupPasswordScreen = () => {
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
        }),
        password,
        `vault_${recoveryOwner.getAddressString()}`
      );
      navigation.navigate("SignUpDeployWallet", {
        recoveryOwnerAddress: recoveryOwner.getAddressString(),
        salt,
        vaultAddress,
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
