import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useQueries } from "@tanstack/react-query";
import { defaultChains, getProvider } from "@wagmi/core";
import { format, parseISO } from "date-fns";
import { LaserWallet__factory } from "laser-sdk/dist/typechain";
import { Box, Circle, Icon, Skeleton, Text } from "native-base";
import { useMemo } from "react";
import TokenItem from "../components/TokenItem/TokenItem";
import { useGetVaultsQuery } from "../graphql/types";
import formatAddress from "../utils/formatAddress";
import isEqualCaseInsensitive from "../utils/isEqualCaseInsensitive";

const RecoveryAccountVaultsScreen = ({ route }) => {
  const { recoveryOwner } = route.params;
  const navigation = useNavigation();
  const { data, loading } = useGetVaultsQuery();

  const recoveryOwnerResults = useQueries({
    queries:
      data?.vault.map((vault) => ({
        queryKey: ["recoveryOwners", vault.address],
        queryFn: async () => {
          const provider = getProvider({ chainId: vault.chain_id });
          return LaserWallet__factory.connect(
            vault.address,
            provider
          ).getRecoveryOwners();
        },
        select: (data) => ({ ...vault, recoveryOwners: data }),
      })) || [],
  });

  const recoveryOwnerVaults = useMemo(
    () =>
      recoveryOwnerResults
        .map((result) => result.data)
        .filter((vault) =>
          vault?.recoveryOwners.some((address) =>
            isEqualCaseInsensitive(address, recoveryOwner.address)
          )
        ),
    [recoveryOwnerResults]
  );

  return (
    <Box flex={1}>
      <Box p="4" pb="2">
        <Text variant="subtitle1">Import your vault</Text>
        <Text>Select the vault to transfer to this device.</Text>
      </Box>
      <FlashList
        data={recoveryOwnerVaults}
        estimatedItemSize={76}
        ListEmptyComponent={
          <Box p="4">
            {loading ||
            recoveryOwnerResults.some((result) => result.isLoading) ? (
              <Skeleton />
            ) : (
              <Text variant="subtitle2" mx="auto">
                No vaults found
              </Text>
            )}
          </Box>
        }
        renderItem={({ item }) => (
          <TokenItem
            title={formatAddress(item.address)}
            subtitle={`${
              defaultChains.find((chain) => chain.id === item.chain_id)?.name
            } · ${format(parseISO(item.created_at), "LLL d")}`}
            onPress={() =>
              navigation.navigate("RecoveryLockVault", {
                recoveryOwner,
                vault: item,
              })
            }
            icon={
              <Circle bg="gray.800" size="9">
                <Icon
                  as={<Ionicons name="flash-outline" />}
                  size="4"
                  color="white"
                />
              </Circle>
            }
          />
        )}
      />
    </Box>
  );
};

export default RecoveryAccountVaultsScreen;
