// Polyfill Node.js modules for WalletConnect
// Source: https://learn.figment.io/tutorials/how-to-successfully-connect-to-a-celo-wallet-with-a-react-native-dapp
export interface Global {
  btoa: any;
  self: any;
  Buffer: any;
  process: any;
  location: any;
}

declare var global: Global;
if (typeof global.self === "undefined") {
  global.self = global;
}

if (typeof btoa === "undefined") {
  global.btoa = function (str: string) {
    return Buffer.from(str, "binary").toString("base64");
  };
}

global.Buffer = require("buffer").Buffer;
global.process = require("process");
global.location = {
  protocol: "https",
};
