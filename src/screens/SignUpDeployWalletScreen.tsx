import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import Constants from "expo-constants";
import { calculateDeploymentCost } from "laser-sdk/dist/utils";
import { Box, Button, Skeleton, Text, useToast } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { useBalance, useProvider } from "wagmi";
import CopyIconButton from "../components/CopyIconButton/CopyIconButton";
import ToastAlert from "../components/ToastAlert/ToastAlert";
import { DEFAULT_CHAIN } from "../constants/chains";
import { selectGuardianAddresses } from "../features/guardians/guardiansSlice";
import {
  addWallet,
  selectOwnerAddress,
  selectRecoveryOwnerAddress,
  selectSalt,
} from "../features/wallet/walletSlice";
import useLaserFactory from "../hooks/useLaserFactory";
import { createWallet } from "../services/wallet";
import formatAddress from "../utils/formatAddress";
import formatAmount from "../utils/formatAmount";
import waitForTransaction from "../utils/waitForTransaction";

const SignUpDeployWalletScreen = ({ route }) => {
  const chainId = route.params?.chainId || DEFAULT_CHAIN;
  const provider = useProvider({ chainId });
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const toast = useToast();

  const factory = useLaserFactory(chainId);
  const ownerAddress = useSelector(selectOwnerAddress);
  const recoveryOwnerAddress = useSelector(selectRecoveryOwnerAddress);
  const guardianAddresses = useSelector(selectGuardianAddresses);
  const salt = useSelector(selectSalt);

  const { data: walletAddress, isLoading: walletAddressLoading } = useQuery(
    ["walletAddress", chainId],
    () =>
      factory.preComputeAddress(
        ownerAddress,
        [recoveryOwnerAddress],
        guardianAddresses,
        salt
      )
  );

  const { data: balance, isLoading } = useBalance({
    addressOrName: walletAddress,
    chainId,
    watch: true,
  });

  const { mutate: onCreateWallet, isLoading: isCreating } = useMutation(
    async () => {
      const transaction = await factory.createWallet(
        ownerAddress,
        [recoveryOwnerAddress],
        guardianAddresses,
        0,
        0,
        BigNumber.from(deployFee?.gas).add(100000),
        salt,
        Constants.manifest?.extra?.relayerAddress
      );
      const hash = await createWallet({ chainId, transaction });
      return waitForTransaction({ hash, chainId });
    },
    {
      onSuccess: (receipt) => {
        if (receipt.status === 0) {
          toast.show({
            render: () => (
              <ToastAlert
                status="error"
                title="Wallet activation failed. Please try again"
              />
            ),
          });
        } else if (receipt.status === 1) {
          dispatch(addWallet({ address: walletAddress, chainId }));
          navigation.navigate("Home");
          toast.show({
            render: () => (
              <ToastAlert status="success" title="Wallet activated" />
            ),
          });
        }
      },
    }
  );

  const { data: deployFee, isLoading: deployFeeLoading } = useQuery(
    ["deployFee"],
    () =>
      calculateDeploymentCost(provider, guardianAddresses, [
        recoveryOwnerAddress,
      ])
  );

  const renderBalance = () => {
    if (isLoading || !balance) return <Skeleton />;

    return (
      <Text variant="subtitle1">
        {formatAmount(balance.value)} {balance.symbol}
      </Text>
    );
  };

  const renderDeployFee = () => {
    if (deployFeeLoading || !deployFee || !balance) return <Skeleton />;

    return (
      <Text variant="subtitle1">
        {formatAmount(parseEther(deployFee.eth), { precision: 6 })}{" "}
        {balance.symbol}
      </Text>
    );
  };

  return (
    <Box p="4">
      <Text variant="subtitle1">Activate wallet</Text>
      <Text mb="4">
        There is a one-time setup fee to activate your wallet. We recommend
        depositing more than the activation fee to account for network fee
        changes.
      </Text>
      <Text variant="subtitle2">Wallet address:</Text>
      {walletAddressLoading || !walletAddress ? (
        <Skeleton />
      ) : (
        <Box flexDir="row" alignItems="center">
          <Text variant="subtitle1">{formatAddress(walletAddress)}</Text>
          <CopyIconButton value={walletAddress} />
        </Box>
      )}
      <Text variant="subtitle2" mt="2">
        Current activation fee:{" "}
      </Text>
      {renderDeployFee()}
      <Text variant="subtitle2" mt="2">
        Balance:{" "}
      </Text>
      {renderBalance()}
      <Button
        mt="4"
        isDisabled={
          deployFeeLoading ||
          isLoading ||
          (deployFee && balance && balance.value.lt(parseEther(deployFee.eth)))
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
