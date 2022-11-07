import { FlashList } from "@shopify/flash-list";
import { Image } from "native-base";
import { useCallback } from "react";
import { RefreshControl } from "react-native";
import ethIcon from "../../../assets/eth-icon.png";
import useBalances from "../../hooks/useBalances";
import useRefreshOnFocus from "../../hooks/useRefreshOnFocus";
import TokenItem from "../TokenItem/TokenItem";

interface Props {
  walletAddress: string;
  onPress: (token: {
    address?: string;
    balance: string;
    symbol: string;
    decimals: number;
    isToken: boolean;
  }) => void;
}

const TokenBalances = ({ walletAddress, onPress }: Props) => {
  const { data: balances, isLoading, refetch } = useBalances(walletAddress);

  useRefreshOnFocus(refetch);
  useRefreshOnFocus(refetch);

  const renderItem = useCallback((item) => {
    const icon = item.iconUrl ? (
      <Image
        source={{ uri: item.iconUrl }}
        fallbackSource={ethIcon}
        size="9"
        alt="Token icon"
      />
    ) : (
      <Image source={ethIcon} size="9" alt="Token icon" />
    );

    return <TokenItem icon={icon} {...item} onPress={() => onPress(item)} />;
  }, []);

  return (
    <FlashList
      data={balances}
      estimatedItemSize={77}
      renderItem={({ item }) => renderItem(item)}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    />
  );
};

export default TokenBalances;
