import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { add, format, fromUnixTime } from "date-fns";
import { LaserWallet__factory } from "laser-sdk/dist/typechain";
import {
  Box,
  Circle,
  FlatList,
  Icon,
  Image,
  Pressable,
  Text,
} from "native-base";
import { RefreshControl } from "react-native";
import { useSelector } from "react-redux";
import { useBalance, useProvider } from "wagmi";
import ethIcon from "../../../assets/eth-icon.png";
import { selectChainId } from "../../features/network/networkSlice";
import {
  selectIsVaultLocked,
  selectVaultAddress,
} from "../../features/wallet/walletSlice";
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
  const vaultAddress = useSelector(selectVaultAddress);
  const navigation = useNavigation();
  const isVaultLocked = useSelector(selectIsVaultLocked);
  const provider = useProvider({ chainId });

  const { data: lockTimestamp, isLoading: lockTimestampLoading } = useQuery(
    ["lockTimestamp", vaultAddress],
    () => {
      if (!vaultAddress) throw new Error();
      const vault = LaserWallet__factory.connect(vaultAddress, provider);
      return vault.getConfigTimestamp();
    },
    { enabled: !!vaultAddress }
  );

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
      {({ isPressed }) => (
        <Box
          flexDirection="row"
          alignItems="center"
          px="4"
          py="1.5"
          opacity={isPressed ? 0.3 : 1}
        >
          <Image
            source={{ uri: token.logoURI.replace("ipfs://", IPFS_GATEWAY_URL) }}
            fallbackSource={ethIcon}
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
      )}
    </Pressable>
  );

  const renderEth = () => {
    if (!balance) return null;
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
        {({ isPressed }) => (
          <Box
            flexDirection="row"
            alignItems="center"
            px="4"
            py="1.5"
            opacity={isPressed ? 0.3 : 1}
          >
            <Image source={ethIcon} size="9" alt="Token icon" />
            <Box ml="3">
              <Text variant="subtitle1">{balance.symbol}</Text>
              <Text>Ethereum</Text>
            </Box>
            <Text variant="subtitle1" ml="auto">
              {formatAmount(balance.value, { decimals: balance.decimals })}
            </Text>
          </Box>
        )}
      </Pressable>
    );
  };

  const renderActivateWallet = () => {
    if (vaultAddress && !isVaultLocked) return null;
    if (isVaultLocked)
      return (
        <Pressable
          onPress={() => {
            if (
              lockTimestamp &&
              add(fromUnixTime(lockTimestamp.toNumber()), { days: 0 }) <
                new Date()
            ) {
              navigation.navigate("RecoveryRecoverVault");
            }
          }}
        >
          {({ isPressed }) => (
            <Box
              borderColor="gray.200"
              borderBottomWidth="1"
              pt="2"
              p="4"
              flexDir="row"
              alignItems="center"
              mb="1"
              opacity={isPressed ? 0.3 : 1}
            >
              <Circle bg="gray.800" size="9">
                <Icon
                  as={Ionicons}
                  color="white"
                  name="ios-arrow-up"
                  size="5"
                />
              </Circle>
              <Box ml="3">
                <Text variant="subtitle1">Complete vault transfer</Text>
                <Text>
                  Transfer after{" "}
                  {lockTimestamp &&
                    format(
                      add(fromUnixTime(lockTimestamp.toNumber()), { days: 5 }),
                      "LLL d, h:mm a"
                    )}
                </Text>
              </Box>
            </Box>
          )}
        </Pressable>
      );

    return (
      <Pressable onPress={() => navigation.navigate("SignUpEmail")}>
        {({ isPressed }) => (
          <Box
            borderColor="gray.200"
            borderBottomWidth="1"
            pt="2"
            p="4"
            flexDir="row"
            alignItems="center"
            mb="1"
            opacity={isPressed ? 0.3 : 1}
          >
            <Circle bg="gray.800" size="9">
              <Icon as={Ionicons} color="white" name="ios-arrow-up" size="5" />
            </Circle>
            <Box ml="3">
              <Text variant="subtitle1">Activate vault</Text>
              <Text>Secure your wallet by activating your vault.</Text>
            </Box>
          </Box>
        )}
      </Pressable>
    );
  };

  return (
    <FlatList
      ListHeaderComponent={
        <Box>
          {renderActivateWallet()}
          {renderEth()}
        </Box>
      }
      data={tokens}
      renderItem={renderToken}
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
