import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { fromUnixTime } from "date-fns";
import Constants from "expo-constants";
import { orderBy } from "lodash";
import { Circle, Icon, SectionList } from "native-base";
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
import formatAmount from "../../utils/formatAmount";
import isEqualCaseInsensitive from "../../utils/isEqualCaseInsensitive";
import PendingTransactionItem from "../PendingTransactionItem/PendingTransactionItem";
import TransactionItem from "../TransactionItem/TransactionItem";
import TransactionItemContainer from "../TransactionItemContainer/TransactionItemContainer";

interface Props {
  walletAddress: string;
}

const TransactionHistory = ({ walletAddress }: Props) => {
  const chainId = useSelector(selectChainId);
  const pendingTransactions = useSelector(selectPendingTransactions);
  const navigation = useNavigation();
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
        const deployContractTx = txs.find((tx) => tx.type === "create");
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

  const renderDeployContractTx = () => {
    return (
      <TransactionItem
        onPress={() =>
          navigation.navigate("DeployWalletTransactionDetails", {
            transaction: deployWalletTx,
          })
        }
        icon={
          <Circle bg="gray.800" size="9">
            <Icon
              as={<Ionicons name="flash-outline" />}
              size="4"
              color="white"
            />
          </Circle>
        }
        title="Activate wallet"
        subtitle=""
        amount={`${formatAmount(deployWalletTx.value)} ETH`}
        timestamp={fromUnixTime(parseInt(deployWalletTx.timeStamp, 10))}
      />
    );
  };

  const renderTransaction = ({ item: transaction }: { item: Transaction }) => {
    if (transaction.type === "call") return renderDeployContractTx(transaction);
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
