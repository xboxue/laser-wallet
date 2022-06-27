import { formatEther } from "ethers/lib/utils";
import { zip } from "lodash";
import { Box, FlatList, Image, Pressable, Skeleton, Text } from "native-base";
import { RefreshControl } from "react-native";
import tokens from "../../constants/tokens";
import useTokenBalances from "../../hooks/useTokenBalances";

interface Props {
  walletAddress: string;
  onPress: (symbol: string) => void;
}

const TokenBalances = ({ walletAddress, onPress }: Props) => {
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
      data={zip(tokens, balances).filter(([_, balance]) => !balance.isZero())}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
      renderItem={({ item: [token, balance] }) => (
        <Pressable
          onPress={() => onPress({ ...token, balance: formatEther(balance) })}
        >
          <Box flexDirection="row" alignItems="center" key={token.symbol}>
            <Image source={token.icon} size="9" alt="ethereum-icon" />
            <Box>
              <Text variant="subtitle1" ml="3">
                {token.symbol}
              </Text>
              <Text ml="3">{token.name}</Text>
            </Box>
            <Text variant="subtitle1" ml="auto">
              {formatEther(balance).slice(0, 6)}
            </Text>
          </Box>
        </Pressable>
      )}
    />
  );
};

export default TokenBalances;
