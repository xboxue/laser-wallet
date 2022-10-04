import { useQuery } from "@tanstack/react-query";
import { IClientMeta, IJsonRpcRequest } from "@walletconnect/types";
import {
  Actionsheet,
  Box,
  Button,
  Image,
  Skeleton,
  Stack,
  Text,
} from "native-base";
import { useSelector } from "react-redux";
import { useFeeData, useProvider } from "wagmi";
import { TRANSACTION_TYPES } from "../../../constants/transactions";
import { selectChainId } from "../../../features/network/networkSlice";
import { decodePendingTxData } from "../../../utils/decodeTransactionData";
import formatAddress from "../../../utils/formatAddress";
import formatAmount from "../../../utils/formatAmount";
import BottomSheet from "../../BottomSheet/BottomSheet";
import WalletConnectApprovePrompt from "../WalletConnectApprovePrompt/WalletConnectApprovePrompt";

interface Props {
  onClose: () => void;
  onReject: () => void;
  onApprove: () => void;
  peerMeta: IClientMeta;
  callRequest: IJsonRpcRequest;
  loading?: boolean;
}

const WalletConnectTransactionPrompt = ({
  onClose,
  onApprove,
  onReject,
  peerMeta,
  callRequest,
  loading = false,
}: Props) => {
  const transaction = callRequest.params[0];
  const chainId = useSelector(selectChainId);
  const provider = useProvider({ chainId });

  const { data: gasEstimate, isLoading: gasEstimateLoading } = useQuery(
    ["gasEstimate", transaction],
    async () => {
      if (transaction.gas) return transaction.gas;

      return provider.estimateGas({
        from: transaction.from,
        to: transaction.to,
        data: transaction.data,
        value: transaction.value,
        nonce: transaction.nonce,
      });
    }
  );

  const { data: feeData, isLoading: feeDataLoading } = useFeeData();

  const { data: txData, isLoading: txDataLoading } = useQuery(
    ["pendingTxData", transaction],
    () => decodePendingTxData(provider, transaction)
  );

  const { data: baseFeePerGas, isLoading: baseFeePerGasLoading } = useQuery(
    ["baseFeePerGas"],
    async () => {
      const block = await provider.getBlock("latest");
      return block.baseFeePerGas;
    },
    { refetchInterval: 5000 }
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

  const renderContent = () => {
    if (txDataLoading) return <Skeleton />;

    if (txData?.type === TRANSACTION_TYPES.TOKEN_APPROVE)
      return (
        <WalletConnectApprovePrompt
          txData={txData}
          gasFee={renderGasFee()}
          peerMeta={peerMeta}
        />
      );

    return (
      <Stack space="4">
        <Text variant="subtitle1">{peerMeta.name}: Confirm transaction</Text>
        <Box flexDirection="row" justifyContent="space-between">
          <Text variant="subtitle2">To</Text>
          <Text variant="subtitle2">{formatAddress(transaction.to)}</Text>
        </Box>
        <Box flexDirection="row" justifyContent="space-between">
          <Text variant="subtitle2">Amount</Text>
          <Text variant="subtitle2">
            {transaction.value ? formatAmount(transaction.value) : 0} ETH
          </Text>
        </Box>
        <Box flexDirection="row" justifyContent="space-between">
          <Text variant="subtitle2">Network fee (estimate)</Text>
          {renderGasFee()}
        </Box>
      </Stack>
    );
  };

  return (
    <BottomSheet isOpen onClose={onClose}>
      <Box width="100%" p="4">
        <Image
          source={{ uri: peerMeta.icons[0] }}
          alt="logo"
          size="10"
          alignSelf="center"
          mb="4"
        />
        {renderContent()}
        <Stack space="1" mt="5">
          <Button
            isLoading={loading}
            isDisabled={gasEstimateLoading}
            onPress={() => onApprove()}
          >
            Approve
          </Button>
          <Button isDisabled={loading} variant="subtle" onPress={onReject}>
            Reject
          </Button>
        </Stack>
      </Box>
    </BottomSheet>
  );
};

export default WalletConnectTransactionPrompt;
