import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { Box, Button, Text } from "native-base";
import { Platform } from "react-native";
import RNCloudFs from "react-native-cloud-fs";
import { getBackups } from "../services/cloudBackup";

const RecoveryImportSeedPhraseScreen = () => {
  const navigation = useNavigation();
  const { mutate: getCloudBackups, isLoading } = useMutation(
    async () => {
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

      const data = await getBackups();
      return data.files.filter((backup) =>
        backup.name.startsWith("laser/backup")
      );
    },
    {
      onSuccess: (backups) => {
        if (!backups.length) throw new Error("No backups found");
        else if (backups.length >= 1)
          navigation.navigate("RecoverySeedPhrasePassword", {
            backupName: backups[0].name.replace("laser/", ""),
          });
        else navigation.navigate("RecoveryBackupsScreen");
      },
    }
  );
  return (
    <Box p="4">
      <Text variant="subtitle1">Import your wallet</Text>
      <Text>Import your wallet with your 12 word recovery phrase.</Text>

      <Button mt="6" isLoading={isLoading} onPress={() => getCloudBackups()}>
        {`Import from ${Platform.OS === "ios" ? "iCloud" : "Google Drive"}`}
      </Button>
      <Button
        variant="subtle"
        mt="2"
        onPress={() => navigation.navigate("RecoveryEnterSeedPhrase")}
      >
        Enter recovery phrase
      </Button>
    </Box>
  );
};

export default RecoveryImportSeedPhraseScreen;
