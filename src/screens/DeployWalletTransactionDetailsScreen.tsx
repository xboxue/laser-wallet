import Ionicons from "@expo/vector-icons/Ionicons";
import { format, fromUnixTime } from "date-fns";
import * as WebBrowser from "expo-web-browser";
import { Badge, Box, Button, Icon, Stack, Text } from "native-base";
import { useSelector } from "react-redux";
import { selectChainId } from "../features/network/networkSlice";
import { getTransactionUrl } from "../services/etherscan";
import formatAmount from "../utils/formatAmount";

const DeployWalletTransactionDetailsScreen = ({ route }) => {
  const { transaction } = route.params;
  const chainId = useSelector(selectChainId);

  return (
    <Box p="4">
      <Text variant="subtitle1" mb="3">
        Transaction
      </Text>
      <Stack space="4">
        <Box flexDirection="row" justifyContent="space-between" h="5">
          <Text variant="subtitle2">Status</Text>
          <Text variant="subtitle2">
            {transaction.isError === "0" ? (
              <Badge _text={{ fontSize: "sm" }} colorScheme="success">
                Success
              </Badge>
            ) : (
              <Badge _text={{ fontSize: "sm" }} colorScheme="danger">
                Fail
              </Badge>
            )}
          </Text>
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
          <Text variant="subtitle2">Network fee</Text>
          <Text variant="subtitle2">
            {formatAmount(transaction.value, { precision: 6 })} ETH
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

export default DeployWalletTransactionDetailsScreen;
