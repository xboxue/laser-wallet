import { StackActions, useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { generateMnemonic } from "bip39";
import Wallet from "ethereumjs-wallet";
import { Box, Text } from "native-base";
import { useState } from "react";
import { useDispatch } from "react-redux";
import BackupPasswordForm from "../components/BackupPasswordForm/BackupPasswordForm";
import EnableICloudPrompt from "../components/EnableICloudPrompt/EnableICloudPrompt";
import { setIsAuthenticated } from "../features/auth/authSlice";
import {
  setOwnerAddress,
  setRecoveryOwnerAddress,
  setWalletAddress,
  setWallets,
} from "../features/wallet/walletSlice";
import { createBackup } from "../services/cloudBackup";
import { createWallets } from "../utils/wallet";

const SignUpBackupPasswordScreen = ({ route }) => {
  const { importedSeedPhrase } = route.params || {};
  const dispatch = useDispatch();
  const [iCloudPromptOpen, setICloudPromptOpen] = useState(false);
  const navigation = useNavigation();

  const { mutate: onBackup, isLoading } = useMutation(
    async (password: string) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      const seedPhrase = importedSeedPhrase || generateMnemonic();
      const { wallets, ownerAddress } = await createWallets(seedPhrase);
      const recoveryOwner = Wallet.generate();

      await createBackup(
        JSON.stringify({
          seedPhrase,
          recoveryOwnerPrivateKey: recoveryOwner.getPrivateKeyString(),
        }),
        password,
        `wallet_${wallets[0].address}_${recoveryOwner.getAddressString()}`
      );

      dispatch(setOwnerAddress(ownerAddress));
      dispatch(setRecoveryOwnerAddress(recoveryOwner.getAddressString()));
      dispatch(setIsAuthenticated(true));
      dispatch(setWalletAddress(wallets[0].address));
      dispatch(setWallets(wallets));
    },
    {
      onSuccess: () => navigation.dispatch(StackActions.replace("Home")),
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
