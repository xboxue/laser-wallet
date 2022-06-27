import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { ethers, providers } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import Constants from "expo-constants";
import { Laser } from "laser-sdk";
import { Box, Button, Skeleton, Stack, Text } from "native-base";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useBalance, useFeeData, useProvider } from "wagmi";
import tokens from "../constants/tokens";
import {
  selectOwnerPrivateKey,
  selectWalletAddress,
} from "../features/auth/authSlice";
import useTokenBalances from "../hooks/useTokenBalances";
import formatAddress from "../utils/formatAddress";

const WETH_ADDRESS = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";

const SendConfirmScreen = ({ route }) => {
  const provider = useProvider({ chainId: 5 });
  const walletAddress = useSelector(selectWalletAddress);
  const ownerPrivateKey = useSelector(selectOwnerPrivateKey);

  const [sending, setSending] = useState(false);
  const { refetch: refetchBalance } = useBalance({
    addressOrName: walletAddress,
    chainId: 5,
  });
  const { refetch: refetchTokenBalances } = useTokenBalances(
    [walletAddress],
    tokens.map((token) => token.address)
  );

  const { data: feeData, isError, isLoading: loadingFeeData } = useFeeData();

  const transferTokens = async () => {
    if (!walletAddress || !ownerPrivateKey) throw new Error();

    try {
      setSending(true);
      const { amount, address: to } = route.params;

      const owner = new ethers.Wallet(ownerPrivateKey);
      const laser = new Laser(provider, owner, walletAddress);

      const feeData = await provider.getFeeData();

      const transaction = await laser.transferERC20(WETH_ADDRESS, to, amount, {
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        gasTip: 30000,
      });

      await axios.post(
        `${Constants.manifest?.extra?.relayerUrl}/transactions`,
        transaction
      );
      refetchBalance();
      refetchTokenBalances();
      navigation.navigate("Home");
    } catch (error) {
      console.log(error);
    }
    setSending(false);
  };

  const sendEth = async () => {
    if (!walletAddress || !ownerPrivateKey) throw new Error();

    try {
      setSending(true);
      const { amount, address: to } = route.params;

      const owner = new ethers.Wallet(ownerPrivateKey);
      const laser = new Laser(provider, owner, walletAddress);
      const feeData = await provider.getFeeData();

      const transaction = await laser.sendEth(to, amount, {
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        gasTip: 30000,
      });

      const { data: txData } = await axios.post<providers.TransactionResponse>(
        `${Constants.manifest?.extra?.relayerUrl}/transactions`,
        { sender: walletAddress, transaction }
      );
      await provider.waitForTransaction(txData.hash);

      refetchBalance();
      refetchTokenBalances();
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
            {!loadingFeeData &&
            feeData?.maxFeePerGas &&
            feeData?.maxPriorityFeePerGas ? (
              <Text variant="subtitle2">
                {formatUnits(
                  feeData.maxFeePerGas
                    .add(feeData.maxPriorityFeePerGas)
                    .mul(21000)
                )}{" "}
                ETH
              </Text>
            ) : (
              <Skeleton />
            )}
          </Box>
          <Button
            onPress={
              route.params.token.symbol === "ETH" ? sendEth : transferTokens
            }
            isLoading={sending}
          >
            Confirm
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default SendConfirmScreen;
