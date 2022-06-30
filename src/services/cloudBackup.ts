import AES from "crypto-js/aes";
import { Platform } from "react-native";
import RNCloudFs from "react-native-cloud-fs";
import RNFS from "react-native-fs";

const BACKUP_DIR = "laser";

export const deleteBackups = async () => {
  if (Platform.OS === "android") await RNCloudFs.loginIfNeeded();

  const backups = await getBackups();
  return Promise.all(
    backups.files.map((file) => RNCloudFs.deleteFromCloud(file))
  );
};

export const getBackups = async () => {
  if (Platform.OS === "android") await RNCloudFs.loginIfNeeded();

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
  if (Platform.OS === "android") await RNCloudFs.loginIfNeeded();

  const encryptedData = AES.encrypt(JSON.stringify(data), password).toString();

  const path = `${RNFS.DocumentDirectoryPath}${fileName}`;
  const targetPath = `${BACKUP_DIR}/${fileName}`;
  const scope = "hidden";

  await RNFS.writeFile(path, encryptedData, "utf8");

  const result = await RNCloudFs.copyToCloud({
    mimeType: "text/plain",
    scope,
    sourcePath: { path },
    targetPath,
  });

  const exists = await RNCloudFs.fileExists(
    Platform.OS === "ios" ? { scope, targetPath } : { scope, fileId: result }
  );
  if (!exists) throw new Error("Backup failed");

  await RNFS.unlink(path);
  return result;
};

export const isValidPassword = (password: string) => {
  return password.length >= 8;
};
