import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { parseUnits } from "ethers/lib/utils";
import { orderBy, sortBy } from "lodash";
import { Box, Image, Pressable, Text } from "native-base";
import { useMemo } from "react";
import { RefreshControl } from "react-native";
import { useSelector } from "react-redux";
import bagIcon from "../../../assets/bag.png";
import ethIcon from "../../../assets/eth-icon.png";
import { selectChainId } from "../../features/network/networkSlice";
import { selectPendingTransactions } from "../../features/transactions/transactionsSlice";
import useTransfers from "../../hooks/useTransfers";
import { getTransactions } from "../../services/nxyz";
import formatAddress from "../../utils/formatAddress";
import formatAmount from "../../utils/formatAmount";
import isEqualCaseInsensitive from "../../utils/isEqualCaseInsensitive";
import Constants from "expo-constants";

const TokenItem = ({
  onPress,
  subtitle,
  title,
  rightText,
  icon,
  top,
}: Props) => {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Box
          flexDirection="row"
          alignItems="center"
          py="2"
          opacity={pressed ? 0.3 : 1}
          rounded="xl"
        >
          {icon}
          <Box ml="4" flex="1">
            <Text color="text.300">{top}</Text>
            <Text variant="subtitle1">{title}</Text>
            <Text color="text.300">{subtitle}</Text>
          </Box>
          {rightText}
        </Box>
      )}
    </Pressable>
  );
};

interface Props {
  walletAddress: string;
}

const PAGE_SIZE = 15;

const TransactionHistory = ({ walletAddress }: Props) => {
  const chainId = useSelector(selectChainId);

  const {
    data: txs = [],
    refetch: refetchTxs,
    isRefetching: isRefetchingTxs,
  } = useQuery(
    ["transactions", walletAddress],
    () => getTransactions(walletAddress, chainId),
    { select: (data) => data?.results }
  );

  const {
    data: transfersData,
    isLoading: transfersLoading,
    refetch: refetchTransfers,
    isRefetching: isRefetchingTransfers,
    fetchNextPage,
  } = useTransfers(walletAddress);

  const transfers = useMemo(
    () => transfersData?.pages.flatMap((page) => page.results) || [],
    [transfersData]
  );

  const allTxs = useMemo(
    () =>
      orderBy(
        [
          ...txs.filter(
            (tx) =>
              isEqualCaseInsensitive(tx.toAddress, walletAddress) &&
              !transfers.find((transfer) =>
                isEqualCaseInsensitive(
                  transfer.transactionHash,
                  tx.transactionHash
                )
              )
          ),
          ...transfers.filter(
            (transfer) =>
              !isEqualCaseInsensitive(
                transfer.to,
                Constants.expoConfig.extra.relayerAddress
              )
          ),
        ],
        (tx) => tx.executionDate || tx.timestamp,
        "desc"
      ),
    [txs, transfers]
  );

  const renderEmptyComponent = () => {
    return (
      <Box justifyContent="center" alignItems="center" pt="20">
        <Image source={bagIcon} size="xl" alt="bag" />
        <Text variant="h6" mt="4">
          No transactions
        </Text>
      </Box>
    );
  };

  const renderItem = (item) => {
    let rightText;
    if (item.type === "ERC20_TRANSFER" || item.type === "ETHER_TRANSFER") {
      const amount = `${formatAmount(item.value, {
        decimals: item.tokenInfo?.decimals || 18,
      })} ${item.tokenInfo?.symbol || "ETH"}`;

      const amountUSD = item.metadata?.currentPrice?.fiat
        ? formatAmount(
            parseUnits(item.value, item.metadata.decimals).mul(
              item.metadata.currentPrice.fiat[0].value
            ),
            {
              decimals:
                item.metadata.decimals * 2 +
                item.metadata.currentPrice.fiat[0].decimals,
              style: "currency",
              currency: "USD",
            }
          )
        : null;

      rightText = (
        <Box alignItems="flex-end">
          {isEqualCaseInsensitive(item.to, walletAddress) ? (
            <Text color="success.400" variant="subtitle1">
              +{amount}
            </Text>
          ) : (
            <Text color="danger.400" variant="subtitle1">
              -{amount}
            </Text>
          )}
          {amountUSD && <Text color="text.300">{amountUSD}</Text>}
        </Box>
      );
    }

    return (
      <TokenItem
        title={
          item.type === "ETHER_TRANSFER" ? "Ethereum" : item.tokenInfo?.name
        }
        top={format(parseISO(item.executionDate), "MMM d 'at' h:mm a")}
        subtitle={
          isEqualCaseInsensitive(item.to, walletAddress)
            ? `From ${formatAddress(item.from)}`
            : `To ${formatAddress(item.to)}`
        }
        rightText={rightText}
        icon={
          <Image
            source={
              item.type === "ERC20_TRANSFER" || item.type === "ETHER_TRANSFER"
                ? {
                    uri:
                      item.metadata?.symbolLogos?.[0].URI ||
                      "https://c.neevacdn.net/image/upload/tokenLogos/ethereum/ethereum.png",
                  }
                : item.type === "ERC721_TRANSFER"
                ? { uri: item.metadata?.nft.previews[0].URI }
                : undefined
            }
            fallbackSource={ethIcon}
            size="9"
            alt="Token icon"
            rounded={item.type === "ERC721_TRANSFER" ? "sm" : "full"}
          />
        }
      />
    );
  };

  const renderIncomingItem = (item) => {
    let rightText = (
      <Box>
        {isEqualCaseInsensitive(item.toAddress, walletAddress) ? (
          <Text color="success.400" variant="subtitle1">
            +{item.value.pretty} {item.value.symbol}
          </Text>
        ) : (
          <Text color="danger.400" variant="subtitle1">
            -{item.value.pretty} {item.value.symbol}
          </Text>
        )}
        {item.value.fiat && (
          <Text color="text.300">${item.value.fiat[0].pretty}</Text>
        )}
      </Box>
    );

    return (
      <TokenItem
        title={item.value.name}
        top={format(parseISO(item.timestamp), "MMM d 'at' h:mm a")}
        subtitle={
          isEqualCaseInsensitive(item.toAddress, walletAddress)
            ? `From ${formatAddress(item.fromAddress)}`
            : `To ${formatAddress(item.toAddress)}`
        }
        rightText={rightText}
        icon={
          <Image
            source={{
              uri:
                item.value.symbolLogos?.[0].URI ||
                "https://c.neevacdn.net/image/upload/tokenLogos/ethereum/ethereum.png",
            }}
            fallbackSource={ethIcon}
            size="9"
            alt="Token icon"
            rounded={"sm"}
          />
        }
      />
    );
  };

  return (
    <Box px="4" flex="1">
      <FlashList
        data={allTxs}
        onEndReached={fetchNextPage}
        renderItem={({ item }) =>
          item.type ? renderItem(item) : renderIncomingItem(item)
        }
        estimatedItemSize={66}
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingTransfers}
            onRefresh={() => {
              refetchTxs();
              refetchTransfers();
            }}
          />
        }
        // onEndReached={() => {
        //   if (hasNextPage) fetchNextPage();
        // }}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmptyComponent}
      />
    </Box>
  );
};

export default TransactionHistory;
