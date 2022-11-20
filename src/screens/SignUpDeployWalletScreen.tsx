import Feather from "@expo/vector-icons/Feather";
import { SafeAccountConfig, SafeFactory } from "@gnosis.pm/safe-core-sdk";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BigNumber, ethers, utils } from "ethers";
import { formatEther } from "ethers/lib/utils";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";
import { Box, Icon, Skeleton, Text, useToast } from "native-base";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useBalance, useFeeData, useProvider } from "wagmi";
import SignUpLayout from "../components/SignUpLayout/SignUpLayout";
import ToastAlert from "../components/ToastAlert/ToastAlert";
import { selectGuardianAddresses } from "../features/guardians/guardiansSlice";
import { selectChainId } from "../features/network/networkSlice";
import {
  selectOwnerAddress,
  selectRecoveryOwnerAddress,
  selectSafeConfig,
  selectTrustedOwnerAddress,
  selectWalletAddress,
} from "../features/wallet/walletSlice";
import { useCreateVaultMutation } from "../graphql/types";
import useExchangeRates from "../hooks/useExchangeRates";
import { createSafe } from "../services/relayer";
import formatAddress from "../utils/formatAddress";
import formatAmount from "../utils/formatAmount";
import waitForTransaction from "../utils/waitForTransaction";

const SignUpDeployWalletScreen = () => {
  const chainId = useSelector(selectChainId);
  const safeConfig = useSelector(selectSafeConfig);
  const walletAddress = useSelector(selectWalletAddress);

  const {
    data,
    isLoading: isCreating,
    mutate,
  } = useMutation(
    async () => {
      const { relayTransactionHash: hash } = await createSafe({
        owners: safeConfig?.safeAccountConfig.owners,
        threshold: safeConfig?.safeAccountConfig.threshold,
        payment: safeConfig?.safeAccountConfig.payment,
        saltNonce: safeConfig?.safeDeploymentConfig?.saltNonce,
        chainId,
        safeAddress: walletAddress,
      });

      return waitForTransaction({ hash, chainId });
    },
    {
      onSuccess: () => {
        toast.show({
          render: () => (
            <ToastAlert status="success" title="Wallet activated" />
          ),
          duration: 2000,
        });
      },
    }
  );

  const { data: balance } = useBalance({
    addressOrName: walletAddress,
    chainId,
    watch: true,
  });

  const { data: exchangeRates } = useExchangeRates();

  const toast = useToast();

  const [saveVault] = useCreateVaultMutation();

  const renderDeployFee = () => {
    if (!exchangeRates || !safeConfig) return <Skeleton w="16" h="5" />;

    return (
      <>
        <Text variant="subtitle1">
          {formatAmount(safeConfig.safeAccountConfig.payment, { precision: 6 })}{" "}
          ETH
        </Text>
        <Text variant="subtitle1">
          $
          {(
            parseFloat(formatEther(safeConfig.safeAccountConfig.payment)) *
            exchangeRates.USD
          ).toFixed(2)}
        </Text>
      </>
    );
  };

  return (
    <SignUpLayout
      title="Your first deposit"
      subtitle="There is a network fee to activate your wallet. This fee will be taken from your first deposit."
      onNext={mutate}
      isLoading={isCreating}
    >
      <Text variant="h6">Wallet address</Text>
      <Pressable
        onPress={() => {
          Clipboard.setStringAsync(walletAddress);
          toast.show({
            render: () => (
              <ToastAlert status="success" title="Copied to clipboard" />
            ),
            duration: 2000,
          });
        }}
      >
        <Box flexDirection="row" alignItems="center">
          <Text variant="subtitle1">{formatAddress(walletAddress)}</Text>
          <Icon as={<Feather name="copy" />} color="white" ml="1" />
        </Box>
      </Pressable>
      <Text variant="h6" mt="4">
        Network fee
      </Text>
      {renderDeployFee()}
      <Text variant="h6" mt="4">
        Balance:
      </Text>
      <Text variant="subtitle1">
        {balance ? (
          `${balance?.formatted} ${balance?.symbol}`
        ) : (
          <Skeleton w="16" h="5" />
        )}
      </Text>
    </SignUpLayout>
  );
};

export default SignUpDeployWalletScreen;
