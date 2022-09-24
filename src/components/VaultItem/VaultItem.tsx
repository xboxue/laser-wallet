import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import * as WebBrowser from "expo-web-browser";
import { LaserWallet__factory } from "laser-sdk/dist/typechain";
import {
  Badge,
  Box,
  Circle,
  Icon,
  Pressable,
  Skeleton,
  Text,
} from "native-base";
import { useMemo } from "react";
import { defaultChains, useProvider } from "wagmi";
import { getAddressUrl } from "../../services/etherscan";
import formatAddress from "../../utils/formatAddress";

interface Props {
  address: string;
  chainId: number;
  createdAt: string;
  getBackup: (recoveryOwners: string[]) => { name: string } | undefined;
}

const VaultItem = ({ address, chainId, createdAt, getBackup }: Props) => {
  const navigation = useNavigation();
  const provider = useProvider({ chainId });

  const { data: recoveryOwners, isLoading: recoveryOwnersLoading } = useQuery(
    ["vaultRecoveryOwners", address, chainId],
    () => {
      const vault = LaserWallet__factory.connect(address, provider);
      return vault.getRecoveryOwners();
    }
  );
  const backup = useMemo(
    () => (recoveryOwners ? getBackup(recoveryOwners) : undefined),
    [recoveryOwners]
  );

  return (
    <Pressable
      isDisabled={!backup}
      onPress={() => {
        if (backup)
          navigation.navigate("RecoveryBackupPassword", {
            address,
            chainId,
            backupName: backup.name,
          });
      }}
    >
      {({ isPressed }) => (
        <Box
          py={2}
          flexDir="row"
          alignItems="center"
          opacity={isPressed ? 0.3 : 1}
        >
          <Circle bg="gray.800" size="9">
            <Icon
              as={<Ionicons name="flash-outline" />}
              size="4"
              color="white"
            />
          </Circle>
          <Box ml="3">
            <Pressable
              onPress={() =>
                WebBrowser.openBrowserAsync(getAddressUrl(chainId, address))
              }
            >
              {({ isPressed }) => (
                <Box
                  flexDir="row"
                  alignItems="center"
                  opacity={isPressed ? 0.3 : 1}
                >
                  <Text variant="subtitle1" mr={2}>
                    {formatAddress(address)}
                  </Text>
                  <Icon as={<Ionicons name="open-outline" />} size="4" />
                </Box>
              )}
            </Pressable>
            <Text>
              {defaultChains.find((chain) => chain.id === chainId)?.name} ·{" "}
              {format(parseISO(createdAt), "LLL d")}
            </Text>
          </Box>
          <Box ml="auto">
            {recoveryOwnersLoading ? (
              <Skeleton w="16" h="5" />
            ) : !!backup ? (
              <Badge
                _text={{ fontSize: "xs" }}
                colorScheme="success"
                rounded="md"
              >
                Backed up
              </Badge>
            ) : (
              <Badge
                _text={{ fontSize: "xs" }}
                colorScheme="danger"
                rounded="md"
              >
                No backup
              </Badge>
            )}
          </Box>
        </Box>
      )}
    </Pressable>
  );
};

export default VaultItem;
