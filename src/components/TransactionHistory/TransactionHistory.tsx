import { format, fromUnixTime } from "date-fns";
import { formatEther } from "ethers/lib/utils";
import Constants from "expo-constants";
import { orderBy } from "lodash";
import { Box, FlatList, Image, Pressable, Text } from "native-base";
import { useMemo } from "react";
import { RefreshControl } from "react-native";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import ethIcon from "../../../assets/eth-icon.png";
import { selectChainId } from "../../features/network/networkSlice";
import { getTransactions } from "../../services/etherscan";
import formatAddress from "../../utils/formatAddress";
interface Transaction {
  blockNumber: string;
  contractAddress: string;
  errCode: string;
  from: string;
  gas: string;
  gasUsed: string;
  hash: string;
  input: string;
  isError: string;
  timeStamp: string;
  traceId: string;
  to: string;
  type: string;
  value: string;
}

interface TransactionERC20 extends Transaction {
  nonce: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gasPrice: string;
  cumulativeGasUsed: string;
  confirmations: string;
}

interface Props {
  walletAddress: string;
}

const TransactionHistory = ({ walletAddress }: Props) => {
  const chainId = useSelector(selectChainId);

  const selectTransactions = (result: Transaction[]) =>
    result.filter(
      (transaction) =>
        transaction.from !==
        Constants.manifest?.extra?.relayerAddress.toLowerCase()
    );

  const selectInternalTxs = (result: Transaction[]) =>
    result.filter(
      (transaction) =>
        transaction.type === "call" &&
        transaction.from === walletAddress.toLowerCase() &&
        transaction.to.toLowerCase() !==
          Constants.manifest?.extra?.relayerAddress.toLowerCase()
    );

  const {
    data: transactions,
    isLoading: txsLoading,
    refetch: refetchTxs,
  } = useQuery<Transaction[]>(
    "transactions",
    () => getTransactions(walletAddress, chainId),
    { select: selectTransactions }
  );

  const {
    data: internalTxs,
    isLoading: internalTxsLoading,
    refetch: refetchInternalTxs,
  } = useQuery<Transaction[]>(
    "internalTxs",
    () => getTransactions(walletAddress, chainId, true),
    { select: selectInternalTxs }
  );

  const allTransactions = useMemo(() => {
    return orderBy(
      [...(internalTxs || []), ...(transactions || [])],
      "timeStamp",
      "desc"
    );
  }, [transactions, internalTxs]);

  return (
    <>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={allTransactions}
        refreshControl={
          <RefreshControl
            refreshing={txsLoading || internalTxsLoading}
            onRefresh={() => {
              refetchTxs();
              refetchInternalTxs();
            }}
          />
        }
        renderItem={({ item: transaction }) => (
          <Pressable>
            <Box flexDirection="row" alignItems="center">
              <Image source={ethIcon} size="9" alt="Ethereum icon" />
              <Box ml="3">
                <Text variant="subtitle1">
                  {transaction.to === walletAddress.toLowerCase()
                    ? "Received"
                    : "Send"}
                </Text>
                <Text>
                  {format(
                    fromUnixTime(parseInt(transaction.timeStamp, 10)),
                    "LLL d"
                  )}{" "}
                  ·{" "}
                  {transaction.to === walletAddress.toLowerCase()
                    ? `From: ${formatAddress(transaction.from)}`
                    : `To: ${formatAddress(transaction.to)}`}
                </Text>
              </Box>
              <Text variant="subtitle1" ml="auto">
                {formatEther(transaction.value)} ETH
              </Text>
            </Box>
          </Pressable>
        )}
      />
    </>
  );
};

export default TransactionHistory;
