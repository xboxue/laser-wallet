import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useQueries } from "@tanstack/react-query";
import { getProvider } from "@wagmi/core";
import { format, parseISO } from "date-fns";
import { getDeployedAddresses } from "laser-sdk/dist/constants";
import {
  LaserFactory__factory,
  LaserWallet__factory,
} from "laser-sdk/dist/typechain";
import { LaserCreatedEvent } from "laser-sdk/dist/typechain/deployments/mainnet/LaserFactory";
import { orderBy, sortBy } from "lodash";
import { Circle, Icon } from "native-base";
import { useMemo } from "react";
import { chain } from "wagmi";
import TokenItem from "../components/TokenItem/TokenItem";
import isEqualCaseInsensitive from "../utils/isEqualCaseInsensitive";

const RecoveryBackupsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { backups, nextScreen } = route.params;

  const vaultResults = useQueries({
    queries: [chain.mainnet, chain.goerli].map((chain) => ({
      queryKey: ["vaults", chain.id],
      queryFn: async () => {
        const provider = getProvider({ chainId: chain.id });
        const factory = LaserFactory__factory.connect(
          getDeployedAddresses(chain.id.toString()).laserFactory,
          provider
        );
        return factory.queryFilter(factory.filters.LaserCreated(null));
      },
      select: (data: LaserCreatedEvent[]) =>
        data.map((event) => ({ address: event.args[0], chainId: chain.id })),
    })),
  });

  const vaults = useMemo(
    () =>
      vaultResults
        .map((result) => result.data)
        .filter((data) => data)
        .flat(),
    [vaultResults]
  );

  const recoveryOwnerResults = useQueries({
    queries: vaults.map((vault) => ({
      queryKey: ["recoveryOwners", vault.address],
      queryFn: async () => {
        const provider = getProvider({ chainId: vault.chainId });
        return LaserWallet__factory.connect(
          vault.address,
          provider
        ).getRecoveryOwners();
      },
      select: (data) => ({ ...vault, recoveryOwners: data }),
      enabled: !!vault,
    })),
  });

  const vaultsWithRecoveryOwners = useMemo(
    () =>
      recoveryOwnerResults.map((result) => result.data).filter((data) => data),
    [recoveryOwnerResults]
  );

  const backupsWithVaults = useMemo(() => {
    return orderBy(backups, "lastModified", "desc").map((backup) => {
      const backupRecoveryOwner = backup.name.split("_")[2];
      if (!backupRecoveryOwner) return { ...backup, vaults: [] };

      const vaults = vaultsWithRecoveryOwners.filter((vault) =>
        vault.recoveryOwners.some((vaultRecoveryOwner) =>
          isEqualCaseInsensitive(vaultRecoveryOwner, backupRecoveryOwner)
        )
      );
      return { ...backup, vaults };
    });
  }, [recoveryOwnerResults]);

  return (
    <FlashList
      data={backupsWithVaults}
      estimatedItemSize={73}
      renderItem={({ item: backup }) => (
        <TokenItem
          title={`${format(parseISO(backup.lastModified), "LLL d, h:mm a")}`}
          subtitle={`${backup.vaults.length} vaults`}
          onPress={() =>
            navigation.navigate(nextScreen, {
              backupName: backup.name,
            })
          }
          icon={
            <Circle bg="gray.800" size="9">
              <Icon
                as={<Ionicons name="cloud-upload-outline" />}
                size="4"
                color="white"
              />
            </Circle>
          }
        />
      )}
    />
  );
};

export default RecoveryBackupsScreen;
