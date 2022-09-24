import { useClerk, useSignIn } from "@clerk/clerk-expo";
import { ClerkAPIError, EmailCodeFactor } from "@clerk/types";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { providers } from "ethers";
import { Box, Button, Skeleton, Text } from "native-base";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useBalance, useFeeData, useProvider } from "wagmi";
import WalletSelector from "../components/WalletSelector/WalletSelector";
import {
  selectEmail,
  selectRecoverTx,
  selectWalletAddress,
} from "../features/wallet/walletSlice";
import formatAmount from "../utils/formatAmount";

const RecoveryRecoverVaultScreen = () => {
  const navigation = useNavigation();
  const walletAddress = useSelector(selectWalletAddress);
  const recoverTx = useSelector(selectRecoverTx);
  const chainId = useMemo(
    () => providers.getNetwork(recoverTx.chain).chainId,
    [recoverTx]
  );
  const email = useSelector(selectEmail);
  const provider = useProvider({ chainId });
  const { signIn } = useSignIn();
  const clerk = useClerk();

  const { data: balance, isLoading: balanceLoading } = useBalance({
    addressOrName: walletAddress,
    chainId,
    watch: true,
  });

  const { data: baseFeePerGas, isLoading: baseFeePerGasLoading } = useQuery(
    ["baseFeePerGas"],
    async () => {
      const block = await provider.getBlock("latest");
      return block.baseFeePerGas;
    },
    { refetchInterval: 5000 }
  );
  const { data: feeData, isLoading: feeDataLoading } = useFeeData();

  const { mutate: signInWithEmail, isLoading: isSigningIn } = useMutation(
    async () => {
      if (!email) throw new Error("No email");
      if (!signIn) throw new Error();

      await clerk.signOut();

      const signInAttempt = await signIn.create({
        identifier: email,
      });

      const emailCodeFactor = signInAttempt.supportedFirstFactors.find(
        ({ strategy }) => strategy === "email_code"
      ) as EmailCodeFactor;

      await signInAttempt.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: emailCodeFactor.emailAddressId,
      });
    },
    { onSuccess: () => navigation.navigate("RecoveryVaultVerifyEmail") }
  );

  const renderBalance = () => {
    if (balanceLoading || !balance) return <Skeleton w="16" h="6" />;

    return (
      <Text variant="subtitle1">
        {formatAmount(balance.value)} {balance.symbol}
      </Text>
    );
  };

  const renderDeployFee = () => {
    if (!feeData?.maxPriorityFeePerGas || !baseFeePerGas) {
      return <Skeleton w="16" h="5" />;
    }

    const gasFee = baseFeePerGas.add(feeData.maxPriorityFeePerGas).mul(200000);

    return (
      <Text variant="subtitle1">
        {formatAmount(gasFee, { precision: 6 })} ETH
      </Text>
    );
  };

  return (
    <Box p="4">
      <Text variant="subtitle1">Complete your vault transfer</Text>
      <Text mb="4">
        This will unlock your vault and transfer it to this device.
      </Text>
      <WalletSelector />
      <Text variant="subtitle2" mt="2">
        Balance:
      </Text>
      {renderBalance()}
      <Text variant="subtitle2" mt="2">
        Network fee:
      </Text>
      {renderDeployFee()}
      <Button
        mt="4"
        isDisabled={
          !baseFeePerGas ||
          !feeData?.maxPriorityFeePerGas ||
          !balance ||
          baseFeePerGas
            .add(feeData.maxPriorityFeePerGas)
            .mul(200000)
            .gt(balance.value)
        }
        onPress={() => signInWithEmail()}
        isLoading={isSigningIn}
      >
        Transfer
      </Button>
    </Box>
  );
};

export default RecoveryRecoverVaultScreen;
