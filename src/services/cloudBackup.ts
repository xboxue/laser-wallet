import CryptoJS from "crypto-js";
import { Platform } from "react-native";
import RNCloudFs from "react-native-cloud-fs";
import RNFS from "react-native-fs";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const BACKUP_DIR = "laser";

export const deleteBackups = async () => {
  if (Platform.OS === "android") await RNCloudFs.loginIfNeeded();

  const backups = await getBackups();
  return Promise.all(backups.map((file) => RNCloudFs.deleteFromCloud(file)));
};

export const getBackups = async () => {
  if (Platform.OS === "ios") {
    const available = await RNCloudFs.isAvailable();
    if (!available) throw new Error("iCloud not available");
    await RNCloudFs.syncCloud();
  }

  if (Platform.OS === "android") await RNCloudFs.loginIfNeeded();

  const data = await RNCloudFs.listFiles({
    scope: "hidden",
    targetPath: BACKUP_DIR,
  });
  return data.files.map((file) => ({
    ...file,
    name: file.name.replace(`${BACKUP_DIR}/`, ""),
  }));
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

  const encryptedData = CryptoJS.AES.encrypt(data, password).toString();

  const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
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

export const getBackup = async (backupPassword: string, fileName: string) => {
  const backups = await getBackups();
  if (!backups.length) throw new Error("No backups found");

  const backupFile = backups.find((file) => file.name === fileName);
  if (!backupFile) throw new Error("Backup file not found");

  const encryptedData =
    Platform.OS === "ios"
      ? await RNCloudFs.getIcloudDocument(fileName)
      : await RNCloudFs.getGoogleDriveDocument(backupFile.id);

  if (!encryptedData) throw new Error("Error getting backup data");
  const backupData = CryptoJS.AES.decrypt(
    encryptedData,
    backupPassword
  ).toString(CryptoJS.enc.Utf8);

  if (!backupData) throw new Error("Couldn't decrypt backup");
  return backupData;
};

export const isValidPassword = (password: string) => {
  return password.length >= 8;
};

export const signInToCloud = async () => {
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
  } else if (Platform.OS === "ios") {
    const available = await RNCloudFs.isAvailable();
    if (!available) throw new Error("iCloud not available");
  }
};
