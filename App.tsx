import "./src/global";
import "react-native-get-random-values";
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
      <QueryClientProvider client={queryClient}>
        <NativeBaseProvider theme={theme}>
          <NavigationContainer theme={{ colors: { background: "white" } }}>
            <AppNavigator />
          </NavigationContainer>
        </NativeBaseProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
