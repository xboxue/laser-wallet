import { useMutation, useQuery } from "@tanstack/react-query";
import { BigNumber } from "ethers";
import { Box, Button, Skeleton, Text } from "native-base";
import { useSelector } from "react-redux";
import { useBalance } from "wagmi";
import BottomSheet from "../../components/BottomSheet/BottomSheet";
import { WETH_CONTRACT } from "../../constants/contracts";
import { selectChainId } from "../../features/network/networkSlice";
import {
  selectSafeConfig,
  selectWalletAddress,
} from "../../features/wallet/walletSlice";
import { useCreateVaultMutation } from "../../graphql/types";
import { getTokenMetadata } from "../../services/nxyz";
import { createSafe } from "../../services/relayer";
import formatAmount from "../../utils/formatAmount";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (hash: string) => void;
}

const DeployBottomSheet = ({ isOpen, onClose, onSuccess }: Props) => {
  const safeConfig = useSelector(selectSafeConfig);
  const chainId = useSelector(selectChainId);
  const walletAddress = useSelector(selectWalletAddress);
  const [saveVault] = useCreateVaultMutation();

  const { data: balance, isLoading: balanceLoading } = useBalance({
    addressOrName: walletAddress,
    chainId,
    watch: true,
  });

  const { isLoading: isDeploying, mutate: deploy } = useMutation(
    async () => {
      await saveVault({
        variables: { input: { address: walletAddress, chain_id: chainId } },
      });
      const { relayTransactionHash: hash } = await createSafe({
        owners: safeConfig?.safeAccountConfig.owners,
        threshold: safeConfig?.safeAccountConfig.threshold,
        payment: safeConfig?.safeAccountConfig.payment,
        saltNonce: safeConfig?.safeDeploymentConfig?.saltNonce,
        chainId,
        safeAddress: walletAddress,
      });
      return hash;
    },
    { onSuccess }
  );

  const { data: tokenMetadata, isLoading: tokenMetadataLoading } = useQuery(
    ["tokenMetadata", WETH_CONTRACT],
    () => getTokenMetadata([WETH_CONTRACT], 1),
    { select: ([data]) => data }
  );

  const renderDeployFee = () => {
    if (!tokenMetadata) return <Skeleton w="16" h="5" />;

    return (
      <Box alignItems="flex-end">
        <Text variant="subtitle1">
          {formatAmount(safeConfig.safeAccountConfig.payment, {
            maximumFractionDigits: 6,
          })}{" "}
          ETH
        </Text>
        <Text color="text.300">
          {formatAmount(
            BigNumber.from(safeConfig.safeAccountConfig.payment).mul(
              tokenMetadata.currentPrice.fiat[0].value
            ),
            {
              decimals: 20,
              style: "currency",
              currency: "USD",
            }
          )}
        </Text>
      </Box>
    );
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <Box p="4">
        <Text variant="h5" mb="1">
          Activate your wallet
        </Text>
        <Text fontSize="md" color="text.300" mb="10">
          There is a network fee to activate your wallet. This fee will be taken
          from your balance.
        </Text>
        <Box flexDir="row" justifyContent="space-between" mt="4">
          <Text variant="subtitle1">Network fee</Text>
          {renderDeployFee()}
        </Box>

        <Box flexDir="row" mt="60">
          <Button variant="subtle" flex="1" mr="4" onPress={onClose}>
            Dismiss
          </Button>
          <Button
            isDisabled={
              !balance ||
              balance.value.lt(safeConfig?.safeAccountConfig.payment)
            }
            onPress={() => deploy()}
            isLoading={isDeploying}
            flex="1"
          >
            Confirm
          </Button>
        </Box>
      </Box>
    </BottomSheet>
  );
};

export default DeployBottomSheet;
