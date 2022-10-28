import { StackActions, useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import Wallet from "ethereumjs-wallet";
import { Box, Text } from "native-base";
import { useState } from "react";
import { ACCESSIBLE, ACCESS_CONTROL } from "react-native-keychain";
import { useDispatch, useSelector } from "react-redux";
import BackupPasswordForm from "../components/BackupPasswordForm/BackupPasswordForm";
import EnableICloudPrompt from "../components/EnableICloudPrompt/EnableICloudPrompt";
import { setIsAuthenticated } from "../features/auth/authSlice";
import {
  setOwnerAddress,
  setRecoveryOwnerAddress,
  setVaultAddress,
  setWalletAddress,
  setWallets,
} from "../features/wallet/walletSlice";
import { createBackup } from "../services/cloudBackup";
import { setItem } from "../services/keychain";
import { createWallets } from "../utils/wallet";
import { BACKUP_PREFIX } from "../constants/backups";
import {
  createSafe,
  getSafeCreationData,
  getSafeCreationTx,
} from "../services/safe";
import { BigNumber, ethers, utils } from "ethers";
import Constants from "expo-constants";
import { useProvider } from "wagmi";
import { selectChainId } from "../features/network/networkSlice";
import { useCreateVaultMutation } from "../graphql/types";

const SignUpBackupPasswordScreen = () => {
  const dispatch = useDispatch();
  const [iCloudPromptOpen, setICloudPromptOpen] = useState(false);
  const navigation = useNavigation();
  const chainId = useSelector(selectChainId);
  const provider = useProvider({ chainId });
  const [saveVault] = useCreateVaultMutation();

  const { mutate: onBackup, isLoading } = useMutation(
    async (password: string) => {
      const owner = Wallet.generate();
      const recoveryOwner = Wallet.generate();

      await createBackup(
        JSON.stringify({
          recoveryOwnerPrivateKey: recoveryOwner.getPrivateKeyString(),
        }),
        password,
        `${BACKUP_PREFIX.VAULT}_${recoveryOwner.getAddressString()}`
      );

      await setItem("ownerPrivateKey", owner.getPrivateKeyString(), {
        accessControl: ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
        accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      dispatch(setOwnerAddress(owner.getChecksumAddressString()));
      dispatch(
        setRecoveryOwnerAddress(recoveryOwner.getChecksumAddressString())
      );
      const data = await getSafeCreationData(
        [
          owner.getChecksumAddressString(),
          recoveryOwner.getChecksumAddressString(),
          Constants.expoConfig.extra.laserGuardianAddress,
        ],
        BigNumber.from(utils.randomBytes(32)).toString(),
        2
      );
      await createSafe(data.safe);
      await saveVault({
        variables: { input: { address: data.safe, chain_id: chainId } },
      });

      let hash = (await getSafeCreationTx(data.safe)).txHash;
      while (!hash) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        hash = (await getSafeCreationTx(data.safe)).txHash;
      }
      await provider.waitForTransaction(hash);
      dispatch(setWalletAddress(data.safe));
      dispatch(setIsAuthenticated(true));
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
