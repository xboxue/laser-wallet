import { useNavigation } from "@react-navigation/native";
import { ContractTransaction, ethers } from "ethers";
import { formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import * as SecureStore from "expo-secure-store";
import { Laser } from "laser-sdk/src";
import { ENTRY_POINT_GOERLI } from "laser-sdk/src/constants";
import { Box, Button, Skeleton, Stack, Text } from "native-base";
import { useState } from "react";
import { useSelector } from "react-redux";
import { erc20ABI, useBalance, useFeeData, useProvider } from "wagmi";
import { entryPointAbi } from "../abis/TestEntryPoint.json";
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

      const providerUrl =
        "https://eth-goerli.alchemyapi.io/v2/e_-Jn9f06JUc7TXmtPdwzkI2TNdvjri1";

      const owner = new ethers.Wallet(ownerPrivateKey);

      const laser = new Laser(providerUrl, owner, walletAddress);

      const erc20 = new ethers.Contract(WETH_ADDRESS, erc20ABI, provider);
      const gas = await erc20
        .connect(walletAddress)
        .estimateGas.transfer(to, parseUnits(amount));
      const feeData = await provider.getFeeData();

      const userOp = await laser.transferERC20(
        WETH_ADDRESS,
        to,
        parseUnits(amount),
        {
          callGas: gas.add(10000),
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        }
      );

      const entryPoint = new ethers.Contract(
        ENTRY_POINT_GOERLI,
        entryPointAbi,
        owner.connect(provider)
      );

      const transaction: ContractTransaction = await entryPoint.handleOps(
        [userOp],
        owner.address,
        { gasLimit: 250000 }
      );
      await transaction.wait();
      await refetchBalance();
      await refetchTokenBalances();
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

      const transaction: ContractTransaction = await entryPoint.handleOps(
        [userOp],
        owner.address
      );
      await transaction.wait();
      await refetchBalance();
      await refetchTokenBalances();
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
