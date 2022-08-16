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
import { useFeeData, useProvider } from "wagmi";
import useLaser from "../../../hooks/useLaser";
import formatAddress from "../../../utils/formatAddress";
import formatAmount from "../../../utils/formatAmount";
import Constants from "expo-constants";
import { useSelector } from "react-redux";
import { selectChainId } from "../../../features/network/networkSlice";
import { BigNumber } from "ethers";

interface Props {
  onClose: () => void;
  onReject: () => void;
  onApprove: (gasEstimate: BigNumber) => void;
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
  const { to, value = 0, data } = callRequest.params[0];
  const laser = useLaser();
  const chainId = useSelector(selectChainId);
  const provider = useProvider({ chainId });

  const { data: feeData, isLoading: feeDataLoading } = useFeeData();

  const { data: baseFeePerGas, isLoading: baseFeePerGasLoading } = useQuery(
    ["baseFeePerGas"],
    async () => {
      const block = await provider.getBlock("latest");
      return block.baseFeePerGas;
    },
    { refetchInterval: 1000 }
  );

  const { data: gasEstimate, isLoading: gasEstimateLoading } = useQuery(
    ["gasEstimate", to, value, data],
    async () => {
      const transaction = await laser.execTransaction(to, value, data, {
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0,
        gasLimit: 1000000,
        relayer: Constants.expoConfig.extra.relayerAddress,
      });
      return laser.estimateLaserGas(transaction);
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
    <Actionsheet isOpen onClose={onClose}>
      <Actionsheet.Content>
        <Stack space="4" width="100%" px="4" py="2">
          <Image
            source={{ uri: peerMeta.icons[0] }}
            alt="logo"
            size="10"
            alignSelf="center"
          />
          <Text variant="subtitle1">
            {peerMeta.name}: {callRequest.method}
          </Text>
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
            {renderGasFee()}
          </Box>
          <Stack space="1" mt="1">
            <Button isLoading={loading} onPress={() => onApprove(gasEstimate)}>
              Approve
            </Button>
            <Button isDisabled={loading} variant="subtle" onPress={onReject}>
              Reject
            </Button>
          </Stack>
        </Stack>
      </Actionsheet.Content>
    </Actionsheet>
  );
};

export default WalletConnectTransactionPrompt;
