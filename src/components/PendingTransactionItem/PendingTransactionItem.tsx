import { useNavigation } from "@react-navigation/native";
import { providers } from "ethers";
import { Interface } from "ethers/lib/utils";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useProvider, useQuery, useWaitForTransaction } from "wagmi";
import { TRANSACTION_TYPES } from "../../constants/transactions";
import { selectChainId } from "../../features/network/networkSlice";
import {
  PendingTransaction,
  removePendingTransaction,
} from "../../features/transactions/transactionsSlice";
import { setVaultAddress } from "../../features/wallet/walletSlice";
import { decodeTxDataByHash } from "../../utils/decodeTransactionData";
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
  const provider = useProvider({ chainId });
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { data: receipt, isLoading: receiptLoading } = useWaitForTransaction({
    hash: transaction.hash,
    chainId,
    confirmations: 1,
    onSuccess,
  });

  // TODO: Make this a global listener
  useEffect(() => {
    if (receipt && txsByHash[transaction.hash]) {
      dispatch(removePendingTransaction(transaction.hash));
    }

    if (receipt && transaction.isDeployVault) {
      const iface = new Interface(["event LaserCreated(address laser)"]);
      const vaultAddress = iface.parseLog(receipt.logs[0]).args[0];
      dispatch(setVaultAddress(vaultAddress));
    }

    if (receipt && transaction.isLockVault) {
      dispatch(setVaultAddress(transaction.to));
    }
  }, [receipt, txsByHash, transaction]);

  const { data: txData, isLoading: txDataLoading } = useQuery(
    ["txData", transaction.hash, receipt],
    () => decodeTxDataByHash(provider, transaction.hash)
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
          navigation.navigate("TransactionDetails", {
            receipt: receipt
              ? {
                  gasPrice: receipt.effectiveGasPrice,
                  gasUsed: receipt.gasUsed,
                }
              : undefined,
            hash: transaction.hash,
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
        navigation.navigate("TransactionDetails", {
          receipt: receipt
            ? {
                gasPrice: receipt.effectiveGasPrice,
                gasUsed: receipt.gasUsed,
              }
            : undefined,
          hash: transaction.hash,
          txData,
        });
      }}
      isPending={receiptLoading}
    />
  );
};

export default PendingTransactionItem;
