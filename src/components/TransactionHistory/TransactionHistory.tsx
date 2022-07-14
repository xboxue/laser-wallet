import Constants from "expo-constants";
import { keyBy, orderBy } from "lodash";
import { SectionList } from "native-base";
import { useMemo } from "react";
import { RefreshControl } from "react-native";
import { useQuery } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { useBalance, useProvider } from "wagmi";
import { selectChainId } from "../../features/network/networkSlice";
import {
  PendingTransaction,
  removePendingTransaction,
  selectPendingTransactions,
} from "../../features/transactions/transactionsSlice";
import useTokenBalances from "../../hooks/useTokenBalances";
import {
  getERC20Transfers,
  getTransactions,
  Transaction,
  TransactionERC20,
} from "../../services/etherscan";
import getTransactionType from "../../utils/getTransactionType";
import isEqualCaseInsensitive from "../../utils/isEqualCaseInsensitive";
import PendingTransactionItem from "../PendingTransactionItem/PendingTransactionItem";
import TransactionItem from "../TransactionItem/TransactionItem";

interface Props {
  walletAddress: string;
}

const TransactionHistory = ({ walletAddress }: Props) => {
  const chainId = useSelector(selectChainId);
  const pendingTransactions = useSelector(selectPendingTransactions);
  const provider = useProvider({ chainId });
  const dispatch = useDispatch();

  const { refetch: refetchTokens } = useTokenBalances(walletAddress);
  const { refetch: refetchBalance } = useBalance({
    addressOrName: walletAddress,
    chainId,
  });

  // Only has transactions where ETH is sent to the wallet
  // Filter out exec transactions from relayer
  const selectTransactions = (result: Transaction[]) =>
    result.filter(
      (transaction) =>
        !isEqualCaseInsensitive(
          transaction.from,
          Constants.manifest?.extra?.relayerAddress
        )
    );

  // Has all the transactions to and from the wallet
  // Filter out transactions to and from relayer
  const selectInternalTxs = (result: Transaction[]) =>
    result.filter(
      (transaction) =>
        transaction.type === "call" &&
        !isEqualCaseInsensitive(
          transaction.from,
          Constants.manifest?.extra?.relayerAddress
        ) &&
        !isEqualCaseInsensitive(
          transaction.to,
          Constants.manifest?.extra?.relayerAddress
        )
    );

  const {
    data: transactions = [],
    isLoading: txsLoading,
    refetch: refetchTxs,
  } = useQuery<Transaction[]>(
    "transactions",
    () => getTransactions(walletAddress, chainId),
    { select: selectTransactions }
  );

  // Determine the transaction type
  const {
    data: internalTxs = [],
    isLoading: internalTxsLoading,
    refetch: refetchInternalTxs,
  } = useQuery<Transaction[]>("internalTxs", () =>
    getTransactions(walletAddress, chainId, true)
      .then(selectInternalTxs)
      .then((transactions) =>
        Promise.all(
          transactions.map(async (transaction) => ({
            ...transaction,
            type: await getTransactionType(provider, transaction),
          }))
        )
      )
  );

  const {
    data: erc20Txs = [],
    isLoading: erc20TxsLoading,
    refetch: refetchERC20Txs,
  } = useQuery<TransactionERC20[]>("erc20Txs", () =>
    getERC20Transfers(walletAddress, chainId)
  );

  const allTransactions = useMemo(() => {
    const erc20TxsByHash = keyBy(erc20Txs, "hash");

    return orderBy(
      [
        ...internalTxs.filter(
          (transaction) =>
            !erc20TxsByHash[transaction.hash] ||
            // Remove redundant ERC20 transfer transactions
            !isEqualCaseInsensitive(
              erc20TxsByHash[transaction.hash]?.contractAddress,
              transaction.to
            )
        ),
        ...transactions,
        ...erc20Txs,
      ],
      "timeStamp",
      "desc"
    );
  }, [transactions, internalTxs, erc20Txs]);

  const handleRefresh = () => {
    refetchTxs();
    refetchInternalTxs();
    refetchERC20Txs();
    refetchTokens();
    refetchBalance();
  };

  const renderTransaction = ({ item: transaction }: { item: Transaction }) => {
    return <TransactionItem transaction={transaction} />;
  };

  const renderPendingTransaction = ({
    item: transaction,
  }: {
    item: PendingTransaction;
  }) => {
    return (
      <PendingTransactionItem
        transaction={transaction}
        onSuccess={() => {
          dispatch(removePendingTransaction(transaction.hash));
          handleRefresh();
        }}
      />
    );
  };

  return (
    <>
      <SectionList
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        sections={[
          { data: pendingTransactions, renderItem: renderPendingTransaction },
          { data: allTransactions, renderItem: renderTransaction },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={txsLoading || internalTxsLoading || erc20TxsLoading}
            onRefresh={handleRefresh}
          />
        }
      />
    </>
  );
};

export default TransactionHistory;
