import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { getProvider } from "@wagmi/core";
import { LaserWallet__factory } from "laser-sdk/dist/typechain";
import { Box, FlatList, Skeleton, Text } from "native-base";
import VaultItem from "../components/VaultItem/VaultItem";
import { useGetVaultsQuery } from "../graphql/types";
import isEqualCaseInsensitive from "../utils/isEqualCaseInsensitive";

const RecoveryAccountVaultsScreen = ({ route }) => {
  const { recoveryOwner } = route.params;
  const navigation = useNavigation();
  const { data, loading } = useGetVaultsQuery();

  const { data: vaults, isLoading: vaultsLoading } = useQuery(
    ["vaults"],
    () => {
      if (!data?.vault) throw new Error("No vaults");

      return Promise.all(
        data.vault.map(async (vault) => {
          const provider = getProvider({ chainId: vault.chain_id });
          const contract = LaserWallet__factory.connect(
            vault.address,
            provider
          );
          return {
            ...vault,
            recoveryOwners: await contract.getRecoveryOwners(),
          };
        })
      );
    },
    {
      enabled: !!data?.vault,
      select: (vaults) =>
        vaults.filter((vault) =>
          vault.recoveryOwners.some((address) =>
            isEqualCaseInsensitive(address, recoveryOwner.address)
          )
        ),
    }
  );

  return (
    <Box p="4">
      <Text variant="subtitle1">Import your vault</Text>
      <Text mb="2">Select the vault to transfer to this device.</Text>
      {loading || vaultsLoading ? (
        <Skeleton />
      ) : (
        <FlatList
          data={vaults}
          ListEmptyComponent={<Text>No vaults found</Text>}
          renderItem={({ item }) => (
            <VaultItem
              address={item.address}
              chainId={item.chain_id}
              createdAt={item.created_at}
              onPress={() =>
                navigation.navigate("RecoveryLockVault", {
                  recoveryOwner,
                  vault: item,
                })
              }
            />
          )}
        />
      )}

      {/* <Button mt="4" onPress={formik.handleSubmit} isLoading={isSigningIn}>
        Next
      </Button> */}
    </Box>
  );
};

export default RecoveryAccountVaultsScreen;
