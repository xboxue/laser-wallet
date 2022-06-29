import AES from "crypto-js/aes";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import RNCloudFs from "react-native-cloud-fs";

const BACKUP_DIR = "laser";

export const deleteBackups = async () => {
  const backups = await getBackups();
  return Promise.all(
    backups.files.map((file) => RNCloudFs.deleteFromCloud(file))
  );
};

export const getBackups = async () => {
  if (Platform.OS === "android") {
    await RNCloudFs.loginIfNeeded();
  }
  return RNCloudFs.listFiles({
    scope: "hidden",
    targetPath: BACKUP_DIR,
  });
};

export const createBackup = async (
  data: string,
  password: string,
  fileName: string
) => {
  if (!isValidPassword(password)) throw new Error("Invalid password");
  if (Platform.OS === "ios") {
    const available = await RNCloudFs.isAvailable();
    if (!available) throw new Error("iCloud not available");
  }
  const encryptedData = AES.encrypt(JSON.stringify(data), password).toString();

  const uri = `${FileSystem.documentDirectory}${fileName}`;
  const targetPath = `${BACKUP_DIR}/${fileName}`;
  const scope = "hidden";

  await FileSystem.writeAsStringAsync(uri, encryptedData);

  if (Platform.OS === "android") {
    await RNCloudFs.loginIfNeeded();
  }
  const result = await RNCloudFs.copyToCloud({
    mimeType: "text/plain",
    scope,
    sourcePath: { uri },
    targetPath,
  });

  const exists = await RNCloudFs.fileExists({ scope, targetPath });
  if (!exists) throw new Error("Backup failed");

  await FileSystem.deleteAsync(uri);
  return result;
};

export const isValidPassword = (password: string) => {
  return password.length >= 8;
};
