import { useAuth } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Wallet } from "ethers";
import { Laser } from "laser-sdk";
import { bundleTransactions } from "laser-sdk/dist/utils";
import { Box, Button, Skeleton, Text, useToast } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { useBalance, useFeeData, useProvider } from "wagmi";
import ToastAlert from "../components/ToastAlert/ToastAlert";
import WalletSelector from "../components/WalletSelector/WalletSelector";
import { setChainId } from "../features/network/networkSlice";
import { addPendingTransaction } from "../features/transactions/transactionsSlice";
import {
  selectOwnerAddress,
  selectWalletAddress,
} from "../features/wallet/walletSlice";
import { signTransaction } from "../services/vault";
import formatAmount from "../utils/formatAmount";
import { getPrivateKey } from "../utils/wallet";

const RecoveryLockVaultScreen = ({ route }) => {
  const { recoveryOwner, vault } = route.params;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const provider = useProvider({ chainId: vault.chain_id });
  const ownerAddress = useSelector(selectOwnerAddress);

  const walletAddress = useSelector(selectWalletAddress);
  const toast = useToast();

  const { data: balance, isLoading: balanceLoading } = useBalance({
    addressOrName: walletAddress,
    chainId: vault.chain_id,
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
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const laser = new Laser(provider, recoveryOwner, vault.address);
      const nonce = await laser.wallet.nonce();
      const tx = await laser.recover(ownerAddress, nonce);

      const privateKey = await getPrivateKey(walletAddress);

      const signatures = await signTransaction(tx, token);
      const bundledTx = bundleTransactions(tx, {
        ...tx,
        signatures,
        signer: "guardian",
      });

      const sender = new Wallet(privateKey, provider);
      return laser.execTransaction(bundledTx, sender, 150000);
    },
    {
      onSuccess: (transaction) => {
        toast.show({
          render: () => (
            <ToastAlert status="success" title="Transaction sent" />
          ),
          duration: 2000,
        });
        dispatch(setChainId(vault.chain_id));
        dispatch(addPendingTransaction({ ...transaction, isLockVault: true }));
        navigation.navigate("Activity");
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
        For security, your vault will be locked for 2 days after the transfer.
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
