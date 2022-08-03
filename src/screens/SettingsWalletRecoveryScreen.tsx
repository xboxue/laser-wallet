import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { Box, Button, Icon, Pressable, Spinner, Text } from "native-base";
import { Platform } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { selectBackupPassword } from "../features/auth/authSlice";
import {
  selectRecoveryOwnerAddress,
  selectRecoveryOwnerPrivateKey,
} from "../features/wallet/walletSlice";
import useRefreshOnFocus from "../hooks/useRefreshOnFocus";
import { getBackup } from "../services/cloudBackup";

const SettingsWalletRecoveryScreen = () => {
  const navigation = useNavigation();

  const recoveryOwnerAddress = useSelector(selectRecoveryOwnerAddress);
  const recoveryOwnerPrivateKey = useSelector(selectRecoveryOwnerPrivateKey);

  const backupPassword = useSelector(selectBackupPassword);

  const { data, isLoading, refetch } = useQuery(["backup"], () => {
    if (!backupPassword || !recoveryOwnerAddress)
      throw new Error("No backup password");
    return getBackup(backupPassword, recoveryOwnerAddress);
  });

  useRefreshOnFocus(refetch);

  const renderButton = () => {
    if (isLoading) return <Spinner />;
    if (data === recoveryOwnerPrivateKey)
      return (
        <Icon
          as={<Ionicons name="md-checkmark-circle" />}
          size="6"
          color="success.500"
        />
      );

    return (
      <Button onPress={() => navigation.navigate("SettingsBackupPassword")}>
        Enable
      </Button>
    );
  };

  return (
    <Box px="4">
      <Box py="3" flexDir="row" alignItems="center">
        <Text variant="subtitle1">
          Backup to {Platform.OS === "ios" ? "iCloud" : "Google Drive"}
        </Text>
        <Box ml="auto">{renderButton()}</Box>
      </Box>

      {data === recoveryOwnerPrivateKey && (
        <Pressable
          onPress={() => navigation.navigate("SettingsBackupPassword")}
        >
          {({ isPressed }) => (
            <Box
              py="3"
              flexDir="row"
              alignItems="center"
              opacity={isPressed ? "0.2" : "1"}
            >
              <Text variant="subtitle1">Change backup password</Text>
            </Box>
          )}
        </Pressable>
      )}
    </Box>
  );
};

export default SettingsWalletRecoveryScreen;
