import { useNavigation } from "@react-navigation/native";
import { fromUnixTime } from "date-fns";
import { providers } from "ethers";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useProvider, useQuery } from "wagmi";
import { TRANSACTION_TYPES } from "../../constants/transactions";
import { selectChainId } from "../../features/network/networkSlice";
import {
  PendingTransaction,
  removePendingTransaction,
} from "../../features/transactions/transactionsSlice";
import { selectWalletAddress } from "../../features/wallet/walletSlice";
import useWaitForTransaction from "../../hooks/useWaitForTransaction";
import { decodeWalletTxData } from "../../utils/decodeTransactionData";
import TokenTransactionItem from "../TokenTransactionItem/TokenTransactionItem";
import WalletTransactionItem from "../WalletTransactionItem/WalletTransactionItem";

interface Props {
  transaction: PendingTransaction;
  onSuccess: (receipt: providers.TransactionReceipt) => void;
  txsByHash: Record<string, any>;
}

const PendingTransactionItem = ({
  transaction,
  onSuccess,
  txsByHash,
}: Props) => {
  const chainId = useSelector(selectChainId);
  const walletAddress = useSelector(selectWalletAddress);
  const provider = useProvider({ chainId });
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { data: receipt, isLoading: receiptLoading } = useWaitForTransaction({
    hash: transaction.hash,
    chainId,
    confirmations: 1,
    onSuccess,
  });

  useEffect(() => {
    if (receipt && txsByHash[receipt.transactionHash]) {
      dispatch(removePendingTransaction(transaction.hash));
    }
  }, [receipt, txsByHash]);

  const { data: txData, isLoading: txDataLoading } = useQuery(
    ["walletTxData", transaction.to, transaction.callData, receipt],
    async () => {
      const data = await decodeWalletTxData(
        provider,
        transaction.to,
        transaction.callData
      );
      return {
        ...data,
        from: {
          address: walletAddress,
          ensName: await provider.lookupAddress(walletAddress),
        },
        to: {
          address: transaction.to,
          ensName: await provider.lookupAddress(transaction.to),
        },
        value: transaction.value,
        timestamp: receipt
          ? fromUnixTime(
              (await provider.getBlock(receipt.blockNumber)).timestamp
            )
          : undefined,
      };
    }
  );

  if (!txData) return null;

  if (
    txData.type === TRANSACTION_TYPES.TOKEN_APPROVE ||
    txData.type === TRANSACTION_TYPES.TOKEN_TRANSFER
  )
    return (
      <TokenTransactionItem
        txData={txData}
        onPress={() => {
          if (receipt && !txDataLoading)
            navigation.navigate("TransactionDetails", {
              transaction: {
                hash: receipt.transactionHash,
                gasPrice: receipt.effectiveGasPrice,
                gasUsed: receipt.gasUsed,
              },
              txData,
            });
        }}
        isPending={receiptLoading}
      />
    );

  return (
    <WalletTransactionItem
      txData={txData}
      onPress={() => {
        if (receipt && !txDataLoading)
          navigation.navigate("TransactionDetails", {
            transaction: {
              hash: receipt.transactionHash,
              gasPrice: receipt.effectiveGasPrice,
              gasUsed: receipt.gasUsed,
            },
            txData,
          });
      }}
      isPending={receiptLoading}
    />
  );
};

export default PendingTransactionItem;
