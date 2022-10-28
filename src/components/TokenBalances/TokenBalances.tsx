import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { add, format, fromUnixTime } from "date-fns";
import { LaserWallet__factory } from "laser-sdk/dist/typechain";
import { Circle, Icon, Image } from "native-base";
import { useMemo } from "react";
import { RefreshControl } from "react-native";
import { useSelector } from "react-redux";
import { useBalance, useProvider } from "wagmi";
import ethIcon from "../../../assets/eth-icon.png";
import { selectChainId } from "../../features/network/networkSlice";
import { selectVaultAddress } from "../../features/wallet/walletSlice";
import useRefreshOnFocus from "../../hooks/useRefreshOnFocus";
import useTokenBalances from "../../hooks/useTokenBalances";
import formatAmount from "../../utils/formatAmount";
import TokenItem from "../TokenItem/TokenItem";

const IPFS_GATEWAY_URL = "https://cloudflare-ipfs.com/ipfs/";

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
  const chainId = useSelector(selectChainId);
  const vaultAddress = useSelector(selectVaultAddress);
  const navigation = useNavigation();
  const provider = useProvider({ chainId });

  const {
    data: balance,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useBalance({
    addressOrName: walletAddress,
    chainId,
    watch: true,
  });

  const {
    data: tokens = [],
    isLoading: tokensLoading,
    refetch: refetchTokens,
  } = useTokenBalances(walletAddress);

  useRefreshOnFocus(refetchBalance);
  useRefreshOnFocus(refetchTokens);

  const tokenData = useMemo(() => {
    return tokens.map((token) => ({
      title: token.name,
      subtitle: token.symbol,
      rightText: formatAmount(token.balance, { decimals: token.decimals }),
      icon: (
        <Image
          source={{
            uri: token.logoURI.replace("ipfs://", IPFS_GATEWAY_URL),
          }}
          fallbackSource={ethIcon}
          size="9"
          alt="Token icon"
        />
      ),
      onPress: () =>
        onPress({
          address: token.address,
          balance: token.balance.toString(),
          symbol: token.symbol,
          decimals: token.decimals,
          isToken: true,
        }),
    }));
  }, [tokens]);

  const balanceData = useMemo(() => {
    if (!balance) return [];
    return [
      {
        title: "Ethereum",
        subtitle: balance.symbol,
        rightText: formatAmount(balance.value, {
          decimals: balance.decimals,
        }),
        icon: <Image source={ethIcon} size="9" alt="Token icon" />,
        onPress: () =>
          onPress({
            balance: balance.value.toString(),
            symbol: balance.symbol,
            decimals: balance.decimals,
            isToken: false,
          }),
      },
    ];
  }, [balance]);

  const items = useMemo(
    () => [...balanceData, ...tokenData],
    [balanceData, tokenData]
  );

  return (
    <FlashList
      data={items}
      estimatedItemSize={77}
      renderItem={({ item }) => <TokenItem {...item} />}
      contentContainerStyle={{ paddingTop: 8 }}
      refreshControl={
        <RefreshControl
          refreshing={tokensLoading || balanceLoading}
          onRefresh={() => {
            refetchBalance();
            refetchTokens();
          }}
        />
      }
    />
  );
};

export default TokenBalances;
