import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Wallet } from "ethers";
import { LaserFactory } from "laser-sdk";
import { estimateDeployGas } from "laser-sdk/dist/utils";
import { random } from "lodash";
import { Box, Button, Skeleton, Text, useToast } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { useBalance, useFeeData, useProvider } from "wagmi";
import ToastAlert from "../components/ToastAlert/ToastAlert";
import WalletSelector from "../components/WalletSelector/WalletSelector";
import { selectGuardianAddresses } from "../features/guardians/guardiansSlice";
import { selectChainId } from "../features/network/networkSlice";
import { addPendingTransaction } from "../features/transactions/transactionsSlice";
import {
  selectRecoveryOwnerAddress,
  selectWalletAddress,
} from "../features/wallet/walletSlice";
import { useCreateVaultMutation } from "../graphql/types";
import { getItem } from "../services/keychain";
import formatAmount from "../utils/formatAmount";
import { getPrivateKey } from "../utils/wallet";

const SignUpDeployWalletScreen = () => {
  const chainId = useSelector(selectChainId);
  const provider = useProvider({ chainId });
  const navigation = useNavigation();
  const recoveryOwnerAddress = useSelector(selectRecoveryOwnerAddress);
  const dispatch = useDispatch();

  const walletAddress = useSelector(selectWalletAddress);
  const toast = useToast();
  const guardianAddresses = useSelector(selectGuardianAddresses);

  const { data: balance, isLoading: balanceLoading } = useBalance({
    addressOrName: walletAddress,
    chainId,
    watch: true,
  });

  const [saveVault] = useCreateVaultMutation();

  const { mutate: createVault, isLoading: isCreatingVault } = useMutation(
    async () => {
      const privateKey = await getPrivateKey(walletAddress);
      const ownerPrivateKey = await getItem("ownerPrivateKey");

      if (!ownerPrivateKey || !privateKey) throw new Error("No private key");

      const owner = new Wallet(ownerPrivateKey);
      const salt = random(0, 1000000);

      const factory = new LaserFactory(provider, owner);
      const vaultAddress = await factory.preComputeAddress(
        owner.address,
        [recoveryOwnerAddress],
        guardianAddresses,
        salt
      );
      await saveVault({
        variables: { input: { address: vaultAddress, chain_id: chainId } },
      });

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
      <Text mb="4">
        There is a one-time network fee to activate your vault.
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
          !gasEstimate ||
          !balance ||
          baseFeePerGas
            .add(feeData.maxPriorityFeePerGas)
            .mul(gasEstimate)
            .gt(balance.value)
        }
        onPress={() => createVault()}
        isLoading={isCreatingVault}
      >
        Activate
      </Button>
      <Button
        variant="subtle"
        mt="2"
        onPress={() => navigation.navigate("Home")}
        isDisabled={isCreatingVault}
      >
        Activate later
      </Button>
    </Box>
  );
};

export default SignUpDeployWalletScreen;
