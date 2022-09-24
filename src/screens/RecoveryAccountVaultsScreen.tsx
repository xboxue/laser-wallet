import { useQuery } from "@tanstack/react-query";
import { Box, FlatList, Skeleton, Text } from "native-base";
import VaultItem from "../components/VaultItem/VaultItem";
import { BACKUP_PREFIX } from "../constants/backups";
import { useGetVaultsQuery } from "../graphql/types";
import { getBackups } from "../services/cloudBackup";
import isEqualCaseInsensitive from "../utils/isEqualCaseInsensitive";

const RecoveryAccountVaultsScreen = () => {
  const { data: backups, isLoading: backupsLoading } = useQuery(
    ["backups"],
    () => getBackups(),
    {
      select: (data) =>
        data.filter((backup) => backup.name.startsWith(BACKUP_PREFIX.VAULT)),
    }
  );

  const { data, loading } = useGetVaultsQuery();

  return (
    <Box p="4">
      <Text variant="subtitle1">Import your vault</Text>
      <Text mb="2">Select the vault to transfer to this device.</Text>
      {loading || !data || backupsLoading ? (
        <Skeleton />
      ) : (
        <FlatList
          data={data.vault}
          renderItem={({ item }) => (
            <VaultItem
              address={item.address}
              chainId={item.chain_id}
              createdAt={item.created_at}
              getBackup={(recoveryOwners) => {
                return backups?.find((backup) =>
                  recoveryOwners?.find((recoveryOwner) =>
                    isEqualCaseInsensitive(
                      recoveryOwner,
                      backup.name.replace(`${BACKUP_PREFIX.VAULT}_`, "")
                    )
                  )
                );
              }}
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
