import { useNavigation } from "@react-navigation/native";
import { Box, Button, Text } from "native-base";
import { Platform } from "react-native";

const RecoveryBackupScreen = ({ route }) => {
  const { wallets } = route.params;
  const navigation = useNavigation();

  return (
    <Box p="4">
      <Text variant="subtitle1">Back up your recovery phrase</Text>
      <Text>
        Your recovery phrase will be used to recover your wallet in case your
        device is lost.
      </Text>
      <Button
        mt="6"
        onPress={() => navigation.navigate("SignUpBackupPassword", { wallets })}
      >
        {`Back up on ${Platform.OS === "ios" ? "iCloud" : "Google Drive"}`}
      </Button>
      <Button
        variant="subtle"
        mt="2"
        onPress={() => navigation.navigate("RecoveryImportVault")}
      >
        Skip
      </Button>
    </Box>
  );
};

export default RecoveryBackupScreen;
