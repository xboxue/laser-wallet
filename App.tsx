import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NativeBaseProvider } from "native-base";
import SignUpBackUpScreen from "./src/screens/SignUpBackUpScreen";
import SignUpGuardiansScreen from "./src/screens/SignUpGuardiansScreen";
import SignUpPasscodeScreen from "./src/screens/SignUpPasscodeScreen";
import StartScreen from "./src/screens/StartScreen";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NativeBaseProvider>
      <NavigationContainer>
        <Stack.Navigator>
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
