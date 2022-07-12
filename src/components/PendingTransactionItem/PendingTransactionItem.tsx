import { Box, Image, Pressable, Text } from "native-base";
import { useSelector } from "react-redux";
import { useWaitForTransaction } from "wagmi";
import ethIcon from "../../../assets/eth-icon.png";
import { selectChainId } from "../../features/network/networkSlice";
import { PendingTransaction } from "../../features/transactions/transactionsSlice";
import formatAddress from "../../utils/formatAddress";
import formatAmount from "../../utils/formatAmount";

interface Props {
  transaction: PendingTransaction;
  onSuccess: () => void;
}

const PendingTransactionItem = ({ transaction, onSuccess }: Props) => {
  const chainId = useSelector(selectChainId);
  useWaitForTransaction({
    hash: transaction.hash,
    chainId,
    confirmations: 3,
    onSuccess,
  });

  return (
    <Pressable>
      <Box flexDirection="row" alignItems="center" py="2">
        <Image source={ethIcon} size="9" alt="Ethereum icon" />
        <Box ml="3">
          <Text variant="subtitle1">Pending</Text>
          <Text>To: {formatAddress(transaction.to)}</Text>
        </Box>
        <Text variant="subtitle1" ml="auto">
          {formatAmount(transaction.value)} ETH
        </Text>
      </Box>
    </Pressable>
  );
};

export default PendingTransactionItem;
