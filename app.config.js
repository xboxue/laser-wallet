import "dotenv/config";

export default {
  name: "wallet-app",
  slug: "wallet-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    googleServicesFile: "./GoogleService-Info.plist",
    buildNumber: "2",
    bundleIdentifier: "com.xboxue.walletapp",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
    package: "com.xboxue.walletapp",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: ["@react-native-google-signin/google-signin"],
  extra: {
    relayerUrl: process.env.RELAYER_URL,
    alchemyApiKey: process.env.ALCHEMY_API_KEY,
    etherscanApiKey: process.env.ETHERSCAN_API_KEY,
    googleDriveApiKey: process.env.GOOGLE_DRIVE_API_KEY,
    laserGuardianAddress: process.env.LASER_GUARDIAN_ADDRESS,
  },
};
