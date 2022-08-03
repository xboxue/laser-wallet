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
import { useQuery } from "@tanstack/react-query";
import { useFeeData } from "wagmi";
import useLaser from "../../../hooks/useLaser";
import formatAddress from "../../../utils/formatAddress";
import formatAmount from "../../../utils/formatAmount";

interface Props {
  onClose: () => void;
  onReject: () => void;
  onApprove: () => void;
  peerMeta: IClientMeta;
  callRequest: IJsonRpcRequest;
  loading?: boolean;
}

const GAS_LIMIT = 300000;

const WalletConnectTransactionPrompt = ({
  onClose,
  onApprove,
  onReject,
  peerMeta,
  callRequest,
  loading = false,
}: Props) => {
  const { to, value = 0, data } = callRequest.params[0];
  const laser = useLaser();

  const { data: feeData, isError, isLoading: loadingFeeData } = useFeeData();
  // const { data: callGas, isLoading: callGasLoading } = useQuery(
  //   "callGas",
  //   async () => {
  //     const transaction = await laser.sendTransaction(to, data, value, {
  //       maxFeePerGas: 0,
  //       maxPriorityFeePerGas: 0,
  //       gasTip: 0,
  //     });
  //     return laser.simulateTransaction(transaction);
  //   }
  // );

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
    <Actionsheet isOpen onClose={onClose}>
      <Actionsheet.Content>
        <Stack space="4" width="100%" px="4" py="2">
          <Box>
            <Text variant="subtitle1">
              {peerMeta.name}: {callRequest.method}
            </Text>
            <Image source={{ uri: peerMeta.icons[0] }} alt="logo" />
          </Box>
          <Box flexDirection="row" justifyContent="space-between">
            <Text variant="subtitle2">To</Text>
            <Text variant="subtitle2">{formatAddress(to)}</Text>
          </Box>
          <Box flexDirection="row" justifyContent="space-between">
            <Text variant="subtitle2">Amount</Text>
            <Text variant="subtitle2">{formatAmount(value)} ETH</Text>
          </Box>
          <Box flexDirection="row" justifyContent="space-between">
            <Text variant="subtitle2">Gas (estimate)</Text>
            {renderGasEstimate()}
          </Box>
          <Stack space="1">
            <Button isLoading={loading} onPress={onApprove}>
              Approve
            </Button>
            <Button variant="ghost" onPress={onReject}>
              Reject
            </Button>
          </Stack>
        </Stack>
      </Actionsheet.Content>
    </Actionsheet>
  );
};

export default WalletConnectTransactionPrompt;
