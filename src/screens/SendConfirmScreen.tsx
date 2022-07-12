import { useNavigation } from "@react-navigation/native";
import { Box, Button, Skeleton, Stack, Text } from "native-base";
import { useState } from "react";
import { useQuery } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { useFeeData, useProvider } from "wagmi";
import { selectWalletAddress } from "../features/auth/authSlice";
import { selectChainId } from "../features/network/networkSlice";
import { addPendingTransaction } from "../features/transactions/transactionsSlice";
import useLaser from "../hooks/useLaser";
import { sendTransaction } from "../services/wallet";
import formatAddress from "../utils/formatAddress";
import formatAmount from "../utils/formatAmount";

const SendConfirmScreen = ({ route }) => {
  const chainId = useSelector(selectChainId);
  const walletAddress = useSelector(selectWalletAddress);
  const provider = useProvider({ chainId });
  const laser = useLaser();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [sending, setSending] = useState(false);

  const { amount, address: to, token } = route.params;

  const { data: callGas, isLoading: callGasLoading } = useQuery(
    "callGas",
    async () => {
      const transactionInfo = {
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0,
        gasTip: 0,
      };

      const transaction = await (token.isToken
        ? laser.transferERC20(token.address, to, amount, transactionInfo)
        : laser.sendEth(to, amount, transactionInfo));
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

      const { hash } = await sendTransaction({
        transaction,
        sender: walletAddress,
        chainId,
      });
      dispatch(addPendingTransaction({ ...transaction, hash }));

      navigation.navigate("Home", { tab: 1 });
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

      const { hash } = await sendTransaction({
        sender: walletAddress,
        transaction,
        chainId,
      });
      dispatch(addPendingTransaction({ ...transaction, hash }));

      navigation.navigate("Home", { tab: 1 });
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
            <Skeleton w="16" />
          )}
        </Box>
        <Button
          onPress={token.isToken ? transferTokens : sendEth}
          isLoading={sending}
        >
          Confirm
        </Button>
      </Stack>
    </Box>
  );
};

export default SendConfirmScreen;
