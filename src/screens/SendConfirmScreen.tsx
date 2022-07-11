import { useNavigation } from "@react-navigation/native";
import { ethers } from "ethers";
import { Laser } from "laser-sdk";
import { Box, Button, Skeleton, Stack, Text } from "native-base";
import { useState } from "react";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { useBalance, useFeeData, useProvider } from "wagmi";
import TOKENS from "../constants/tokens";
import { selectWalletAddress } from "../features/auth/authSlice";
import { selectChainId } from "../features/network/networkSlice";
import useLaser from "../hooks/useLaser";
import useTokenBalances from "../hooks/useTokenBalances";
import { sendTransaction } from "../services/wallet";
import formatAddress from "../utils/formatAddress";
import formatAmount from "../utils/formatAmount";

const SendConfirmScreen = ({ route }) => {
  const chainId = useSelector(selectChainId);
  const walletAddress = useSelector(selectWalletAddress);
  const provider = useProvider({ chainId });
  const laser = useLaser();
  const navigation = useNavigation();

  const [sending, setSending] = useState(false);

  const tokens = TOKENS.filter(
    (token) => token.chainId === chainId || token.symbol === "ETH"
  );

  const { refetch: refetchBalance } = useBalance({
    addressOrName: walletAddress,
    chainId,
  });
  const { refetch: refetchTokenBalances } = useTokenBalances(
    [walletAddress],
    tokens.map((token) => token.address)
  );

  const { amount, address: to, token } = route.params;

  const { data: callGas, isLoading: callGasLoading } = useQuery(
    "callGas",
    async () => {
      const transactionInfo = {
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0,
        gasTip: 0,
      };

      const transaction = await (token === "ETH"
        ? laser.sendEth(to, amount, transactionInfo)
        : laser.transferERC20(token.address, to, amount, transactionInfo));
      return laser.simulateTransaction(transaction);
    }
  );

  const { data: feeData, isError, isLoading: loadingFeeData } = useFeeData();

  const transferTokens = async () => {
    try {
      setSending(true);
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

  return (
    <Box p="4">
      <Text variant="subtitle1" pb="2">
        Review
      </Text>
      <Stack space="4">
        <Box flexDirection="row" justifyContent="space-between">
          <Text variant="subtitle2">Amount</Text>
          <Text variant="subtitle2">
            {amount} {token.symbol}
          </Text>
        </Box>
        <Box flexDirection="row" justifyContent="space-between">
          <Text variant="subtitle2">To</Text>
          <Text variant="subtitle2">{formatAddress(to)}</Text>
        </Box>
        <Box flexDirection="row" justifyContent="space-between">
          <Text variant="subtitle2">Gas (estimate)</Text>
          {!loadingFeeData &&
          !callGasLoading &&
          callGas &&
          feeData?.maxFeePerGas &&
          feeData?.maxPriorityFeePerGas ? (
            <Text variant="subtitle2">
              {formatAmount(
                feeData.maxFeePerGas
                  .add(feeData.maxPriorityFeePerGas)
                  .mul(callGas),
                { precision: 6 }
              )}{" "}
              ETH
            </Text>
          ) : (
            <Skeleton />
          )}
        </Box>
        <Button
          onPress={token.symbol === "ETH" ? sendEth : transferTokens}
          isLoading={sending}
        >
          Confirm
        </Button>
      </Stack>
    </Box>
  );
};

export default SendConfirmScreen;
