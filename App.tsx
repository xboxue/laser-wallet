import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { NativeBaseProvider } from "native-base";
import SignUpBackUpScreen from "./src/screens/SignUpBackUpScreen";
import SignUpGuardiansScreen from "./src/screens/SignUpGuardiansScreen";
import SignUpPasscodeScreen from "./src/screens/SignUpPasscodeScreen";
import StartScreen from "./src/screens/StartScreen";

const Stack = createStackNavigator();

const App = () => {
  return (
    <NativeBaseProvider>
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
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
};

export default App;
