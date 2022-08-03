import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { Box, Button, Skeleton, Stack, Text } from "native-base";
import { useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { useFeeData } from "wagmi";
import { selectChainId } from "../features/network/networkSlice";
import { addPendingTransaction } from "../features/transactions/transactionsSlice";
import { selectWalletAddress } from "../features/wallet/walletSlice";
import useLaser from "../hooks/useLaser";
import { sendTransaction } from "../services/wallet";
import formatAddress from "../utils/formatAddress";
import formatAmount from "../utils/formatAmount";

// TODO: Estimate this with simulation
const GAS_LIMIT = 300000;

const SendConfirmScreen = ({ route }) => {
  const chainId = useSelector(selectChainId);
  const walletAddress = useSelector(selectWalletAddress);
  const laser = useLaser();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { amount, address: to, ensName, token } = route.params;

  // const { data: callGas, isLoading: callGasLoading } = useQuery(
  //   "callGas",
  //   async () => {
  //     const transactionInfo = {
  //       maxFeePerGas: 0,
  //       maxPriorityFeePerGas: 0,
  //       gasTip: 0,
  //     };

  //     const transaction = await (token.isToken
  //       ? laser.transferERC20(token.address, to, amount, transactionInfo)
  //       : laser.sendEth(to, amount, transactionInfo));
  //     return laser.simulateTransaction(transaction);
  //   }
  // );

  const { data: feeData, isError, isLoading: loadingFeeData } = useFeeData();

  const { mutate: transferTokens, isLoading: sendingTokens } = useMutation(
    async () => {
      const transaction = await laser.transferERC20(token.address, to, amount, {
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0,
        gasLimit: GAS_LIMIT,
        relayer: Constants.manifest?.extra?.relayerAddress,
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
        dispatch(addPendingTransaction(transaction));
        navigation.navigate("Home", { tab: 1 });
      },
    }
  );

  const { mutate: sendEth, isLoading: sendingEth } = useMutation(
    async () => {
      const transaction = await laser.sendEth(to, amount, {
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0,
        gasLimit: GAS_LIMIT,
        relayer: Constants.manifest?.extra?.relayerAddress,
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
        dispatch(addPendingTransaction(transaction));
        navigation.navigate("Home", { tab: 1 });
      },
    }
  );

  const renderGasEstimate = () => {
    if (
      loadingFeeData ||
      !feeData?.maxFeePerGas ||
      !feeData?.maxPriorityFeePerGas
    ) {
      return <Skeleton w="16" />;
    }

    const gasEstimate = feeData.maxFeePerGas
      .add(feeData.maxPriorityFeePerGas)
      .mul(GAS_LIMIT);

    return (
      <Text variant="subtitle2">
        {formatAmount(gasEstimate, { precision: 6 })} ETH
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
          <Text variant="subtitle2">Gas (estimate)</Text>
          {renderGasEstimate()}
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
