import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { orderBy } from "lodash";
import { SectionList, useToast } from "native-base";
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
import { selectConnectors } from "../../features/walletConnect/walletConnectSlice";
import useTokenBalances from "../../hooks/useTokenBalances";
import { getTransactions, Transaction } from "../../services/etherscan";
import isEqualCaseInsensitive from "../../utils/isEqualCaseInsensitive";
import PendingTransactionItem from "../PendingTransactionItem/PendingTransactionItem";
import ToastAlert from "../ToastAlert/ToastAlert";
import TransactionItemContainer from "../TransactionItemContainer/TransactionItemContainer";

interface Props {
  walletAddress: string;
}

const TransactionHistory = ({ walletAddress }: Props) => {
  const chainId = useSelector(selectChainId);
  const pendingTransactions = useSelector(selectPendingTransactions);
  const connectors = useSelector(selectConnectors);
  const dispatch = useDispatch();
  const toast = useToast();

  const { refetch: refetchTokens } = useTokenBalances(walletAddress);
  const { refetch: refetchBalance } = useBalance({
    addressOrName: walletAddress,
    chainId,
  });

  const {
    data: txs = [],
    isLoading: txsLoading,
    refetch: refetchTxs,
  } = useQuery(["txs", walletAddress, chainId], () =>
    getTransactions({ address: walletAddress, chainId, sort: "desc" })
  );

  const {
    data: deployWalletTx,
    isLoading: deployWalletTxLoading,
    refetch: refetchDeployWalletTx,
  } = useQuery(
    ["deployWalletTx", walletAddress, chainId],
    async () =>
      getTransactions({
        address: walletAddress,
        chainId,
        internal: true,
        offset: 20,
      }),
    {
      select: (txs) => {
        const deployContractTx = txs.find((tx) => !tx.to);
        return (
          txs.find(
            (tx) =>
              tx.hash === deployContractTx?.hash &&
              isEqualCaseInsensitive(
                tx.to,
                Constants.expoConfig.extra.relayerAddress
              )
          ) || null
        );
      },
    }
  );

  const allTxs = useMemo(() => {
    if (!deployWalletTx) return txs;
    return orderBy([...txs, deployWalletTx], (tx) => tx.timeStamp, "desc");
  }, [txs, deployWalletTx]);

  const handleRefresh = () => {
    refetchTxs();
    refetchTokens();
    refetchBalance();
    refetchDeployWalletTx();
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
        onSuccess={(receipt) => {
          if (transaction.callRequest) {
            const connector = connectors.find(
              (connector) => connector.peerId === transaction.callRequest.peerId
            );
            if (!connector) return;
            connector.approveRequest({
              id: transaction.callRequest.id,
              result: receipt.transactionHash,
            });
          }
          dispatch(removePendingTransaction(transaction.hash));
          toast.show({
            render: () => (
              <ToastAlert status="success" title="Transaction confirmed" />
            ),
          });
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
          <RefreshControl
            refreshing={txsLoading || deployWalletTxLoading}
            onRefresh={handleRefresh}
          />
        }
      />
    </>
  );
};

export default TransactionHistory;
