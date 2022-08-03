import "./src/global";
import "react-native-get-random-values";
import "@ethersproject/shims";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import AppLoading from "expo-app-loading";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { NativeBaseProvider } from "native-base";
import { useEffect } from "react";
import { MMKV } from "react-native-mmkv";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import * as Sentry from "sentry-expo";
import {
  configureChains,
  createClient,
  createStorage,
  defaultChains,
  WagmiConfig,
} from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import AppNavigator from "./src/navigators/AppNavigator";
import { getPersistor, store } from "./src/store";
import theme from "./src/styles/theme";
import { ClerkProvider } from "@clerk/clerk-expo";

Promise.allSettled = (promises: Promise<any>[]) => {
  return Promise.all(
    promises.map((promise) =>
      promise
        .then((value) => ({ status: "fulfilled", value }))
        .catch((reason) => ({ status: "rejected", reason }))
    )
  );
};

const storage = new MMKV();

const tokenCache = {
  getToken: (key: string) => storage.getString(key),
  saveToken: (key: string, value: string) => storage.set(key, value),
};

const { provider, webSocketProvider } = configureChains(defaultChains, [
  infuraProvider({ infuraId: Constants.manifest?.extra?.infuraApiKey }),
  alchemyProvider({ alchemyId: Constants.manifest?.extra?.alchemyApiKey }),
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
Sentry.init({
  dsn: Constants.manifest?.extra?.sentryDsn,
});

const queryClient = new QueryClient({
  logger: {
    log: Sentry.Native.captureMessage,
    warn: Sentry.Native.captureMessage,
    error: Sentry.Native.captureException,
  },
});

const App = () => {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    const reset = async () => {
      const isStoreReset = await AsyncStorage.getItem("isStoreReset");
      if (!isStoreReset) {
        await SecureStore.deleteItemAsync("persist_auth");
        AsyncStorage.setItem("isStoreReset", "true");
      }
    };

    reset();
  }, []);

  if (!loaded) return <AppLoading />;

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={getPersistor()}>
        <WagmiConfig client={wagmiClient}>
          <QueryClientProvider client={queryClient}>
            <NativeBaseProvider theme={theme}>
              <ClerkProvider
                frontendApi="clerk.eager.panda-0.lcl.dev"
                tokenCache={tokenCache}
              >
                <NavigationContainer
                  theme={{ colors: { background: "white" } }}
                >
                  <AppNavigator />
                </NavigationContainer>
              </ClerkProvider>
            </NativeBaseProvider>
          </QueryClientProvider>
        </WagmiConfig>
      </PersistGate>
    </Provider>
  );
};

export default App;
