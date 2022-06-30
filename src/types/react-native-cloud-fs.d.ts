declare module "react-native-cloud-fs" {
  type Scope = "visible" | "hidden";

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
  }): Promise<{ files: any[] }>;

  function deleteFromCloud(file: any): Promise<boolean>;

  function loginIfNeeded(): Promise<boolean>;
}
