import { useNavigation } from "@react-navigation/native";
import { formatUnits } from "ethers/lib/utils";
import { Box, Button, Skeleton, Stack, Text } from "native-base";
import { useQuery } from "react-query";
import useWalletContract from "../hooks/useWalletContract";
import formatAddress from "../utils/formatAddress";

const SendConfirmScreen = ({ route }) => {
  const { data, isLoading, isError } = useQuery("gasPrices", () =>
    fetch("https://api.blocknative.com/gasprices/blockprices", {
      headers: {
        Authorization: "65cfb3b8-8462-4037-9679-aac28a42be1b",
      },
    }).then((res) => res.json())
  );

  const navigation = useNavigation();
  const {
    data: balance,
    loading,
    error,
  } = useWalletContract("getBalanceInEth");

  return (
    <Box flex="1">
      <Box p="4" flex="1">
        <Text variant="subtitle1">Review</Text>
        <Stack space="4">
          <Box flexDirection="row" justifyContent="space-between">
            <Text variant="subtitle2">Amount</Text>
            <Text variant="subtitle2">
              {route.params.amount} {route.params.asset}
            </Text>
          </Box>
          <Box flexDirection="row" justifyContent="space-between">
            <Text variant="subtitle2">To</Text>
            <Text variant="subtitle2">
              {formatAddress(route.params.address)}
            </Text>
          </Box>
          <Box flexDirection="row" justifyContent="space-between">
            <Text variant="subtitle2">Gas (estimate)</Text>
            <Text variant="subtitle2">
              {isLoading ? (
                <Skeleton />
              ) : (
                formatUnits(
                  (data.blockPrices[0].estimatedPrices[2].maxFeePerGas +
                    data.blockPrices[0].estimatedPrices[2]
                      .maxPriorityFeePerGas) *
                    21000,
                  "gwei"
                )
              )}
            </Text>
          </Box>
          <Button>Confirm</Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default SendConfirmScreen;
