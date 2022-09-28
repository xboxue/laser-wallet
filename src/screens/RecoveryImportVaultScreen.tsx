import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { Box, Button, Text } from "native-base";
import { useState } from "react";
import EnableICloudPrompt from "../components/EnableICloudPrompt/EnableICloudPrompt";
import { BACKUP_PREFIX } from "../constants/backups";
import { getBackups, signInToCloud } from "../services/cloudBackup";

const RecoveryImportVaultScreen = ({ route }) => {
  const navigation = useNavigation();
  const [iCloudPromptOpen, setICloudPromptOpen] = useState(false);

  const { mutate: getCloudBackups, isLoading: cloudBackupsLoading } =
    useMutation(
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
            navigation.navigate("RecoveryBackupPassword", {
              backupName: backups[0].name,
            });
          // else navigation.navigate("RecoveryBackupsScreen");
        },
        onError: (error) => {
          if (
            error instanceof Error &&
            error.message === "iCloud not available"
          )
            setICloudPromptOpen(true);
        },
      }
    );

  return (
    <Box p="4">
      <Text variant="subtitle1">Import your vault</Text>
      <Text>Transfer your Laser vault from your backup to this device.</Text>
      <Button
        mt="6"
        onPress={() => {
          if (!route.params) getCloudBackups();
          else navigation.navigate("RecoverySignIn", route.params);
        }}
        isLoading={cloudBackupsLoading}
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
      <EnableICloudPrompt
        open={iCloudPromptOpen}
        onClose={() => setICloudPromptOpen(false)}
      />
    </Box>
  );
};

export default RecoveryImportVaultScreen;
