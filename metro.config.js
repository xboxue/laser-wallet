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

module.exports = config;
