import { useNavigation } from "@react-navigation/native";
import { Box, Button, Text } from "native-base";

const SignUpBackupScreen = () => {
  const navigation = useNavigation();

  return (
    <Box>
      <Box p="4">
        <Text variant="subtitle1">Back up your recovery wallet</Text>
        <Text>
          Store the encrypted key of your recovery wallet. This will be used to
          recover your funds in case your device is lost.
        </Text>

        <Button
          mt="4"
          onPress={() => navigation.navigate("SignUpBackupPassword")}
        >
          Back up on Google Drive
        </Button>
      </Box>
    </Box>
  );
};

export default SignUpBackupScreen;
