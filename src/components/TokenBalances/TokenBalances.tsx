import { FlashList } from "@shopify/flash-list";
import { parseUnits } from "ethers/lib/utils";
import { Image } from "native-base";
import { useCallback } from "react";
import { RefreshControl } from "react-native";
import ethIcon from "../../../assets/eth-icon.png";
import useBalances from "../../hooks/useBalances";
import useRefreshOnFocus from "../../hooks/useRefreshOnFocus";
import formatAmount from "../../utils/formatAmount";
import TokenItem from "../TokenItem/TokenItem";

interface Props {
  walletAddress: string;
  onPress: (token: any) => void;
  limit?: number;
}

const TokenBalances = ({ walletAddress, onPress, limit }: Props) => {
  const {
    data: balances = [],
    isLoading,
    refetch,
  } = useBalances(walletAddress);

  useRefreshOnFocus(refetch);
  useRefreshOnFocus(refetch);

  const renderItem = useCallback((item) => {
    return (
      <TokenItem
        icon={
          <Image
            source={{
              uri:
                item.symbolLogos?.[0].URI ||
                "https://c.neevacdn.net/image/upload/tokenLogos/ethereum/ethereum.png",
            }}
            fallbackSource={ethIcon}
            size="9"
            alt="Token icon"
            rounded="full"
          />
        }
        title={item.name}
        subtitle={`${item.pretty} ${item.symbol}`}
        rightText={item.fiat ? `$${item.fiat[0].pretty}` : undefined}
        onPress={() => onPress(item)}
      />
    );
  }, []);

  return (
    <FlashList
      data={balances.slice(0, limit)}
      estimatedItemSize={77}
      renderItem={({ item }) => renderItem(item)}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    />
  );
};

export default TokenBalances;
