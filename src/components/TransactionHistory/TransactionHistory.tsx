import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery, useQueries } from "@tanstack/react-query";
import { keyBy } from "lodash";
import { Box, Text } from "native-base";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { RefreshControl } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useProvider } from "wagmi";
import { TRANSACTION_TYPES } from "../../constants/transactions";
import { selectChainId } from "../../features/network/networkSlice";
import {
  removePendingTransaction,
  selectPendingTransactions,
} from "../../features/transactions/transactionsSlice";
import useRefreshOnFocus from "../../hooks/useRefreshOnFocus";
import { getTransactions } from "../../services/etherscan";
import { decodeTxDataByHash } from "../../utils/decodeTransactionData";
import isEqualCaseInsensitive from "../../utils/isEqualCaseInsensitive";
import TokenTransactionItem from "../TokenTransactionItem/TokenTransactionItem";
import WalletTransactionItem from "../WalletTransactionItem/WalletTransactionItem";

interface Props {
  walletAddress: string;
}

const PAGE_SIZE = 15;

const TransactionHistory = ({ walletAddress }: Props) => {
  const chainId = useSelector(selectChainId);
  const provider = useProvider({ chainId });
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const pendingTransactions = useSelector(selectPendingTransactions);
  const pendingTxs = useMemo(
    () =>
      pendingTransactions
        .filter(
          (tx) =>
            isEqualCaseInsensitive(tx.from, walletAddress) ||
            isEqualCaseInsensitive(tx.to, walletAddress)
        )
        .reverse(),
    [pendingTransactions, walletAddress]
  );

  const {
    data,
    isLoading: txsLoading,
    refetch: refetchTxs,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    ["txs", walletAddress, chainId],
    ({ pageParam = 1 }) =>
      getTransactions({
        address: walletAddress,
        chainId,
        sort: "desc",
        page: pageParam,
        offset: PAGE_SIZE,
      }),
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.length < PAGE_SIZE) return;
        return pages.length + 1;
      },
    }
  );
  const txs = useMemo(() => data?.pages?.flat() || [], [data]);
  const txsByHash = useMemo(() => keyBy(txs, "hash"), [txs]);
  const allTxs = useMemo(
    () => [...pendingTxs.filter((tx) => !txsByHash[tx.hash]), ...txs],
    [pendingTxs, txs]
  );

  useRefreshOnFocus(refetchTxs);
  useEffect(() => {
    for (const pendingTx of pendingTxs) {
      if (txsByHash[pendingTx.hash])
        dispatch(removePendingTransaction(pendingTx.hash));
    }
  }, [pendingTxs, txsByHash]);

  const results = useQueries({
    queries: allTxs.map((tx) => ({
      queryKey: ["tx", tx.hash],
      queryFn: () => decodeTxDataByHash(provider, tx.hash),
    })),
  });

  useEffect(() => {
    for (const [index, pendingTx] of Object.entries(pendingTxs)) {
      if (pendingTx.confirmed) {
        results[parseInt(index, 10)].refetch();
        refetchTxs();
      }
    }
  }, [pendingTxs]);

  const ref = useRef([]);
  const items = useMemo(() => {
    if (results.some((result) => result.isLoading)) return ref.current;
    return results.map((result) => result.data);
  }, [results]);

  useEffect(() => {
    ref.current = items;
  }, [items]);

  const renderTransaction = useCallback(
    ({ item: txData }) => {
      if (
        txData.type === TRANSACTION_TYPES.TOKEN_APPROVE ||
        txData.type === TRANSACTION_TYPES.TOKEN_TRANSFER
      ) {
        return (
          <TokenTransactionItem
            txData={txData}
            onPress={() =>
              navigation.navigate("TransactionDetails", { txData })
            }
          />
        );
      }

      return (
        <WalletTransactionItem
          txData={txData}
          onPress={() => navigation.navigate("TransactionDetails", { txData })}
        />
      );
    },
    [walletAddress]
  );

  const renderEmptyComponent = useCallback(() => {
    return (
      <Box justifyContent="center" alignItems="center" flex={1}>
        {!txsLoading && !results.some((result) => result.isLoading) && (
          <Text variant="subtitle1">No transactions</Text>
        )}
      </Box>
    );
  }, [results]);

  return (
    <FlashList
      contentContainerStyle={{ paddingTop: 8 }}
      data={items}
      renderItem={renderTransaction}
      estimatedItemSize={73}
      refreshControl={
        <RefreshControl
          refreshing={results.some((result) => result.isLoading)}
          onRefresh={refetchTxs}
        />
      }
      onEndReached={() => {
        if (hasNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.3}
      ListEmptyComponent={renderEmptyComponent}
    />
  );
};

export default TransactionHistory;
