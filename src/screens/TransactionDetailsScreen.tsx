import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { format, fromUnixTime } from "date-fns";
import { BigNumber } from "ethers";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { Box, Button, Icon, Stack, Text } from "native-base";
import { useSelector } from "react-redux";
import { useProvider } from "wagmi";
import CopyIconButton from "../components/CopyIconButton/CopyIconButton";
import { selectChainId } from "../features/network/networkSlice";
import { selectWalletAddress } from "../features/wallet/walletSlice";
import { getTransactions, getTransactionUrl } from "../services/etherscan";
import decodeTransactionData from "../utils/decodeTransactionData";
import formatAddress from "../utils/formatAddress";
import formatAmount from "../utils/formatAmount";
import isEqualCaseInsensitive from "../utils/isEqualCaseInsensitive";

const TransactionDetailsScreen = ({ route }) => {
  const { transaction } = route.params;
  const walletAddress = useSelector(selectWalletAddress);
  const chainId = useSelector(selectChainId);
  const provider = useProvider({ chainId });

  const { data: internalTxs = [], isLoading: internalTxsLoading } = useQuery(
    ["internalTxs", transaction.hash],
    () =>
      getTransactions({
        address: walletAddress,
        chainId,
        internal: true,
        txHash: transaction.hash,
      })
  );

  const { data: txData } = useQuery(["txData", transaction.hash], () =>
    decodeTransactionData(provider, transaction)
  );

  const gasFee = internalTxs?.find(
    (tx) =>
      tx.type === "call" &&
      isEqualCaseInsensitive(tx.to, Constants.manifest?.extra?.relayerAddress)
  )?.value;

  return (
    <Box p="4">
      <Text variant="subtitle1" mb="3">
        Transaction
      </Text>
      <Stack space="4">
        <Box flexDirection="row" justifyContent="space-between" h="5">
          <Text variant="subtitle2">Status</Text>
          <Text variant="subtitle2">
            {transaction.isError === "0" ? "Success" : "Fail"}
          </Text>
        </Box>
        <Box flexDirection="row" justifyContent="space-between" h="5">
          <Text variant="subtitle2">From</Text>
          <Box flexDirection="row" alignItems="center">
            <Text mr="0.5" variant="subtitle2">
              {txData?.from.ensName || formatAddress(txData.from.address)}
            </Text>
            <CopyIconButton value={transaction.from} />
          </Box>
        </Box>
        <Box flexDirection="row" justifyContent="space-between" h="5">
          <Text variant="subtitle2">To</Text>
          <Box flexDirection="row" alignItems="center">
            <Text mr="0.5" variant="subtitle2">
              {txData?.to.ensName || formatAddress(txData.to.address)}
            </Text>
            <CopyIconButton value={transaction.to} />
          </Box>
        </Box>
        <Box flexDirection="row" justifyContent="space-between" h="5">
          <Text variant="subtitle2">Submitted</Text>
          <Text variant="subtitle2">
            {format(
              fromUnixTime(parseInt(transaction.timeStamp, 10)),
              "LLL d, h:mm a"
            )}
          </Text>
        </Box>
        <Box flexDirection="row" justifyContent="space-between" h="5">
          <Text variant="subtitle2">Amount</Text>
          <Text variant="subtitle2">{formatAmount(transaction.value)} ETH</Text>
        </Box>
        <Box flexDirection="row" justifyContent="space-between" h="5">
          <Text variant="subtitle2">Network fee</Text>
          <Text variant="subtitle2">
            {gasFee
              ? `${formatAmount(gasFee, { precision: 7 })} ETH`
              : `${formatAmount(
                  BigNumber.from(transaction.gasPrice).mul(transaction.gasUsed),
                  { precision: 7 }
                )} ETH`}
          </Text>
        </Box>
        <Button
          mt="2"
          onPress={() => {
            WebBrowser.openBrowserAsync(
              getTransactionUrl(chainId, transaction.hash)
            );
          }}
          endIcon={<Icon as={<Ionicons name="open-outline" />} size="4" />}
        >
          View on Etherscan
        </Button>
      </Stack>
    </Box>
  );
};

export default TransactionDetailsScreen;