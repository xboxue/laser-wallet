import { formatEther } from "ethers/lib/utils";
import { round, zip } from "lodash";
import { Box, FlatList, Image, Pressable, Skeleton, Text } from "native-base";
import { RefreshControl } from "react-native";
import { useSelector } from "react-redux";
import TOKENS from "../../constants/tokens";
import { selectChainId } from "../../features/network/networkSlice";
import useTokenBalances from "../../hooks/useTokenBalances";

interface Props {
  walletAddress: string;
  onPress: (symbol: string) => void;
}

const TokenBalances = ({ walletAddress, onPress }: Props) => {
  const chainId = useSelector(selectChainId);
  const tokens = TOKENS.filter(
    (token) => token.chainId === chainId || token.symbol === "ETH"
  );

  const {
    data: balances,
    isLoading,
    isError,
    refetch,
  } = useTokenBalances(
    [walletAddress],
    tokens.map((token) => token.address)
  );

  if (isLoading) return <Skeleton />;

  return (
    <FlatList
      data={zip(tokens, balances).filter(
        ([_, balance]) => balance && !balance.isZero()
      )}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
      renderItem={({ item: [token, balance] }) => (
        <Pressable
          onPress={() => onPress({ ...token, balance: formatEther(balance) })}
        >
          <Box flexDirection="row" alignItems="center" key={token.symbol}>
            <Image
              source={
                token.icon || {
                  uri: token.logoURI.replace(
                    "ipfs://",
                    "https://cloudflare-ipfs.com/ipfs/"
                  ),
                }
              }
              size="9"
              alt="token-icon"
            />
            <Box>
              <Text variant="subtitle1" ml="3">
                {token.symbol}
              </Text>
              <Text ml="3">{token.name}</Text>
            </Box>
            <Text variant="subtitle1" ml="auto">
              {round(formatEther(balance), 4)}
            </Text>
          </Box>
        </Pressable>
      )}
    />
  );
};

export default TokenBalances;
