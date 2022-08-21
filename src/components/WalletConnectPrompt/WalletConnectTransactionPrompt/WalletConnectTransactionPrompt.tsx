import { useQuery } from "@tanstack/react-query";
import { IClientMeta, IJsonRpcRequest } from "@walletconnect/types";
import { BigNumber } from "ethers";
import Constants from "expo-constants";
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
import useLaser from "../../../hooks/useLaser";
import { decodeWalletTxData } from "../../../utils/decodeTransactionData";
import formatAddress from "../../../utils/formatAddress";
import formatAmount from "../../../utils/formatAmount";
import WalletConnectApprovePrompt from "../WalletConnectApprovePrompt/WalletConnectApprovePrompt";

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

  const { data: txData, isLoading: txDataLoading } = useQuery(
    ["decodedtxData", to, data],
    () => decodeWalletTxData(provider, to, data)
  );

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
          <Text variant="subtitle2">{formatAddress(to)}</Text>
        </Box>
        <Box flexDirection="row" justifyContent="space-between">
          <Text variant="subtitle2">Amount</Text>
          <Text variant="subtitle2">{formatAmount(value)} ETH</Text>
        </Box>
        <Box flexDirection="row" justifyContent="space-between">
          <Text variant="subtitle2">Network fee (estimate)</Text>
          {renderGasFee()}
        </Box>
      </Stack>
    );
  };

  return (
    <Actionsheet isOpen onClose={onClose}>
      <Actionsheet.Content>
        <Box width="100%" px="4" py="2">
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
              onPress={() => onApprove(gasEstimate)}
            >
              Approve
            </Button>
            <Button isDisabled={loading} variant="subtle" onPress={onReject}>
              Reject
            </Button>
          </Stack>
        </Box>
      </Actionsheet.Content>
    </Actionsheet>
  );
};

export default WalletConnectTransactionPrompt;
