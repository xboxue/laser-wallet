declare module "react-native-cloud-fs" {
  type Scope = "visible" | "hidden";
  type File = { name: string; id: string };

  function isAvailable(): Promise<boolean>;

  function copyToCloud(options: {
    mimeType: string;
    scope: Scope;
    sourcePath: { uri?: string; path?: string };
    targetPath: string;
  }): Promise<string>;

  function fileExists(options: {
    scope: Scope;
    targetPath?: string;
    fileId?: string;
  }): Promise<boolean>;

  function listFiles(options: {
    scope: Scope;
    targetPath: string;
  }): Promise<{ files: File[] }>;

  function deleteFromCloud(file: File): Promise<boolean>;

  function loginIfNeeded(): Promise<boolean>;

  function getIcloudDocument(fileName: string): Promise<string>;

  function getGoogleDriveDocument(id: string): Promise<string>;
}
