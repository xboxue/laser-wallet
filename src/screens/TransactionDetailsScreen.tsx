import Ionicons from "@expo/vector-icons/Ionicons";
import { format } from "date-fns";
import { BigNumber } from "ethers";
import * as WebBrowser from "expo-web-browser";
import { Badge, Box, Button, Icon, Stack, Text } from "native-base";
import { useSelector } from "react-redux";
import CopyIconButton from "../components/CopyIconButton/CopyIconButton";
import { selectChainId } from "../features/network/networkSlice";
import { getTransactionUrl } from "../services/etherscan";
import formatAddress from "../utils/formatAddress";
import formatAmount from "../utils/formatAmount";

const TransactionDetailsScreen = ({ route }) => {
  const { txData } = route.params;
  const chainId = useSelector(selectChainId);

  return (
    <Box p="4">
      <Text variant="subtitle1" mb="3">
        Transaction
      </Text>
      <Stack space="4">
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          h="5"
        >
          <Text variant="subtitle2">Status</Text>
          <Text variant="subtitle2">
            {!txData.receipt ? (
              <Badge _text={{ fontSize: "sm" }}>Pending</Badge>
            ) : txData.isError ? (
              <Badge _text={{ fontSize: "sm" }} colorScheme="danger">
                Fail
              </Badge>
            ) : (
              <Badge _text={{ fontSize: "sm" }} colorScheme="success">
                Success
              </Badge>
            )}
          </Text>
        </Box>
        {txData.from && (
          <Box flexDirection="row" justifyContent="space-between" h="5">
            <Text variant="subtitle2">From</Text>
            <Box flexDirection="row" alignItems="center">
              <Text mr="0.5" variant="subtitle2">
                {txData.from.ensName || formatAddress(txData.from.address)}
              </Text>
              <CopyIconButton value={txData.from.address} />
            </Box>
          </Box>
        )}
        {txData.to && (
          <Box flexDirection="row" justifyContent="space-between" h="5">
            <Text variant="subtitle2">To</Text>
            <Box flexDirection="row" alignItems="center">
              <Text mr="0.5" variant="subtitle2">
                {txData.to.ensName || formatAddress(txData.to.address)}
              </Text>
              <CopyIconButton value={txData.to.address} />
            </Box>
          </Box>
        )}
        {txData.timestamp && (
          <Box flexDirection="row" justifyContent="space-between" h="5">
            <Text variant="subtitle2">Submitted</Text>
            <Text variant="subtitle2">
              {format(txData.timestamp, "LLL d, h:mm a")}
            </Text>
          </Box>
        )}
        {!!txData.value && (
          <Box flexDirection="row" justifyContent="space-between" h="5">
            <Text variant="subtitle2">Amount</Text>
            <Text variant="subtitle2">{formatAmount(txData.value)} ETH</Text>
          </Box>
        )}
        {txData.receipt?.gasPrice && txData.receipt?.gasUsed && (
          <Box flexDirection="row" justifyContent="space-between" h="5">
            <Text variant="subtitle2">Network fee</Text>
            <Text variant="subtitle2">
              {formatAmount(
                BigNumber.from(txData.receipt.gasPrice).mul(
                  txData.receipt.gasUsed
                ),
                {
                  precision: 6,
                }
              )}{" "}
              ETH
            </Text>
          </Box>
        )}
        <Button
          mt="2"
          onPress={() => {
            WebBrowser.openBrowserAsync(
              getTransactionUrl(chainId, txData.hash)
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
