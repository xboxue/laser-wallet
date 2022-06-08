import { formatEther } from "ethers/lib/utils";
import { zip } from "lodash";
import { Box, Image, Pressable, Skeleton, Stack, Text } from "native-base";
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
  } = useTokenBalances(
    [walletAddress],
    tokens.map((token) => token.address)
  );

  if (isLoading) return <Skeleton />;

  return (
    <Stack space="3">
      {zip(tokens, balances).map(([token, balance]) => {
        if (!balance.isZero())
          return (
            <Pressable
              onPress={() =>
                onPress({ ...token, balance: formatEther(balance) })
              }
              key={token.symbol}
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
          );
      })}
    </Stack>
  );
};

export default TokenBalances;
