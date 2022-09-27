import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { Box, Button, Text } from "native-base";
import { useState } from "react";
import { Platform } from "react-native";
import RNCloudFs from "react-native-cloud-fs";
import EnableICloudPrompt from "../components/EnableICloudPrompt/EnableICloudPrompt";
import { BACKUP_PREFIX } from "../constants/backups";
import { getBackups, signInToCloud } from "../services/cloudBackup";

const RecoveryImportSeedPhraseScreen = () => {
  const navigation = useNavigation();
  const [iCloudPromptOpen, setICloudPromptOpen] = useState(false);

  const { mutate: getCloudBackups, isLoading } = useMutation(
    async () => {
      await signInToCloud();

      const data = await getBackups();
      return data.filter((backup) =>
        backup.name.startsWith(BACKUP_PREFIX.WALLET)
      );
    },
    {
      onSuccess: (backups) => {
        if (!backups.length) throw new Error("No backups found");
        else if (backups.length >= 1)
          navigation.navigate("RecoverySeedPhrasePassword", {
            backupName: backups[0].name,
          });
        else navigation.navigate("RecoveryBackupsScreen");
      },
      onError: (error) => {
        if (error instanceof Error && error.message === "iCloud not available")
          setICloudPromptOpen(true);
      },
    }
  );

  return (
    <Box p="4">
      <Text variant="subtitle1">Import your wallet</Text>
      <Text>
        Import your wallet with your 12 word recovery phrase or from a backup.
      </Text>

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
      <EnableICloudPrompt
        open={iCloudPromptOpen}
        onClose={() => setICloudPromptOpen(false)}
      />
    </Box>
  );
};

export default RecoveryImportSeedPhraseScreen;
