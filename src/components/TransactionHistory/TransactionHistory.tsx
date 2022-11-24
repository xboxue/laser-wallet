import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { Box, Image, Pressable, Text } from "native-base";
import { useMemo } from "react";
import { RefreshControl } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useProvider } from "wagmi";
import ethIcon from "../../../assets/eth-icon.png";
import { selectChainId } from "../../features/network/networkSlice";
import { selectPendingTransactions } from "../../features/transactions/transactionsSlice";
import useExchangeRates from "../../hooks/useExchangeRates";
import useTransfers from "../../hooks/useTransfers";
import formatAddress from "../../utils/formatAddress";
import formatAmount from "../../utils/formatAmount";
import isEqualCaseInsensitive from "../../utils/isEqualCaseInsensitive";

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
          <Box ml="4" flex={1}>
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
    data,
    isLoading: transfersLoading,
    refetch,
    isRefetching,
    fetchNextPage,
  } = useTransfers(walletAddress);

  const transfers = useMemo(
    () => data?.pages.flatMap((page) => page.results) || [],
    [data]
  );

  const pendingTxs = useSelector(selectPendingTransactions);

  // const renderEmptyComponent = useCallback(() => {
  //   return (
  //     <Box justifyContent="center" alignItems="center" flex={1}>
  //       {!txsLoading && !results.some((result) => result.isLoading) && (
  //         <Text variant="subtitle1">No transactions</Text>
  //       )}
  //     </Box>
  //   );
  // }, [results]);
  // if (
  //   (tokenMetadataLoading && !!tokenAddresses.length) ||
  //   (nftMetadataLoading && !!nfts.length) ||
  //   transfersLoading
  // ) {
  //   return null;
  // }

  const renderItem = ({ item }) => {
    let rightText;
    if (item.type === "ERC20_TRANSFER" || item.type === "ETHER_TRANSFER") {
      const amount = `${formatAmount(item.value, {
        decimals: item.tokenInfo?.decimals || 18,
      })} ${item.tokenInfo?.symbol || "ETH"}`;

      const amountUSD = item.metadata
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

  return (
    <Box px="4" flex="1">
      <FlashList
        key="1"
        data={transfers}
        onEndReached={fetchNextPage}
        renderItem={renderItem}
        estimatedItemSize={66}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        // onEndReached={() => {
        //   if (hasNextPage) fetchNextPage();
        // }}
        onEndReachedThreshold={0.3}
        // ListEmptyComponent={renderEmptyComponent}
      />
    </Box>
  );
};

export default TransactionHistory;
