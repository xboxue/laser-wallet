import { providers } from "ethers";
import { useSelector } from "react-redux";
import { useProvider, useQuery } from "wagmi";
import { TRANSACTION_TYPES } from "../../constants/transactions";
import { selectChainId } from "../../features/network/networkSlice";
import { PendingTransaction } from "../../features/transactions/transactionsSlice";
import { selectWalletAddress } from "../../features/wallet/walletSlice";
import useWaitForTransaction from "../../hooks/useWaitForTransaction";
import { decodeWalletTxData } from "../../utils/decodeTransactionData";
import TokenTransactionItem from "../TokenTransactionItem/TokenTransactionItem";
import WalletTransactionItem from "../WalletTransactionItem/WalletTransactionItem";

interface Props {
  transaction: PendingTransaction;
  onSuccess: (receipt: providers.TransactionReceipt) => void;
}

const PendingTransactionItem = ({ transaction, onSuccess }: Props) => {
  const chainId = useSelector(selectChainId);
  const walletAddress = useSelector(selectWalletAddress);
  const provider = useProvider({ chainId });

  useWaitForTransaction({
    hash: transaction.hash,
    chainId,
    confirmations: 1,
    onSuccess,
  });

  const { data: txData, isLoading: txDataLoading } = useQuery(
    ["walletTxData", transaction.to, transaction.callData],
    async () => {
      const data = await decodeWalletTxData(
        provider,
        transaction.to,
        transaction.callData
      );
      return {
        ...data,
        from: { address: walletAddress },
        to: {
          address: transaction.to,
          ensName: await provider.lookupAddress(transaction.to),
        },
        value: transaction.value,
      };
    }
  );

  if (!txData) return null;

  if (
    txData.type === TRANSACTION_TYPES.TOKEN_APPROVE ||
    txData.type === TRANSACTION_TYPES.TOKEN_TRANSFER
  )
    return (
      <TokenTransactionItem txData={txData} onPress={() => {}} isPending />
    );

  return <WalletTransactionItem txData={txData} onPress={() => {}} isPending />;
};

export default PendingTransactionItem;
