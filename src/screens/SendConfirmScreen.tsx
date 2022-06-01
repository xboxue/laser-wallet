import { useNavigation } from "@react-navigation/native";
import { Box, Button, Stack, Text } from "native-base";
import { useState } from "react";
import useWalletContract from "../hooks/useWalletContract";

const SendConfirmScreen = ({ route }) => {
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
              {route.params.address.slice(0, 7)}...
              {route.params.address.slice(-4)}
            </Text>
          </Box>
          <Box flexDirection="row" justifyContent="space-between">
            <Text variant="subtitle2">Gas (estimate)</Text>
          </Box>
          <Button>Confirm</Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default SendConfirmScreen;
