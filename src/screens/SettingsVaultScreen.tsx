import { useNavigation } from "@react-navigation/native";
import { Box, Pressable, Text } from "native-base";

const SettingsVaultScreen = () => {
  const navigation = useNavigation();

  return (
    <Box px="4">
      <Pressable onPress={() => navigation.navigate("RecoveryImportVault")}>
        {({ isPressed }) => (
          <Box
            py="3"
            flexDir="row"
            alignItems="center"
            opacity={isPressed ? "0.2" : "1"}
          >
            <Text variant="subtitle1">Import vault</Text>
          </Box>
        )}
      </Pressable>
    </Box>
  );
};

export default SettingsVaultScreen;
