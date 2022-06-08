import { useNavigation } from "@react-navigation/native";
import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import * as SecureStore from "expo-secure-store";
import { Laser } from "laser-sdk/src";
import { ENTRY_POINT_GOERLI } from "laser-sdk/src/constants";
import { Box, Button, Stack, Text } from "native-base";
import { useState } from "react";
import { useProvider } from "wagmi";
import { entryPointAbi } from "../abis/TestEntryPoint.json";
import formatAddress from "../utils/formatAddress";

const SendConfirmScreen = ({ route }) => {
  const provider = useProvider({ chainId: 5 });
  const [sending, setSending] = useState(false);

  const send = async () => {
    try {
      setSending(true);
      const walletAddress = await SecureStore.getItemAsync("walletAddress");
      const ownerPrivateKey = await SecureStore.getItemAsync("ownerPrivateKey");
      const { amount, address: to } = route.params;
      if (!walletAddress || !ownerPrivateKey) throw new Error("what");

      const providerUrl =
        "https://eth-goerli.alchemyapi.io/v2/e_-Jn9f06JUc7TXmtPdwzkI2TNdvjri1";

      const owner = new ethers.Wallet(ownerPrivateKey);

      const laser = new Laser(providerUrl, owner, walletAddress);
      const gas = await provider.estimateGas({ to, value: parseEther(amount) });
      const feeData = await provider.getFeeData();

      // TODO: amount should be BigNumber
      const userOp = await laser.sendEth(route.params.address, amount, {
        callGas: gas.add(10000),
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      });

      const entryPoint = new ethers.Contract(
        ENTRY_POINT_GOERLI,
        entryPointAbi,
        owner.connect(provider)
      );

      await entryPoint.handleOps([userOp], owner.address);
      navigation.navigate("Home");
    } catch (error) {
      console.log(error);
    }
    setSending(false);
  };

  const navigation = useNavigation();

  return (
    <Box flex="1">
      <Box p="4" flex="1">
        <Text variant="subtitle1">Review</Text>
        <Stack space="4">
          <Box flexDirection="row" justifyContent="space-between">
            <Text variant="subtitle2">Amount</Text>
            <Text variant="subtitle2">
              {route.params.amount} {route.params.token.symbol}
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
            {/* <Text variant="subtitle2">{isLoading && <Skeleton />}</Text> */}
          </Box>
          <Button onPress={send} isLoading={sending}>
            Confirm
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default SendConfirmScreen;
