import { IClientMeta, IJsonRpcRequest } from "@walletconnect/types";
import { ethers } from "ethers";
import { Laser } from "laser-sdk";
import {
  Actionsheet,
  Box,
  Button,
  Image,
  Skeleton,
  Stack,
  Text,
} from "native-base";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { useFeeData, useProvider } from "wagmi";
import {
  selectOwnerPrivateKey,
  selectWalletAddress,
} from "../../../features/auth/authSlice";
import { selectChainId } from "../../../features/network/networkSlice";
import formatAddress from "../../../utils/formatAddress";
import formatAmount from "../../../utils/formatAmount";

interface Props {
  onClose: () => void;
  onReject: () => void;
  onApprove: () => void;
  peerMeta: IClientMeta;
  callRequest: IJsonRpcRequest;
}

const WalletConnectTransactionPrompt = ({
  onClose,
  onApprove,
  onReject,
  peerMeta,
  callRequest,
}: Props) => {
  const { to, value = 0, data } = callRequest.params[0];
  const chainId = useSelector(selectChainId);
  const walletAddress = useSelector(selectWalletAddress);
  const ownerPrivateKey = useSelector(selectOwnerPrivateKey);
  const provider = useProvider({ chainId });

  const estimateGas = async () => {
    const owner = new ethers.Wallet(ownerPrivateKey);
    const laser = new Laser(provider, owner, walletAddress);

    const transactionInfo = {
      maxFeePerGas: 0,
      maxPriorityFeePerGas: 0,
      gasTip: 0,
    };

    const transaction = await laser.sendTransaction(
      to,
      data,
      value,
      transactionInfo
    );

    return laser.simulateTransaction(transaction);
  };

  const { data: callGas, isLoading: callGasLoading } = useQuery(
    "callGas",
    estimateGas
  );

  const { data: feeData, isError, isLoading: loadingFeeData } = useFeeData();

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
          <Stack space="1">
            <Button onPress={onApprove}>Approve</Button>
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
