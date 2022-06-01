import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { NativeBaseProvider } from "native-base";
import useSecureStore from "./src/hooks/useSecureStore";
import HomeScreen from "./src/screens/HomeScreen";
import SendAddressScreen from "./src/screens/SendAddressScreen";
import SendAmountScreen from "./src/screens/SendAmountScreen";
import SendAssetScreen from "./src/screens/SendAssetScreen";
import SendConfirmScreen from "./src/screens/SendConfirmScreen";
import SignUpBackUpScreen from "./src/screens/SignUpBackUpScreen";
import SignUpGuardiansScreen from "./src/screens/SignUpGuardiansScreen";
import SignUpPasscodeScreen from "./src/screens/SignUpPasscodeScreen";
import StartScreen from "./src/screens/StartScreen";
import theme from "./src/styles/theme";

const Stack = createStackNavigator();

const App = () => {
  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const ownerAddress = useSecureStore("ownerAddress");

  return (
    <NativeBaseProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ ...TransitionPresets.SlideFromRightIOS }}
        >
          {ownerAddress ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="SendAddress" component={SendAddressScreen} />
              <Stack.Screen name="SendAsset" component={SendAssetScreen} />
              <Stack.Screen name="SendAmount" component={SendAmountScreen} />
              <Stack.Screen name="SendConfirm" component={SendConfirmScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Start" component={StartScreen} />
              <Stack.Screen
                name="SignUpPasscode"
                component={SignUpPasscodeScreen}
              />
              <Stack.Screen
                name="SignUpGuardians"
                component={SignUpGuardiansScreen}
              />
              <Stack.Screen
                name="SignUpBackUp"
                component={SignUpBackUpScreen}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
};

export default App;
