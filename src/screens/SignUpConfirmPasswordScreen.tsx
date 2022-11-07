import { StackActions, useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import Wallet from "ethereumjs-wallet";
import { Box, Button, FormControl, Input, Text } from "native-base";
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
import { createSafe } from "../services/safe";
import { BigNumber, ethers, utils } from "ethers";
import Constants from "expo-constants";
import { useProvider } from "wagmi";
import { selectChainId } from "../features/network/networkSlice";
import { useCreateVaultMutation } from "../graphql/types";
import { Factory } from "safe-sdk-wrapper";
import waitForTransaction from "../utils/waitForTransaction";
import { useFormik } from "formik";

const SignUpConfirmPasswordScreen = () => {
  const dispatch = useDispatch();
  const [iCloudPromptOpen, setICloudPromptOpen] = useState(false);
  const navigation = useNavigation();
  const chainId = useSelector(selectChainId);
  const provider = useProvider({ chainId });
  const [saveVault] = useCreateVaultMutation();

  const formik = useFormik({
    initialValues: { password: "" },
    onSubmit: ({ password }) => onBackup(password),
    // validate: ({ password, confirmPassword }) => {
    //   const errors = {};
    //   if (!password) errors.password = "Required";
    //   else if (password.length < 8)
    //     errors.password = "Must be at least 8 characters";

    //   if (!confirmPassword) errors.confirmPassword = "Required";
    //   else if (password !== confirmPassword)
    //     errors.confirmPassword = "Passwords don't match";

    //   return errors;
    // },
    validateOnChange: false,
  });

  const { mutate: onBackup, isLoading } = useMutation(
    async (password: string) => {
      const owner = Wallet.generate();
      const recoveryOwner = Wallet.generate();

      // await createBackup(
      //   JSON.stringify({
      //     recoveryOwnerPrivateKey: recoveryOwner.getPrivateKeyString(),
      //   }),
      //   password,
      //   `${BACKUP_PREFIX.VAULT}_${recoveryOwner.getAddressString()}`
      // );

      await setItem("ownerPrivateKey", owner.getPrivateKeyString(), {
        accessControl: ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
        accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      dispatch(setOwnerAddress(owner.getChecksumAddressString()));
      dispatch(
        setRecoveryOwnerAddress(recoveryOwner.getChecksumAddressString())
      );

      const owners = [
        owner.getAddressString(),
        recoveryOwner.getAddressString(),
        Constants.expoConfig.extra.laserGuardianAddress,
      ];
      const safeFactory = await Factory.create(provider);
      const gasLimit = safeFactory.calculateDeploymentGas(owners);
      const saltNonce = BigNumber.from(utils.randomBytes(32));

      const safeAddress = await safeFactory.calculateProxyAddress(
        { owners, threshold: 2 },
        saltNonce
      );
      await saveVault({
        variables: { input: { address: safeAddress, chain_id: chainId } },
      });
      const { relayTransactionHash: hash } = await createSafe(
        owners,
        saltNonce.toString(),
        2,
        gasLimit,
        chainId
      );

      return { hash, safeAddress };
    },
    {
      onSuccess: ({ hash, safeAddress }) =>
        navigation.dispatch(
          StackActions.replace("SignUpCreatingWallet", { hash, safeAddress })
        ),
      onError: (error) => {
        if (error instanceof Error && error.message === "iCloud not available")
          setICloudPromptOpen(true);
      },
    }
  );

  return (
    <Box p="4" height="100%">
      <Text variant="h4" mb="1">
        Confirm your password
      </Text>
      <Text fontSize="lg" mb="10">
        We encrypt your backup so that only you can restore your wallet. Do not
        lose this password.
      </Text>
      <EnableICloudPrompt
        open={iCloudPromptOpen}
        onClose={() => setICloudPromptOpen(false)}
      />

      <FormControl
        isInvalid={formik.touched.password && !!formik.errors.password}
        flex={1}
      >
        <Input
          placeholder="Confirm Password"
          value={formik.values.password}
          onChangeText={formik.handleChange("password")}
          onBlur={formik.handleBlur("password")}
          type="password"
          autoFocus
        />
        <FormControl.ErrorMessage>
          {formik.errors.password}
        </FormControl.ErrorMessage>
      </FormControl>
      <Button
        _text={{ fontSize: "xl" }}
        isLoading={isLoading}
        onPress={formik.handleSubmit}
      >
        Create backup
      </Button>
    </Box>
  );
};

export default SignUpConfirmPasswordScreen;
