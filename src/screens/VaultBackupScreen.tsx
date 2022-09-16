import { useNavigation } from "@react-navigation/native";
import { Box, Button, Text } from "native-base";
import { Platform } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import RNCloudFs from "react-native-cloud-fs";

const VaultBackupScreen = () => {
  const navigation = useNavigation();

  return (
    <Box p="4">
      <Text variant="subtitle1">Back up your recovery key</Text>
      <Text>
        Your recovery key will be used to complete your wallet recovery in case
        your device is lost.
      </Text>

      <Button
        mt="4"
        onPress={async () => {
          if (Platform.OS === "android") {
            GoogleSignin.configure({
              scopes: ["https://www.googleapis.com/auth/drive.file"],
            });

            await GoogleSignin.hasPlayServices({
              showPlayServicesUpdateDialog: true,
            });

            const isSignedIn = await GoogleSignin.isSignedIn();
            if (!isSignedIn) {
              await GoogleSignin.signIn();
            }

            await RNCloudFs.loginIfNeeded();
          }

          navigation.navigate("VaultBackupPassword");
        }}
      >
        {`Back up on ${Platform.OS === "ios" ? "iCloud" : "Google Drive"}`}
      </Button>
    </Box>
  );
};

export default VaultBackupScreen;