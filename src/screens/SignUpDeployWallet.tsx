import { useNavigation } from "@react-navigation/native";
import { providers, Wallet } from "ethers";
import { parseEther } from "ethers/lib/utils";
import Constants from "expo-constants";
import { LaserFactory } from "laser-sdk";
import { calculateDeploymentCost } from "laser-sdk/dist/utils";
import { Box, Button, Skeleton, Text } from "native-base";
import { useMutation, useQuery } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { useBalance, useProvider } from "wagmi";
import CopyIconButton from "../components/CopyIconButton/CopyIconButton";
import { selectGuardianAddresses } from "../features/guardians/guardiansSlice";
import { selectChainId } from "../features/network/networkSlice";
import {
  selectOwnerPrivateKey,
  selectRecoveryOwnerAddress,
  selectSalt,
  selectWalletAddress,
  setIsWalletDeployed,
} from "../features/wallet/walletSlice";
import { createWallet } from "../services/wallet";
import formatAddress from "../utils/formatAddress";
import formatAmount from "../utils/formatAmount";
import waitForTransaction from "../utils/waitForTransaction";

const SignUpDeployWallet = () => {
  const walletAddress = useSelector(selectWalletAddress);
  const chainId = useSelector(selectChainId);
  const { data: balance, isLoading } = useBalance({
    addressOrName: walletAddress,
    chainId,
    watch: true,
  });
  const ownerPrivateKey = useSelector(selectOwnerPrivateKey);
  const recoveryOwnerAddress = useSelector(selectRecoveryOwnerAddress);
  const guardianAddresses = useSelector(selectGuardianAddresses);
  const salt = useSelector(selectSalt);
  const provider = useProvider({ chainId });
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { mutate: onCreateWallet, isLoading: isCreating } = useMutation(
    async () => {
      const provider = new providers.InfuraProvider(
        chainId,
        Constants.manifest?.extra?.infuraApiKey
      );
      const owner = new Wallet(ownerPrivateKey);
      const factory = new LaserFactory(provider, owner);

      const transaction = await factory.createWallet(
        owner.address,
        [recoveryOwnerAddress],
        guardianAddresses,
        0,
        0,
        deployFee?.gas + 50000,
        salt,
        Constants.manifest?.extra?.relayerAddress
      );
      const hash = await createWallet({ chainId, transaction });
      return waitForTransaction(hash, chainId);
    },
    {
      onSuccess: () => {
        dispatch(setIsWalletDeployed(true));
        navigation.navigate("Home");
      },
    }
  );

  const { data: deployFee, isLoading: deployFeeLoading } = useQuery(
    "deployFee",
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
      <Box flexDir="row" alignItems="center">
        <Text variant="subtitle1">{formatAddress(walletAddress)}</Text>
        <CopyIconButton value={walletAddress} />
      </Box>
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
          deployFee && balance && balance.value.lt(parseEther(deployFee.eth))
        }
        onPress={() => onCreateWallet()}
        isLoading={isCreating}
      >
        Activate
      </Button>
      <Button
        variant="ghost"
        mt="1"
        onPress={() => navigation.navigate("Home")}
      >
        Activate later
      </Button>
    </Box>
  );
};

export default SignUpDeployWallet;
