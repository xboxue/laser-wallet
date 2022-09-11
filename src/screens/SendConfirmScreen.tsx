import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Contract, ethers } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import * as SecureStore from "expo-secure-store";
import { Box, Button, Skeleton, Stack, Text, useToast } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { erc20ABI, useFeeData, useProvider } from "wagmi";
import ToastAlert from "../components/ToastAlert/ToastAlert";
import { selectChainId } from "../features/network/networkSlice";
import { addPendingTransaction } from "../features/transactions/transactionsSlice";
import { selectWalletAddress } from "../features/wallet/walletSlice";
import formatAddress from "../utils/formatAddress";
import formatAmount from "../utils/formatAmount";

const SendConfirmScreen = ({ route }) => {
  const chainId = useSelector(selectChainId);
  const walletAddress = useSelector(selectWalletAddress);
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
    { refetchInterval: 5000 }
  );
  const { data: feeData, isLoading: feeDataLoading } = useFeeData();

  const { data: gasEstimate, isLoading: gasEstimateLoading } = useQuery(
    ["gasEstimate", amount, to, token],
    async () => {
      if (token.isToken) {
        const erc20 = new Contract(token.address, erc20ABI, provider);
        return erc20.estimateGas.transfer(
          to,
          parseUnits(amount, token.decimals)
        );
      }
      return provider.estimateGas({
        from: walletAddress,
        to,
        value: parseEther(amount),
      });
    }
  );

  const { mutate: sendToken, isLoading: sendingToken } = useMutation(
    async () => {
      const privateKey = await SecureStore.getItemAsync("privateKey", {
        requireAuthentication: true,
      });
      if (!privateKey) throw new Error("No private key");

      const owner = new ethers.Wallet(privateKey).connect(provider);
      const erc20 = new Contract(token.address, erc20ABI, owner);
      const transaction = await erc20.populateTransaction.transfer(
        to,
        parseUnits(amount, token.decimals)
      );

      return owner.sendTransaction(transaction);
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
      const privateKey = await SecureStore.getItemAsync("privateKey", {
        requireAuthentication: true,
      });
      if (!privateKey) throw new Error("No private key");

      const owner = new ethers.Wallet(privateKey).connect(provider);
      const transaction = await owner.populateTransaction({
        to,
        value: parseEther(amount),
      });
      return owner.sendTransaction(transaction);
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
          onPress={token.isToken ? sendToken : sendEth}
          isLoading={sendingEth || sendingToken}
          isDisabled={gasEstimateLoading}
        >
          Confirm
        </Button>
      </Stack>
    </Box>
  );
};

export default SendConfirmScreen;
