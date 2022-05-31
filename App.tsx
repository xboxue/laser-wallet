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
import HomeScreen from "./src/screens/HomeScreen";
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

  return (
    <NativeBaseProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ ...TransitionPresets.SlideFromRightIOS }}
        >
          <Stack.Screen name="Start" component={StartScreen} />
          <Stack.Screen
            name="SignUpPasscode"
            component={SignUpPasscodeScreen}
          />
          <Stack.Screen
            name="SignUpGuardians"
            component={SignUpGuardiansScreen}
          />
          <Stack.Screen name="SignUpBackUp" component={SignUpBackUpScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
};

export default App;
