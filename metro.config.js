const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Polyfill Node.js modules for WalletConnect
// Source: https://learn.figment.io/tutorials/how-to-successfully-connect-to-a-celo-wallet-with-a-react-native-dapp
config.resolver.extraNodeModules = {
  crypto: require.resolve("crypto-browserify"),
  url: require.resolve("url"),
  fs: require.resolve("expo-file-system"),
  http: require.resolve("stream-http"),
  https: require.resolve("https-browserify"),
  os: require.resolve("os-browserify/browser.js"),
  path: require.resolve("path-browserify"),
  stream: require.resolve("readable-stream"),
};

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...resolver.sourceExts, "svg"],
};

module.exports = config;
