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
import { NavigationContainer } from "@react-navigation/native";
import { NativeBaseProvider } from "native-base";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import AppNavigator from "./src/navigators/AppNavigator";
import { store } from "./src/store";
import theme from "./src/styles/theme";
import AppLoading from "expo-app-loading";
import { createClient, createStorage, WagmiConfig } from "wagmi";
import { MMKV } from "react-native-mmkv";
import { providers } from "ethers";

const storage = new MMKV();

const wagmiClient = createClient({
  provider: (config) =>
    new providers.AlchemyProvider(
      config.chainId,
      "e_-Jn9f06JUc7TXmtPdwzkI2TNdvjri1"
    ),
  storage: createStorage({
    storage: {
      setItem: (key, value) => storage.set(key, value),
      getItem: (key) => storage.getString(key) || null,
      removeItem: (key) => storage.delete(key),
    },
  }),
});
const queryClient = new QueryClient();

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
      <WagmiConfig client={wagmiClient}>
        <QueryClientProvider client={queryClient}>
          <NativeBaseProvider theme={theme}>
            <NavigationContainer theme={{ colors: { background: "white" } }}>
              <AppNavigator />
            </NavigationContainer>
          </NativeBaseProvider>
        </QueryClientProvider>
      </WagmiConfig>
    </Provider>
  );
};

export default App;
