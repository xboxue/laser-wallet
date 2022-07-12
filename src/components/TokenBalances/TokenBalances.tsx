import { Box, Image, Pressable, SectionList, Text } from "native-base";
import { RefreshControl } from "react-native";
import { useSelector } from "react-redux";
import { useBalance } from "wagmi";
import ethIcon from "../../../assets/eth-icon.png";
import { selectChainId } from "../../features/network/networkSlice";
import useRefreshOnFocus from "../../hooks/useRefreshOnFocus";
import useTokenBalances, { TokenBalance } from "../../hooks/useTokenBalances";
import formatAmount from "../../utils/formatAmount";

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
    data: tokens,
    isLoading: tokensLoading,
    isError,
    refetch: refetchTokens,
  } = useTokenBalances(walletAddress);

  useRefreshOnFocus(refetchBalance);
  useRefreshOnFocus(refetchTokens);

  const renderToken = ({ item: token }: { item: TokenBalance }) => (
    <Pressable
      onPress={() =>
        onPress({
          address: token.address,
          balance: token.balance.toString(),
          symbol: token.symbol,
          decimals: token.decimals,
          isToken: true,
        })
      }
    >
      <Box flexDirection="row" alignItems="center" py="1">
        <Image
          source={{
            uri: token.logoURI.replace("ipfs://", IPFS_GATEWAY_URL),
          }}
          size="9"
          alt="Token icon"
        />
        <Box ml="3">
          <Text variant="subtitle1">{token.symbol}</Text>
          <Text>{token.name}</Text>
        </Box>
        <Text variant="subtitle1" ml="auto">
          {formatAmount(token.balance, { decimals: token.decimals })}
        </Text>
      </Box>
    </Pressable>
  );

  const renderEth = () => {
    if (!balance || balance.value.isZero()) return null;
    return (
      <Pressable
        onPress={() =>
          onPress({
            balance: balance.value.toString(),
            symbol: balance.symbol,
            decimals: balance.decimals,
            isToken: false,
          })
        }
      >
        <Box flexDirection="row" alignItems="center" py="1">
          <Image source={ethIcon} size="9" alt="Token icon" />
          <Box ml="3">
            <Text variant="subtitle1">{balance.symbol}</Text>
            <Text>Ethereum</Text>
          </Box>
          <Text variant="subtitle1" ml="auto">
            {formatAmount(balance.value, { decimals: balance.decimals })}
          </Text>
        </Box>
      </Pressable>
    );
  };
  return (
    <SectionList
      sections={[
        { data: [balance], renderItem: renderEth },
        { data: tokens || [], renderItem: renderToken },
      ]}
      contentContainerStyle={{ padding: 16, paddingTop: 8 }}
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
