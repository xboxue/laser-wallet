import axios from "axios";
import { format, fromUnixTime } from "date-fns";
import { providers } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { orderBy } from "lodash";
import { Box, FlatList, Pressable, Text } from "native-base";
import { useEffect, useState } from "react";
import formatAddress from "../../utils/formatAddress";
import Constants from "expo-constants";
import { RefreshControl } from "react-native";

interface Props {
  walletAddress: string;
}

const TransactionHistory = ({ walletAddress }: Props) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<
    providers.TransactionResponse[] | null
  >(null);

  const getHistory = async () => {
    setLoading(true);
    try {
      const params = {
        module: "account",
        address: walletAddress,
        startblock: 0,
        endblock: 99999999,
        sort: "asc",
        apikey: Constants.manifest?.extra?.etherscanApiKey,
      };
      const [{ data: internalTransactionData }, { data: transactionData }] =
        await Promise.all([
          axios.get(
            "https://api-goerli.etherscan.io/api",
            // "https://api.etherscan.io/api"
            { params: { ...params, action: "txlistinternal" } }
          ),
          axios.get(
            "https://api-goerli.etherscan.io/api",
            // "https://api.etherscan.io/api"
            { params: { ...params, action: "txlist" } }
          ),
        ]);

      const internalTransactions = internalTransactionData.result.filter(
        (transaction) =>
          transaction.type === "call" &&
          transaction.to.toLowerCase() !==
            Constants.manifest?.extra?.relayerAddress.toLowerCase() &&
          transaction.from === walletAddress.toLowerCase()
      );

      const transactions = transactionData.result.filter(
        (transaction) =>
          transaction.from !==
          Constants.manifest?.extra?.relayerAddress.toLowerCase()
      );

      setHistory(
        orderBy([...internalTransactions, ...transactions], "timeStamp", "desc")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getHistory();
  }, [walletAddress]);

  return (
    <>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={history}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={getHistory} />
        }
        renderItem={({ item: transaction }) => (
          <Pressable>
            <Box flexDirection="row" alignItems="center">
              {/* <Image source={token.icon} size="9" alt="ethereum-icon" /> */}
              <Box>
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
