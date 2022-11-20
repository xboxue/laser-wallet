import "dotenv/config";

export default {
  name: "Laser",
  slug: "laser-wallet",
  version: "1.0.7",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#111827",
  },
  updates: {
    fallbackToCacheTimeout: 5000,
    url: "https://u.expo.dev/7a661128-fd6d-4dce-b72e-2f5f2ead8a58",
  },
  assetBundlePatterns: ["**/*"],
  runtimeVersion: "1.0.7",
  ios: {
    supportsTablet: false,
    buildNumber: "1",
    bundleIdentifier: "com.laser.wallet",
    config: { usesNonExemptEncryption: false },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.laser.wallet",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "@react-native-google-signin/google-signin",
    "@config-plugins/android-jsc-intl",
    "sentry-expo",
  ],
  extra: {
    infuraApiKey: process.env.INFURA_API_KEY,
    alchemyApiKey: process.env.ALCHEMY_API_KEY,
    etherscanApiKey: process.env.ETHERSCAN_API_KEY,
    laserGuardianAddress: process.env.LASER_GUARDIAN_ADDRESS,
    relayerAddress: process.env.RELAYER_ADDRESS,
    sentryDsn: process.env.SENTRY_DSN,
    vaultApi: process.env.VAULT_API,
    graphqlApi: process.env.GRAPHQL_API,
    clerkApi: process.env.CLERK_API,
    graphqlApi: process.env.GRAPHQL_API,
    relayerApi: process.env.RELAYER_API,
    safeTransactionApi: process.env.SAFE_TRANSACTION_API,
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
