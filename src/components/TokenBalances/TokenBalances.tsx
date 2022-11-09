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
  onPress: (token: {
    address?: string;
    balance: string;
    symbol: string;
    decimals: number;
    isToken: boolean;
  }) => void;
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
            source={item.token?.logoUri ? { uri: item.token.logoUri } : ethIcon}
            fallbackSource={ethIcon}
            size="9"
            alt="Token icon"
          />
        }
        title={item.token?.name || "Ethereum"}
        subtitle={`${formatAmount(item.balance, {
          decimals: item.token?.decimals,
        })} ${item.token?.symbol || "ETH"}`}
        rightText={`$${parseFloat(item.fiatBalance).toFixed(2)}`}
        onPress={() =>
          onPress({
            address: item.token?.address,
            balance: item.balance,
            symbol: item.token?.symbol || "ETH",
            decimals: item.token?.decimals,
            isToken: !!item.token,
          })
        }
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
