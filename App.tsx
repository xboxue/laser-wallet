import { ApolloProvider } from "@apollo/client";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
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

import { NativeBaseProvider, useToast } from "native-base";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import * as Sentry from "sentry-expo";
import { WagmiConfig } from "wagmi";
import ToastAlert from "./src/components/ToastAlert/ToastAlert";
import AppNavigator from "./src/navigators/AppNavigator";
import getApolloClient from "./src/services/apolloClient";
import getQueryClient from "./src/services/queryClient";
import wagmiClient from "./src/services/wagmiClient";
import { getPersistor, store } from "./src/store";
import theme from "./src/styles/theme";
import { excludeGraphQLFetch } from "apollo-link-sentry";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

const tokenCache = {
  getToken: (key: string) => AsyncStorage.getItem(key),
  saveToken: (key: string, value: string) => AsyncStorage.setItem(key, value),
};

Sentry.init({
  dsn: Constants.expoConfig.extra.sentryDsn,
  beforeBreadcrumb: excludeGraphQLFetch,
});

const AppWithQueryClient = () => {
  const toast = useToast();
  const { getToken } = useAuth();

  const onError = (error?: unknown) => {
    toast.show({
      render: () => (
        <ToastAlert
          status="error"
          title="Oops, something went wrong. Please try again."
          description={error?.message}
        />
      ),
    });
    if (error) {
      console.error(error);
      Sentry.Native.captureException(error);
    }
  };

  return (
    <ApolloProvider
      client={getApolloClient({
        getToken: () => getToken({ template: "hasura" }),
        onError,
      })}
    >
      <QueryClientProvider client={getQueryClient(onError)}>
        <NavigationContainer theme={{ colors: { background: "white" } }}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <AppNavigator />
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </NavigationContainer>
      </QueryClientProvider>
    </ApolloProvider>
  );
};

const App = () => {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!loaded) return <AppLoading />;

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={getPersistor()}>
        <WagmiConfig client={wagmiClient}>
          <ClerkProvider
            frontendApi={Constants.expoConfig.extra.clerkApi}
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
