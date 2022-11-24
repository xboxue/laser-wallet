import { PredictSafeProps, SafeFactory } from "@gnosis.pm/safe-core-sdk";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import { useMutation } from "@tanstack/react-query";
import Wallet from "ethereumjs-wallet";
import { BigNumber, ethers, providers, utils } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import Constants from "expo-constants";
import { useFormik } from "formik";
import { Input } from "native-base";
import { useState } from "react";
import { ACCESSIBLE, ACCESS_CONTROL } from "react-native-keychain";
import { useDispatch, useSelector } from "react-redux";
import EnableICloudPrompt from "../components/EnableICloudPrompt/EnableICloudPrompt";
import SignUpLayout from "../components/SignUpLayout/SignUpLayout";
import { BACKUP_PREFIX } from "../constants/backups";
import { selectChainId } from "../features/network/networkSlice";
import {
  selectTrustedOwnerAddress,
  setOwnerAddress,
  setRecoveryOwnerAddress,
  setSafeConfig,
  setWalletAddress,
} from "../features/wallet/walletSlice";
import { useCreateVaultMutation } from "../graphql/types";
import { createBackup } from "../services/cloudBackup";
import { setItem } from "../services/keychain";

const DEPLOY_GAS_PRICE = parseUnits("15", "gwei");
const DEPLOY_GAS_ESTIMATE = 300000;

const SignUpConfirmPasswordScreen = ({ route }) => {
  const dispatch = useDispatch();
  const chainId = useSelector(selectChainId);
  const [iCloudPromptOpen, setICloudPromptOpen] = useState(false);
  const [saveVault] = useCreateVaultMutation();
  const trustedOwnerAddress = useSelector(selectTrustedOwnerAddress);

  const formik = useFormik({
    initialValues: { password: "" },
    onSubmit: ({ password }) => onBackup(password),
    validate: ({ password }) => {
      const errors = {};
      if (password !== route.params.password)
        errors.password = "Incorrect password";
      return errors;
    },
    validateOnMount: true,
  });

  const { mutate: onBackup, isLoading } = useMutation(
    async (password: string) => {
      const provider = new providers.InfuraProvider(
        chainId,
        Constants.manifest.extra.infuraApiKey
      );

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
      dispatch(setOwnerAddress(owner.getAddressString()));
      dispatch(setRecoveryOwnerAddress(recoveryOwner.getAddressString()));

      const ethAdapter = new EthersAdapter({
        ethers,
        signer: new ethers.Wallet(
          "0x0f4eb853643472a57e6be53f6e93743fd41faa96910ff62ffd18ff52efe76dc6",
          provider
        ),
      });

      const safeFactory = await SafeFactory.create({ ethAdapter });

      const owners = [
        owner.getAddressString(),
        recoveryOwner.getAddressString(),
        Constants.expoConfig.extra.laserGuardianAddress,
        ...(trustedOwnerAddress ? [trustedOwnerAddress] : []),
      ];

      const saltNonce = BigNumber.from(utils.randomBytes(32)).toString();

      const safeConfig: PredictSafeProps = {
        safeAccountConfig: {
          owners,
          threshold: 2,
          payment: DEPLOY_GAS_PRICE.mul(DEPLOY_GAS_ESTIMATE).toString(),
          paymentReceiver: Constants.expoConfig.extra.relayerAddress,
        },
        safeDeploymentConfig: {
          saltNonce,
        },
      };

      const gasEstimate = await safeFactory.estimateDeploySafeGas(safeConfig);

      safeConfig.safeAccountConfig.payment =
        DEPLOY_GAS_PRICE.mul(gasEstimate).toString();

      const safeAddress = await safeFactory.predictSafeAddress(safeConfig);

      dispatch(setSafeConfig(safeConfig));
      dispatch(setWalletAddress(safeAddress));
    },
    {
      onError: (error) => {
        if (error instanceof Error && error.message === "iCloud not available")
          setICloudPromptOpen(true);
      },
    }
  );

  return (
    <SignUpLayout
      title="Confirm your password"
      subtitle="We encrypt your backup so that only you can restore your wallet. Do not lose this password."
      isLoading={isLoading}
      onNext={formik.handleSubmit}
      nextText="Create backup"
      isDisabled={!formik.isValid}
    >
      <EnableICloudPrompt
        open={iCloudPromptOpen}
        onClose={() => setICloudPromptOpen(false)}
      />

      <Input
        placeholder="Confirm Password"
        value={formik.values.password}
        onChangeText={formik.handleChange("password")}
        onBlur={formik.handleBlur("password")}
        type="password"
        autoFocus
      />
    </SignUpLayout>
  );
};

export default SignUpConfirmPasswordScreen;
