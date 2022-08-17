import { providers } from "ethers";
import { Box, Circle, Pressable, Spinner, Text } from "native-base";
import { useSelector } from "react-redux";
import { useEnsName } from "wagmi";
import { selectChainId } from "../../features/network/networkSlice";
import { PendingTransaction } from "../../features/transactions/transactionsSlice";
import useWaitForTransaction from "../../hooks/useWaitForTransaction";
import formatAddress from "../../utils/formatAddress";
import formatAmount from "../../utils/formatAmount";

interface Props {
  transaction: PendingTransaction;
  onSuccess: (receipt: providers.TransactionReceipt) => void;
}

const PendingTransactionItem = ({ transaction, onSuccess }: Props) => {
  const chainId = useSelector(selectChainId);
  useWaitForTransaction({
    hash: transaction.hash,
    chainId,
    confirmations: 1,
    onSuccess,
  });

  const { data: ensName } = useEnsName({
    address: transaction.to,
    chainId,
  });

  return (
    <Pressable>
      <Box flexDirection="row" alignItems="center" py="2">
        <Circle bg="gray.800" size="9">
          <Spinner color="white" />
        </Circle>
        <Box ml="3">
          <Text variant="subtitle1">Pending</Text>
          <Text>To: {ensName || formatAddress(transaction.to)}</Text>
        </Box>
        <Text variant="subtitle1" ml="auto">
          {formatAmount(transaction.value)} ETH
        </Text>
      </Box>
    </Pressable>
  );
};

export default PendingTransactionItem;
