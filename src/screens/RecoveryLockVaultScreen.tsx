import { useAuth } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "@tanstack/react-query";
import { providers, Wallet } from "ethers";
import { Laser } from "laser-sdk";
import { bundleTransactions } from "laser-sdk/dist/utils";
import { Box, Button, Skeleton, Text, useToast } from "native-base";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useBalance, useFeeData, useProvider } from "wagmi";
import WalletSelector from "../components/WalletSelector/WalletSelector";
import { selectWalletAddress } from "../features/wallet/walletSlice";
import { signTransaction } from "../services/vault";
import formatAmount from "../utils/formatAmount";
import * as SecureStore from "expo-secure-store";
import ToastAlert from "../components/ToastAlert/ToastAlert";
import { addPendingTransaction } from "../features/transactions/transactionsSlice";
import { useNavigation } from "@react-navigation/native";
import { setChainId } from "../features/network/networkSlice";

const RecoveryLockVaultScreen = ({ route }) => {
  const { transaction } = route.params;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const chainId = useMemo(
    () => providers.getNetwork(transaction.chain).chainId,
    [transaction.chain]
  );
  const provider = useProvider({ chainId });

  const walletAddress = useSelector(selectWalletAddress);
  const toast = useToast();

  const { data: balance, isLoading: balanceLoading } = useBalance({
    addressOrName: walletAddress,
    chainId,
    watch: true,
  });

  const { data: baseFeePerGas, isLoading: baseFeePerGasLoading } = useQuery(
    ["baseFeePerGas"],
    async () => {
      const block = await provider.getBlock("latest");
      return block.baseFeePerGas;
    },
    { refetchInterval: 5000 }
  );
  const { data: feeData, isLoading: feeDataLoading } = useFeeData();

  const { mutate: lockWallet, isLoading: isLockingWallet } = useMutation(
    async () => {
      const privateKeys = await SecureStore.getItemAsync("privateKeys", {
        requireAuthentication: true,
      });
      if (!privateKeys) throw new Error("No private key");

      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const signatures = await signTransaction(transaction, token);
      const tx = bundleTransactions(transaction, {
        ...transaction,
        signatures,
        signer: "guardian",
      });

      const sender = new Wallet(
        JSON.parse(privateKeys)[walletAddress],
        provider
      );
      const laser = new Laser(provider, sender, tx.wallet);
      return laser.execTransaction(tx, sender, 150000);
    },
    {
      onSuccess: (transaction) => {
        toast.show({
          render: () => (
            <ToastAlert status="success" title="Transaction sent" />
          ),
        });
        dispatch(setChainId(chainId));
        dispatch(addPendingTransaction({ ...transaction, isLockVault: true }));
        navigation.navigate("Home", { tab: 1 });
      },
    }
  );

  const renderBalance = () => {
    if (balanceLoading || !balance) return <Skeleton w="16" h="6" />;

    return (
      <Text variant="subtitle1">
        {formatAmount(balance.value)} {balance.symbol}
      </Text>
    );
  };

  const renderDeployFee = () => {
    if (!feeData?.maxPriorityFeePerGas || !baseFeePerGas) {
      return <Skeleton w="16" h="5" />;
    }

    const gasFee = baseFeePerGas.add(feeData.maxPriorityFeePerGas).mul(100000);

    return (
      <Text variant="subtitle1">
        {formatAmount(gasFee, { precision: 6 })} ETH
      </Text>
    );
  };

  return (
    <Box p="4">
      <Text variant="subtitle1">Transfer your vault</Text>
      <Text mb="4">
        For security, your vault will be locked for 5 days before you can
        complete the transfer.
      </Text>
      <WalletSelector />
      <Text variant="subtitle2" mt="2">
        Balance:
      </Text>
      {renderBalance()}
      <Text variant="subtitle2" mt="2">
        Network fee:
      </Text>
      {renderDeployFee()}
      <Button
        mt="4"
        isDisabled={
          !baseFeePerGas ||
          !feeData?.maxPriorityFeePerGas ||
          !balance ||
          baseFeePerGas
            .add(feeData.maxPriorityFeePerGas)
            .mul(100000)
            .gt(balance.value)
        }
        onPress={() => {
          lockWallet();
        }}
        isLoading={isLockingWallet}
      >
        Transfer
      </Button>
    </Box>
  );
};

export default RecoveryLockVaultScreen;
