import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, Icon, Spinner, Text } from "native-base";
import { Platform } from "react-native";
import { useSelector } from "react-redux";
import {
  selectEmail,
  selectRecoveryOwnerAddress,
} from "../features/wallet/walletSlice";
import { getBackups } from "../services/cloudBackup";
import Ionicons from "@expo/vector-icons/Ionicons";

const SettingsWalletRecoveryScreen = () => {
  const navigation = useNavigation();
  const recoveryOwnerAddress = useSelector(selectRecoveryOwnerAddress);
  const email = useSelector(selectEmail);

  const {
    data: backup,
    isLoading,
    refetch,
  } = useQuery(["backups"], () => getBackups(), {
    select: (backups) =>
      backups.find((backup) => backup.name.includes(recoveryOwnerAddress)),
  });

  const renderButton = () => {
    if (isLoading) return <Spinner />;
    if (backup)
      return (
        <Icon
          as={<Ionicons name="md-checkmark-circle" />}
          size="6"
          color="success.500"
        />
      );

    // return (
    //   <Button onPress={() => navigation.navigate("SettingsBackupPassword")}>
    //     Enable
    //   </Button>
    // );
  };

  return (
    <Box px="4">
      <Box py="3" flexDir="row" alignItems="center">
        <Text variant="subtitle1" flex="1">
          Back up on {Platform.OS === "ios" ? "iCloud" : "Google Drive"}
        </Text>
        <Box>{renderButton()}</Box>
      </Box>
      <Box py="3">
        <Text variant="subtitle2" color="text.300">
          Email
        </Text>
        <Text variant="subtitle1">{email}</Text>
      </Box>
      <Box py="3">
        <Button variant="ghost" _text={{ color: "red.400" }} onPress={() => {}}>
          Delete my account
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsWalletRecoveryScreen;
