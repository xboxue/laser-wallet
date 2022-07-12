import { format, fromUnixTime, isToday } from "date-fns";
import Constants from "expo-constants";
import { keyBy, orderBy } from "lodash";
import { Box, Image, Pressable, SectionList, Text } from "native-base";
import { useMemo } from "react";
import { RefreshControl } from "react-native";
import { useQuery } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { useBalance, useProvider } from "wagmi";
import ethIcon from "../../../assets/eth-icon.png";
import { tokensByAddress } from "../../constants/tokens";
import { TRANSACTION_TYPES } from "../../constants/transactions";
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
import formatAddress from "../../utils/formatAddress";
import formatAmount from "../../utils/formatAmount";
import getTransactionType from "../../utils/getTransactionType";
import isEqualCaseInsensitive from "../../utils/isEqualCaseInsensitive";
import PendingTransactionItem from "../PendingTransactionItem/PendingTransactionItem";

const titles = {
  [TRANSACTION_TYPES.CONTRACT_INTERACTION]: "Contract Interaction",
  [TRANSACTION_TYPES.DEPLOY_CONTRACT]: "Contract Deployment",
  [TRANSACTION_TYPES.SEND]: "Send",
  [TRANSACTION_TYPES.TOKEN_APPROVE]: "Approve",
  [TRANSACTION_TYPES.TOKEN_SET_APPROVAL_FOR_ALL]: "Set Approval for All",
  [TRANSACTION_TYPES.TOKEN_SAFE_TRANSFER_FROM]: "Safe Transfer From",
  [TRANSACTION_TYPES.TOKEN_TRANSFER]: "Transfer",
  [TRANSACTION_TYPES.TOKEN_TRANSFER_FROM]: "Transfer From",
};

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

  const renderTitle = (transaction: Transaction) => {
    // ERC20 transfer
    if (transaction.tokenSymbol) {
      if (isEqualCaseInsensitive(transaction.to, walletAddress))
        return `Receive ${transaction.tokenSymbol}`;
      return `Send ${transaction.tokenSymbol}`;
    }

    // Receive ETH
    if (isEqualCaseInsensitive(transaction.to, walletAddress)) return "Receive";

    return titles[transaction.type];
  };

  const renderTransaction = ({ item: transaction }: { item: Transaction }) => {
    const isToken = transaction.tokenName;
    const tokenUri = tokensByAddress[
      transaction.contractAddress
    ]?.logoURI?.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/");
    const date = fromUnixTime(parseInt(transaction.timeStamp));

    return (
      <Pressable>
        <Box flexDirection="row" alignItems="center" py="2">
          <Image
            source={isToken && tokenUri ? { uri: tokenUri } : ethIcon}
            size="9"
            alt="Ethereum icon"
          />
          <Box ml="3">
            <Text variant="subtitle1">{renderTitle(transaction)}</Text>
            <Text>
              {format(date, isToday(date) ? "h:mm a" : "LLL d")} ·{" "}
              {isEqualCaseInsensitive(transaction.to, walletAddress)
                ? `From: ${formatAddress(transaction.from)}`
                : `To: ${formatAddress(transaction.to)}`}
            </Text>
          </Box>
          <Text variant="subtitle1" ml="auto">
            {formatAmount(transaction.value, {
              decimals: transaction.tokenDecimal,
            })}{" "}
            {transaction.tokenSymbol || "ETH"}
          </Text>
        </Box>
      </Pressable>
    );
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
