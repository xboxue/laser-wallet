import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { providers } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { Box, Button, Skeleton, Stack, Text, useToast } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { useFeeData, useProvider } from "wagmi";
import { Erc20__factory } from "../abis/types";
import ToastAlert from "../components/ToastAlert/ToastAlert";
import { selectChainId } from "../features/network/networkSlice";
import { addPendingTransaction } from "../features/transactions/transactionsSlice";
import { selectWalletAddress } from "../features/wallet/walletSlice";
import useSendEth from "../hooks/useSendEth";
import useSendToken from "../hooks/useSendToken";
import formatAddress from "../utils/formatAddress";
import formatAmount from "../utils/formatAmount";

const SendConfirmScreen = ({ route }) => {
  const chainId = useSelector(selectChainId);
  const walletAddress = useSelector(selectWalletAddress);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const toast = useToast();
  const provider = useProvider({ chainId });

  const onSuccess = (transaction: providers.TransactionResponse) => {
    toast.show({
      render: () => <ToastAlert status="success" title="Transaction sent" />,
    });
    dispatch(addPendingTransaction(transaction));
    navigation.navigate("Home", { tab: 1 });
  };

  const { mutate: sendEth, isLoading: isSendingEth } = useSendEth({
    onSuccess,
  });
  const { mutate: sendToken, isLoading: isSendingToken } = useSendToken({
    onSuccess,
  });

  const { amount, address: to, ensName, token } = route.params;

  const { data: baseFeePerGas, isLoading: baseFeePerGasLoading } = useQuery(
    ["baseFeePerGas"],
    async () => {
      const block = await provider.getBlock("latest");
      return block.baseFeePerGas;
    },
    { refetchInterval: 5000 }
  );
  const { data: feeData, isLoading: feeDataLoading } = useFeeData();

  const { data: gasEstimate, isLoading: gasEstimateLoading } = useQuery(
    ["gasEstimate", amount, to, token],
    async () => {
      if (token.isToken) {
        const erc20 = Erc20__factory.connect(token.address, provider);
        return erc20.estimateGas.transfer(
          to,
          parseUnits(amount, token.decimals),
          { from: walletAddress }
        );
      }
      return provider.estimateGas({
        from: walletAddress,
        to,
        value: parseEther(amount),
      });
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
          onPress={() => {
            if (token.isToken) return sendToken({ to, amount, token });
            return sendEth({ to, amount });
          }}
          isLoading={isSendingEth || isSendingToken}
          isDisabled={gasEstimateLoading}
        >
          Confirm
        </Button>
      </Stack>
    </Box>
  );
};

export default SendConfirmScreen;
