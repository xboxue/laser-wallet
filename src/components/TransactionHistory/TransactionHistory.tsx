import { useQuery } from "@tanstack/react-query";
import { orderBy } from "lodash";
import { SectionList } from "native-base";
import { useMemo } from "react";
import { RefreshControl } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useBalance } from "wagmi";
import { selectChainId } from "../../features/network/networkSlice";
import {
  PendingTransaction,
  removePendingTransaction,
  selectPendingTransactions,
} from "../../features/transactions/transactionsSlice";
import useTokenBalances from "../../hooks/useTokenBalances";
import { getTransactions, Transaction } from "../../services/etherscan";
import PendingTransactionItem from "../PendingTransactionItem/PendingTransactionItem";
import TransactionItemContainer from "../TransactionItemContainer/TransactionItemContainer";

interface Props {
  walletAddress: string;
}

const TransactionHistory = ({ walletAddress }: Props) => {
  const chainId = useSelector(selectChainId);
  const pendingTransactions = useSelector(selectPendingTransactions);
  const dispatch = useDispatch();

  const { refetch: refetchTokens } = useTokenBalances(walletAddress);
  const { refetch: refetchBalance } = useBalance({
    addressOrName: walletAddress,
    chainId,
  });

  const {
    data: txs = [],
    isLoading: txsLoading,
    refetch: refetchTxs,
  } = useQuery(["transactions"], () =>
    getTransactions({ address: walletAddress, chainId })
  );

  const allTxs = useMemo(() => {
    return orderBy(txs, "timeStamp", "desc");
  }, [txs]);

  const handleRefresh = () => {
    refetchTxs();
    refetchTokens();
    refetchBalance();
  };

  const renderTransaction = ({ item: transaction }: { item: Transaction }) => {
    return <TransactionItemContainer transaction={transaction} />;
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
          { data: allTxs, renderItem: renderTransaction },
        ]}
        refreshControl={
          <RefreshControl refreshing={txsLoading} onRefresh={handleRefresh} />
        }
      />
    </>
  );
};

export default TransactionHistory;
