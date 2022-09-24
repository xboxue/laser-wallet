import { useNavigation } from "@react-navigation/native";
import { Box, Button, Text } from "native-base";

const RecoveryImportVaultScreen = () => {
  const navigation = useNavigation();

  return (
    <Box p="4">
      <Text variant="subtitle1">Import your vault</Text>
      <Text>
        Transfer an existing Laser vault from another device to this one.
      </Text>
      <Button
        mt="6"
        onPress={() => navigation.navigate("RecoveryImportRecoveryKey")}
      >
        Next
      </Button>
      <Button
        variant="subtle"
        mt="2"
        onPress={() => navigation.navigate("Home")}
      >
        Skip
      </Button>
    </Box>
  );
};

export default RecoveryImportVaultScreen;
