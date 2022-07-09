import { useNavigation } from "@react-navigation/native";
import { ethers } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { Laser } from "laser-sdk";
import { round } from "lodash";
import { Box, Button, Skeleton, Stack, Text } from "native-base";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useBalance, useFeeData, useProvider } from "wagmi";
import TOKENS from "../constants/tokens";
import {
  selectOwnerPrivateKey,
  selectWalletAddress,
} from "../features/auth/authSlice";
import { selectChainId } from "../features/network/networkSlice";
import useTokenBalances from "../hooks/useTokenBalances";
import { sendTransaction } from "../services/wallet";
import formatAddress from "../utils/formatAddress";
import formatAmount from "../utils/formatAmount";

const SendConfirmScreen = ({ route }) => {
  const chainId = useSelector(selectChainId);
  const tokens = TOKENS.filter(
    (token) => token.chainId === chainId || token.symbol === "ETH"
  );

  const provider = useProvider({ chainId });
  const walletAddress = useSelector(selectWalletAddress);
  const ownerPrivateKey = useSelector(selectOwnerPrivateKey);

  const [sending, setSending] = useState(false);
  const { refetch: refetchBalance } = useBalance({
    addressOrName: walletAddress,
    chainId,
  });
  const { refetch: refetchTokenBalances } = useTokenBalances(
    [walletAddress],
    tokens.map((token) => token.address)
  );

  const { data: feeData, isError, isLoading: loadingFeeData } = useFeeData();

  if (!walletAddress || !ownerPrivateKey) return null;

  const transferTokens = async () => {
    try {
      setSending(true);
      const { amount, address: to, token } = route.params;

      const owner = new ethers.Wallet(ownerPrivateKey);
      const laser = new Laser(provider, owner, walletAddress);

      const feeData = await provider.getFeeData();

      const transaction = await laser.transferERC20(token.address, to, amount, {
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        gasTip: 30000,
      });

      const txData = await sendTransaction({
        transaction,
        sender: walletAddress,
        chainId,
      });
      await provider.waitForTransaction(txData.hash);

      refetchBalance();
      refetchTokenBalances();
      navigation.navigate("Home");
    } finally {
      setSending(false);
    }
  };

  const sendEth = async () => {
    try {
      setSending(true);
      const { amount, address: to } = route.params;

      const owner = new ethers.Wallet(ownerPrivateKey);
      const laser = new Laser(provider, owner, walletAddress);
      const feeData = await provider.getFeeData();

      const transaction = await laser.sendEth(to, amount, {
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        gasTip: 30000,
      });

      const txData = await sendTransaction({
        sender: walletAddress,
        transaction,
        chainId,
      });
      await provider.waitForTransaction(txData.hash);

      refetchBalance();
      refetchTokenBalances();
      navigation.navigate("Home");
    } finally {
      setSending(false);
    }
  };

  const navigation = useNavigation();

  return (
    <Box p="4">
      <Text variant="subtitle1" pb="2">
        Review
      </Text>
      <Stack space="4">
        <Box flexDirection="row" justifyContent="space-between">
          <Text variant="subtitle2">Amount</Text>
          <Text variant="subtitle2">
            {route.params.amount} {route.params.token.symbol}
          </Text>
        </Box>
        <Box flexDirection="row" justifyContent="space-between">
          <Text variant="subtitle2">To</Text>
          <Text variant="subtitle2">{formatAddress(route.params.address)}</Text>
        </Box>
        <Box flexDirection="row" justifyContent="space-between">
          <Text variant="subtitle2">Gas (estimate)</Text>
          {!loadingFeeData &&
          feeData?.maxFeePerGas &&
          feeData?.maxPriorityFeePerGas ? (
            <Text variant="subtitle2">
              {formatAmount(
                feeData.maxFeePerGas
                  .add(feeData.maxPriorityFeePerGas)
                  .mul(21000),
                { precision: 6 }
              )}{" "}
              ETH
            </Text>
          ) : (
            <Skeleton />
          )}
        </Box>
        <Button
          onPress={
            route.params.token.symbol === "ETH" ? sendEth : transferTokens
          }
          isLoading={sending}
        >
          Confirm
        </Button>
      </Stack>
    </Box>
  );
};

export default SendConfirmScreen;
