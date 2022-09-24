import { useAuth } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { BigNumber, providers, Wallet } from "ethers";
import * as SecureStore from "expo-secure-store";
import { Laser } from "laser-sdk";
import { bundleTransactions } from "laser-sdk/dist/utils";
import { Box, Text, useToast } from "native-base";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useProvider } from "wagmi";
import EmailCodeForm from "../components/EmailCodeForm.tsx/EmailCodeForm";
import ToastAlert from "../components/ToastAlert/ToastAlert";
import { setChainId } from "../features/network/networkSlice";
import { addPendingTransaction } from "../features/transactions/transactionsSlice";
import {
  selectRecoverTx,
  selectWalletAddress,
} from "../features/wallet/walletSlice";
import { signTransaction } from "../services/vault";

const RecoveryVaultVerifyEmailScreen = () => {
  const navigation = useNavigation();
  const toast = useToast();
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const recoverTx = useSelector(selectRecoverTx);
  const walletAddress = useSelector(selectWalletAddress);

  const chainId = useMemo(
    () => providers.getNetwork(recoverTx.chain).chainId,
    [recoverTx]
  );
  const provider = useProvider({ chainId });

  const { mutate: recoverVault, isLoading: isRecovering } = useMutation(
    async () => {
      if (!recoverTx) throw new Error("No recover transaction");

      const privateKeys = await SecureStore.getItemAsync("privateKeys", {
        requireAuthentication: true,
      });
      if (!privateKeys) throw new Error("No private key");

      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const signatures = await signTransaction(recoverTx, token);
      const newTx = {
        ...recoverTx,
        value: BigNumber.from(recoverTx.value),
        nonce: BigNumber.from(recoverTx.nonce),
      };

      const tx = bundleTransactions(newTx, {
        ...newTx,
        signatures,
        signer: "guardian",
      });

      const sender = new Wallet(
        JSON.parse(privateKeys)[walletAddress],
        provider
      );
      const laser = new Laser(provider, sender, tx.wallet);
      return laser.execTransaction(tx, sender, 200000);
    },
    {
      onSuccess: (transaction) => {
        toast.show({
          render: () => (
            <ToastAlert status="success" title="Transaction sent" />
          ),
        });
        dispatch(setChainId(chainId));
        dispatch(
          addPendingTransaction({ ...transaction, isRecoverVault: true })
        );
        navigation.navigate("Home", { tab: 1 });
      },
    }
  );

  return (
    <Box p="4">
      <Text variant="subtitle1">Confirm transaction</Text>
      <Text mb="4">
        Please enter the verification code we sent to your email.
      </Text>
      <EmailCodeForm
        onSubmit={() => recoverVault()}
        isSubmitting={isRecovering}
      />
    </Box>
  );
};

export default RecoveryVaultVerifyEmailScreen;
