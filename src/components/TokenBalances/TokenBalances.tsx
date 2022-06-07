import ethIcon from "crypto-icons-plus-128/src/ethereum.png";
import { formatEther } from "ethers/lib/utils";
import { zip } from "lodash";
import { Box, Image, Skeleton, Stack, Text } from "native-base";
import { useContractRead } from "wagmi";
import abi from "../../abis/BalanceChecker.abi.json";

const tokens = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x0000000000000000000000000000000000000000",
    icon: ethIcon,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ethereum",
    address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    icon: ethIcon,
  },
];

interface Props {
  walletAddress: string;
}

const TokenBalances = ({ walletAddress }: Props) => {
  const {
    data: balances,
    isLoading,
    error,
  } = useContractRead(
    {
      addressOrName: "0x9788C4E93f9002a7ad8e72633b11E8d1ecd51f9b",
      contractInterface: abi,
    },
    "balances",
    {
      args: [[walletAddress], tokens.map((token) => token.address)],
      chainId: 5,
    }
  );

  if (isLoading) return <Skeleton />;

  return (
    <Stack space="3">
      {zip(tokens, balances).map(([token, balance]) => {
        if (!balance.isZero())
          return (
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
          );
      })}
    </Stack>
  );
};

export default TokenBalances;
