import "dotenv/config";

export default {
  name: "Laser",
  slug: "laser-wallet",
  version: "1.0.1",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#000000",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: false,
    buildNumber: "1",
    bundleIdentifier: "com.laser.wallet",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#000000",
    },
    package: "com.laser.wallet",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: ["@react-native-google-signin/google-signin", "sentry-expo"],
  extra: {
    relayerUrl: process.env.RELAYER_URL,
    infuraApiKey: process.env.INFURA_API_KEY,
    alchemyApiKey: process.env.ALCHEMY_API_KEY,
    etherscanApiKey: process.env.ETHERSCAN_API_KEY,
    googleDriveApiKey: process.env.GOOGLE_DRIVE_API_KEY,
    laserGuardianAddress: process.env.LASER_GUARDIAN_ADDRESS,
    relayerAddress: process.env.RELAYER_ADDRESS,
    sentryDsn: process.env.SENTRY_DSN,
  },
  hooks: {
    postPublish: [
      {
        file: "sentry-expo/upload-sourcemaps",
        config: {
          organization: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
        },
      },
    ],
  },
};
