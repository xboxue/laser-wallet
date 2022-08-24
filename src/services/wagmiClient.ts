import Constants from "expo-constants";
import {
  configureChains,
  createClient,
  createStorage,
  defaultChains,
} from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import storage from "./mmkvStorage";

const { provider, webSocketProvider } = configureChains(defaultChains, [
  infuraProvider({ apiKey: Constants.expoConfig.extra.infuraApiKey }),
  alchemyProvider({ apiKey: Constants.expoConfig.extra.alchemyApiKey }),
  publicProvider(),
]);

const wagmiClient = createClient({
  provider,
  webSocketProvider,
  storage: createStorage({
    storage: {
      setItem: (key, value) => storage.set(key, value),
      getItem: (key) => storage.getString(key) || null,
      removeItem: (key) => storage.delete(key),
    },
  }),
});

export default wagmiClient;
