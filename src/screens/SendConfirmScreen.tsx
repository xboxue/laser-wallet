import { useClerk, useSignIn } from "@clerk/clerk-expo";
import { EmailCodeFactor } from "@clerk/types";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import SafeServiceClient from "@gnosis.pm/safe-service-client";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { constants, ethers, providers } from "ethers";
import { getAddress, parseEther, parseUnits } from "ethers/lib/utils";
import Constants from "expo-constants";
import { Box, Button, Image, Skeleton, Stack, Text } from "native-base";
import { useSelector } from "react-redux";
import { useFeeData, useProvider } from "wagmi";
import { Erc20__factory } from "../abis/types";
import { WETH_CONTRACT } from "../constants/contracts";
import { selectChainId } from "../features/network/networkSlice";
import {
  selectEmail,
  selectWalletAddress,
} from "../features/wallet/walletSlice";
import { getTokenMetadata } from "../services/nxyz";
import { getSafeService } from "../services/safe";
import formatAddress from "../utils/formatAddress";
import formatAmount from "../utils/formatAmount";

const SendConfirmScreen = ({ route }) => {
  const chainId = useSelector(selectChainId);
  const walletAddress = useSelector(selectWalletAddress);
  const navigation = useNavigation();
  const { signIn } = useSignIn();
  const email = useSelector(selectEmail);
  const clerk = useClerk();
  const provider = useProvider({ chainId });
  const { amount, amountUSD, address: to, ensName, token } = route.params;

  const { data: tokenMetadata, isLoading: tokenMetadataLoading } = useQuery(
    ["tokenMetadata", WETH_CONTRACT],
    () => getTokenMetadata([WETH_CONTRACT], chainId),
    { select: ([data]) => data }
  );

  const { mutate: sendEmailCode, isLoading: isSendingEmailCode } = useMutation(
    async () => {
      if (!email) throw new Error("No email");
      if (!signIn) throw new Error();

      await clerk.signOut();

      const signInAttempt = await signIn.create({
        identifier: email,
      });

      const emailCodeFactor = signInAttempt.supportedFirstFactors.find(
        ({ strategy }) => strategy === "email_code"
      ) as EmailCodeFactor;

      await signInAttempt.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: emailCodeFactor.emailAddressId,
      });
    }
  );

  const { data: feeData, isLoading: feeDataLoading } = useFeeData();

  const { data: gasEstimate, isLoading: gasEstimateLoading } = useQuery(
    ["gasEstimate", amount, to, token.contractAddress],
    async () => {
      let tx: { to: string; value: string; data: string };

      if (token.contractAddress === constants.AddressZero) {
        tx = { to, value: parseEther(amount).toString(), data: "0x" };
      } else {
        const erc20 = Erc20__factory.connect(token.contractAddress, provider);
        tx = {
          to: getAddress(token.contractAddress),
          value: "0",
          data: erc20.interface.encodeFunctionData("transfer", [
            to,
            parseUnits(amount, token.decimals),
          ]),
        };
      }

      const safeService = getSafeService(chainId);
      const { safeTxGas } = await safeService.estimateSafeTransaction(
        getAddress(walletAddress),
        { to: tx.to, data: tx.data, value: tx.value.toString(), operation: 0 }
      );

      return safeTxGas;
    }
  );

  const renderGasFee = () => {
    if (
      !feeData?.maxPriorityFeePerGas ||
      !feeData?.lastBaseFeePerGas ||
      !gasEstimate
    ) {
      return <Skeleton w="16" h="5" />;
    }

    const gasFee = feeData.lastBaseFeePerGas
      .add(feeData.maxPriorityFeePerGas)
      .mul(gasEstimate);

    return (
      <Box alignItems="flex-end">
        {tokenMetadata && (
          <Text variant="subtitle1">
            {formatAmount(
              gasFee.mul(tokenMetadata.currentPrice.fiat[0].value),
              {
                decimals: 20,
                style: "currency",
                currency: "USD",
              }
            )}
          </Text>
        )}
        <Text color="text.300">
          {formatAmount(gasFee, { minimumFractionDigits: 6 })} ETH
        </Text>
      </Box>
    );
  };

  return (
    <Box px="4" flex="1">
      <Box alignItems="center" py="8">
        <Image
          source={{
            uri:
              token.symbolLogos?.[0].URI ||
              "https://c.neevacdn.net/image/upload/tokenLogos/ethereum/ethereum.png",
          }}
          size="16"
          alt="Token icon"
        />
        <Text variant="h3" mt="2">
          {amount} {token.symbol}
        </Text>
        <Text color="text.300" variant="h5">
          {amountUSD}
        </Text>
      </Box>
      <Stack space="4" flex="1">
        <Box flexDirection="row" justifyContent="space-between">
          <Text variant="subtitle1">To</Text>
          <Box alignItems="flex-end">
            <Text variant="subtitle1">{ensName || formatAddress(to)}</Text>
            {ensName && <Text color="text.300">{formatAddress(to)}</Text>}
          </Box>
        </Box>
        <Box flexDirection="row" justifyContent="space-between">
          <Text variant="subtitle1">Network fee</Text>
          {renderGasFee()}
        </Box>
      </Stack>
      <Button
        onPress={() => {
          sendEmailCode();
          navigation.navigate("VaultVerifyEmail", route.params);
        }}
        isLoading={isSendingEmailCode}
        isDisabled={gasEstimateLoading}
      >
        Confirm
      </Button>
    </Box>
  );
};

export default SendConfirmScreen;
