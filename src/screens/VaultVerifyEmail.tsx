import { useAuth, useClerk, useSignIn } from "@clerk/clerk-expo";
import { ClerkAPIError } from "@clerk/types";
import Safe from "@gnosis.pm/safe-core-sdk";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import SafeServiceClient from "@gnosis.pm/safe-service-client";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { constants, ethers, providers } from "ethers";
import { getAddress, parseEther, parseUnits } from "ethers/lib/utils";
import Constants from "expo-constants";
import { useFormik } from "formik";
import { Input, useToast } from "native-base";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import { Erc20__factory } from "../abis/types";
import ErrorDialog from "../components/ErrorDialog/ErrorDialog";
import SignUpLayout from "../components/SignUpLayout/SignUpLayout";
import ToastAlert from "../components/ToastAlert/ToastAlert";
import { selectChainId } from "../features/network/networkSlice";
import { addPendingTransaction } from "../features/transactions/transactionsSlice";
import { selectWalletAddress } from "../features/wallet/walletSlice";
import { signTransaction } from "../services/guardian";
import { getItem } from "../services/keychain";
import { sendTransaction } from "../services/relayer";
import { getTransactionServiceUrl } from "../services/safe";

const VaultVerifyEmail = ({ route }) => {
  const navigation = useNavigation();
  const toast = useToast();
  const dispatch = useDispatch();
  const walletAddress = useSelector(selectWalletAddress);
  const chainId = useSelector(selectChainId);
  const { amount, address: to, token } = route.params;
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useSignIn();
  const clerk = useClerk();
  const { getToken } = useAuth();

  const { mutate: verifySignInCode, isLoading: isVerifyingSignIn } =
    useMutation(
      async (code: string) => {
        if (!signIn) throw new Error();
        const signInAttempt = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code,
        });
        if (signInAttempt.status !== "complete") {
          throw new Error("Email verification failed");
        }
        await clerk.setSession(signInAttempt.createdSessionId);
      },
      {
        onSuccess: () => executeTx(),
        onError: (error) => {
          const clerkError = error?.errors?.[0] as ClerkAPIError;
          if (clerkError?.longMessage) setError(clerkError.longMessage);
        },
        meta: { disableErrorToast: true },
      }
    );

  // const onSend = ({ hash, infuraHash }) => {
  //   toast.show({
  //     render: () => <ToastAlert status="success" title="Transaction sent" />,
  //     duration: 2000,
  //   });
  //   dispatch(addPendingTransaction({ hash, infuraHash }));
  //   navigation.navigate("Activity");
  // };

  const { mutate: executeTx, isLoading: isExecuting } = useMutation(
    async () => {
      const ownerPrivateKey = await getItem("ownerPrivateKey");
      if (!ownerPrivateKey) throw new Error("No owner private key");

      const authToken = await getToken();
      if (!authToken) throw new Error("Not authenticated");

      const provider = new providers.InfuraProvider(
        chainId,
        Constants.manifest.extra.infuraApiKey
      );

      let tx: { to: string; value: string; data: string };

      // TODO: Refactor
      if (token.contractAddress === constants.AddressZero) {
        tx = { to, value: parseEther(amount).toString(), data: "0x" };
      } else {
        const erc20 = Erc20__factory.connect(token.contractAddress, provider);
        tx = {
          to: getAddress(token.contractAddress),
          value: "0",
          data: erc20.interface.encodeFunctionData("transfer", [
            to,
            parseUnits(amount, token.decimals),
          ]),
        };
      }

      const owner = new ethers.Wallet(ownerPrivateKey, provider);
      const ethAdapter = new EthersAdapter({
        ethers,
        signer: owner,
      });
      const safeSdk = await Safe.create({
        ethAdapter,
        safeAddress: walletAddress,
      });
      const safeTransaction = await safeSdk.createTransaction({
        safeTransactionData: {
          ...tx,
          gasPrice: parseEther("100").toString(),
          refundReceiver: Constants.manifest.extra.relayerAddress,
        },
      });
      const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
      const senderSignature = await safeSdk.signTransactionHash(safeTxHash);

      const safeService = new SafeServiceClient({
        txServiceUrl: getTransactionServiceUrl(chainId),
        ethAdapter,
      });

      await safeService.proposeTransaction({
        safeAddress: walletAddress,
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress: owner.address,
        senderSignature: senderSignature.data,
      });

      await signTransaction({ hash: safeTxHash, chainId, token: authToken });

      const { relayTransactionHash } = await sendTransaction({
        safeTxHash,
        chainId,
      });

      return relayTransactionHash;
    },
    {
      onSuccess: (hash) => {
        toast.show({
          render: () => (
            <ToastAlert status="success" title="Transaction sent" />
          ),
          duration: 2000,
        });
        dispatch(addPendingTransaction({ hash }));
        navigation.navigate("Activity");
      },
    }
  );

  const formik = useFormik({
    initialValues: { code: "" },
    onSubmit: (values) => {
      // verifySignInCode(values.code);
      executeTx();
    },
    validationSchema: yup.object().shape({
      code: yup.string().required("Required"),
    }),
    validateOnMount: true,
  });

  return (
    <SignUpLayout
      title="Enter your confirmation code"
      subtitle="Please enter the confirmation code we sent to your email."
      onNext={formik.handleSubmit}
      isLoading={isVerifyingSignIn || isExecuting}
      isDisabled={!formik.isValid}
    >
      <ErrorDialog
        isOpen={!!error}
        onClose={() => setError(null)}
        title="Your email address couldn't be verified."
        subtitle={error}
      />
      <Input
        placeholder="Confirmation Code"
        value={formik.values.code}
        onChangeText={formik.handleChange("code")}
        onBlur={formik.handleBlur("code")}
        keyboardType="number-pad"
        autoFocus
      />
    </SignUpLayout>
  );
};

export default VaultVerifyEmail;
