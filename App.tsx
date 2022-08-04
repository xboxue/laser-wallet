import "./src/global";
import "react-native-get-random-values";
import "@ethersproject/shims";
import { ClerkProvider } from "@clerk/clerk-expo";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import AppLoading from "expo-app-loading";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { NativeBaseProvider, useToast } from "native-base";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import * as Sentry from "sentry-expo";
import { WagmiConfig } from "wagmi";
import ToastAlert from "./src/components/ToastAlert/ToastAlert";
import AppNavigator from "./src/navigators/AppNavigator";
import getQueryClient from "./src/services/queryClient";
import storage from "./src/services/mmkvStorage";
import wagmiClient from "./src/services/wagmiClient";
import { getPersistor, store } from "./src/store";
import theme from "./src/styles/theme";

Promise.allSettled = (promises: Promise<any>[]) => {
  return Promise.all(
    promises.map((promise) =>
      promise
        .then((value) => ({ status: "fulfilled", value }))
        .catch((reason) => ({ status: "rejected", reason }))
    )
  );
};

const tokenCache = {
  getToken: (key: string) => storage.getString(key),
  saveToken: (key: string, value: string) => storage.set(key, value),
};

Sentry.init({
  dsn: Constants.manifest?.extra?.sentryDsn,
});

const AppWithQueryClient = () => {
  const toast = useToast();

  const onError = (error: unknown) => {
    toast.show({
      render: ({ id }) => (
        <ToastAlert
          status="error"
          title={"Oops, something went wrong. Please try again."}
          description={error?.message}
        />
      ),
    });
    Sentry.Native.captureException(error);
  };

  return (
    <QueryClientProvider client={getQueryClient(onError)}>
      <NavigationContainer theme={{ colors: { background: "white" } }}>
        <AppNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  );
};

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
          <ClerkProvider
            frontendApi="clerk.eager.panda-0.lcl.dev"
            tokenCache={tokenCache}
          >
            <NativeBaseProvider theme={theme}>
              <AppWithQueryClient />
            </NativeBaseProvider>
          </ClerkProvider>
        </WagmiConfig>
      </PersistGate>
    </Provider>
  );
};

export default App;
