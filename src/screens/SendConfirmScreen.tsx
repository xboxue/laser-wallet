import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { Box, Button, Skeleton, Stack, Text, useToast } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { useFeeData, useProvider } from "wagmi";
import ToastAlert from "../components/ToastAlert/ToastAlert";
import { selectChainId } from "../features/network/networkSlice";
import { addPendingTransaction } from "../features/transactions/transactionsSlice";
import { selectWalletAddress } from "../features/wallet/walletSlice";
import useLaser from "../hooks/useLaser";
import { sendTransaction } from "../services/wallet";
import formatAddress from "../utils/formatAddress";
import formatAmount from "../utils/formatAmount";

const SendConfirmScreen = ({ route }) => {
  const chainId = useSelector(selectChainId);
  const walletAddress = useSelector(selectWalletAddress);
  const laser = useLaser();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const toast = useToast();
  const provider = useProvider({ chainId });

  const { amount, address: to, ensName, token } = route.params;

  const { data: baseFeePerGas, isLoading: baseFeePerGasLoading } = useQuery(
    ["baseFeePerGas"],
    async () => {
      const block = await provider.getBlock("latest");
      return block.baseFeePerGas;
    },
    { refetchInterval: 1000 }
  );

  const { data: gasEstimate, isLoading: gasEstimateLoading } = useQuery(
    ["gasEstimate", amount, to, token],
    async () => {
      const txInfo = {
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0,
        gasLimit: 1000000,
        relayer: Constants.expoConfig.extra.relayerAddress,
      };

      const transaction = await (token.isToken
        ? laser.transferERC20(token.address, to, amount, txInfo)
        : laser.sendEth(to, amount, txInfo));
      return laser.estimateLaserGas(transaction);
    }
  );

  const { data: feeData, isLoading: feeDataLoading } = useFeeData();

  const { mutate: transferTokens, isLoading: sendingTokens } = useMutation(
    async () => {
      if (!gasEstimate)
        throw new Error("Unable to estimate gas. Please try again.");
      const transaction = await laser.transferERC20(token.address, to, amount, {
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0,
        gasLimit: gasEstimate.add(20000),
        relayer: Constants.expoConfig.extra.relayerAddress,
      });
      const hash = await sendTransaction({
        transaction,
        sender: walletAddress,
        chainId,
      });
      return { ...transaction, hash };
    },
    {
      onSuccess: (transaction) => {
        toast.show({
          render: () => (
            <ToastAlert status="success" title="Transaction sent" />
          ),
        });
        dispatch(addPendingTransaction(transaction));
        navigation.navigate("Home", { tab: 1 });
      },
    }
  );

  const { mutate: sendEth, isLoading: sendingEth } = useMutation(
    async () => {
      if (!gasEstimate)
        throw new Error("Unable to estimate gas. Please try again.");
      const transaction = await laser.sendEth(to, amount, {
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0,
        gasLimit: gasEstimate.add(20000),
        relayer: Constants.expoConfig.extra.relayerAddress,
      });
      const hash = await sendTransaction({
        sender: walletAddress,
        transaction,
        chainId,
      });
      return { ...transaction, hash };
    },
    {
      onSuccess: (transaction) => {
        toast.show({
          render: () => (
            <ToastAlert status="success" title="Transaction sent" />
          ),
        });
        dispatch(addPendingTransaction(transaction));
        navigation.navigate("Home", { tab: 1 });
      },
    }
  );

  const renderGasFee = () => {
    if (
      feeDataLoading ||
      !feeData?.maxPriorityFeePerGas ||
      baseFeePerGasLoading ||
      !baseFeePerGas ||
      gasEstimateLoading ||
      !gasEstimate
    ) {
      return <Skeleton w="16" h="5" />;
    }

    const gasFee = baseFeePerGas
      .add(feeData.maxPriorityFeePerGas)
      .mul(gasEstimate);

    return (
      <Text variant="subtitle2">
        {formatAmount(gasFee, { precision: 6 })} ETH
      </Text>
    );
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
          <Text variant="subtitle2">{ensName || formatAddress(to)}</Text>
        </Box>
        <Box flexDirection="row" justifyContent="space-between">
          <Text variant="subtitle2">Network fee (estimate)</Text>
          {renderGasFee()}
        </Box>
        <Button
          onPress={token.isToken ? transferTokens : sendEth}
          isLoading={sendingEth || sendingTokens}
        >
          Confirm
        </Button>
      </Stack>
    </Box>
  );
};

export default SendConfirmScreen;
