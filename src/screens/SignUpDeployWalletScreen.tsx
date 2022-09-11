import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Wallet } from "ethers";
import * as SecureStore from "expo-secure-store";
import { LaserFactory } from "laser-sdk";
import { estimateDeployGas } from "laser-sdk/dist/utils";
import { Box, Button, Skeleton, Text, useToast } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { useBalance, useFeeData, useProvider } from "wagmi";
import ToastAlert from "../components/ToastAlert/ToastAlert";
import { selectGuardianAddresses } from "../features/guardians/guardiansSlice";
import { selectChainId } from "../features/network/networkSlice";
import { addPendingTransaction } from "../features/transactions/transactionsSlice";
import { selectWalletAddress } from "../features/wallet/walletSlice";
import formatAmount from "../utils/formatAmount";

const SignUpDeployWalletScreen = ({ route }) => {
  const { salt, recoveryOwnerAddress } = route.params;
  const chainId = useSelector(selectChainId);
  const provider = useProvider({ chainId });
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const walletAddress = useSelector(selectWalletAddress);
  const toast = useToast();
  const guardianAddresses = useSelector(selectGuardianAddresses);

  const { data: balance, isLoading: balanceLoading } = useBalance({
    addressOrName: walletAddress,
    chainId,
    watch: true,
  });

  const { mutate: onCreateWallet, isLoading: isCreating } = useMutation(
    async () => {
      const privateKey = await SecureStore.getItemAsync("privateKey", {
        requireAuthentication: true,
      });
      const ownerPrivateKey = await SecureStore.getItemAsync(
        "ownerPrivateKey",
        { requireAuthentication: true }
      );

      if (!ownerPrivateKey || !privateKey) throw new Error("No private key");

      const owner = new Wallet(ownerPrivateKey);

      const factory = new LaserFactory(provider, owner);
      return factory.createWallet(
        owner.address,
        [recoveryOwnerAddress],
        guardianAddresses,
        salt,
        new Wallet(privateKey)
      );
    },
    {
      onSuccess: (transaction) => {
        toast.show({
          render: () => (
            <ToastAlert status="success" title="Transaction sent" />
          ),
        });
        dispatch(
          addPendingTransaction({ ...transaction, isDeployVault: true })
        );
        navigation.navigate("Home", { tab: 1 });
      },
    }
  );

  const { data: gasEstimate, isLoading: gasEstimateLoading } = useQuery(
    ["gasEstimate", guardianAddresses],
    () => estimateDeployGas(guardianAddresses, [recoveryOwnerAddress])
  );

  const { data: baseFeePerGas, isLoading: baseFeePerGasLoading } = useQuery(
    ["baseFeePerGas"],
    async () => {
      const block = await provider.getBlock("latest");
      return block.baseFeePerGas;
    },
    { refetchInterval: 5000 }
  );
  const { data: feeData, isLoading: feeDataLoading } = useFeeData();

  const renderBalance = () => {
    if (balanceLoading || !balance) return <Skeleton w="16" h="6" />;

    return (
      <Text variant="subtitle1">
        {formatAmount(balance.value)} {balance.symbol}
      </Text>
    );
  };

  const renderDeployFee = () => {
    if (!feeData?.maxPriorityFeePerGas || !baseFeePerGas || !gasEstimate) {
      return <Skeleton w="16" h="5" />;
    }

    const gasFee = baseFeePerGas
      .add(feeData.maxPriorityFeePerGas)
      .mul(gasEstimate);

    return (
      <Text variant="subtitle1">
        {formatAmount(gasFee, { precision: 6 })} ETH
      </Text>
    );
  };

  return (
    <Box p="4">
      <Text variant="subtitle1">Activate vault</Text>
      <Text>There is a one-time network fee to activate your vault.</Text>
      <Text variant="subtitle2" mt="2">
        Network fee:
      </Text>
      {renderDeployFee()}
      <Text variant="subtitle2" mt="2">
        Balance:
      </Text>
      {renderBalance()}
      <Button
        mt="4"
        isDisabled={
          !baseFeePerGas ||
          !feeData?.maxPriorityFeePerGas ||
          !gasEstimate ||
          !balance ||
          baseFeePerGas
            .add(feeData.maxPriorityFeePerGas)
            .mul(gasEstimate)
            .gt(balance.value)
        }
        onPress={() => onCreateWallet()}
        isLoading={isCreating}
      >
        Activate
      </Button>
      <Button
        variant="subtle"
        mt="2"
        onPress={() => navigation.navigate("Home")}
        isDisabled={isCreating}
      >
        Activate later
      </Button>
    </Box>
  );
};

export default SignUpDeployWalletScreen;
