import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import "react-native-get-random-values";
import HomeScreen from "../screens/HomeScreen";
import QRCodeScanScreen from "../screens/QRCodeScanScreen";
import SendAddressScreen from "../screens/SendAddressScreen";
import SendAmountScreen from "../screens/SendAmountScreen";
import SendAssetScreen from "../screens/SendAssetScreen";
import SendConfirmScreen from "../screens/SendConfirmScreen";
import SignUpAddGuardianScreen from "../screens/SignUpAddGuardianScreen";
import SignUpBackupScreen from "../screens/SignUpBackupScreen";
import SignUpGuardiansScreen from "../screens/SignUpGuardiansScreen";
import SignUpPasscodeScreen from "../screens/SignUpPasscodeScreen";
import StartScreen from "../screens/StartScreen";
import { useSelector } from "react-redux";
import { selectOwnerAddress } from "../features/auth/authSlice";
import SignUpBackupPasswordScreen from "../screens/SignUpBackupPasswordScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SettingsNetworkScreen from "../screens/SettingsNetworkScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const ownerAddress = useSelector(selectOwnerAddress);

  return (
    <Stack.Navigator
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS,
        headerTitle: "",
      }}
    >
      {ownerAddress ? (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="SendAddress" component={SendAddressScreen} />
          <Stack.Screen name="SendAsset" component={SendAssetScreen} />
          <Stack.Screen name="SendAmount" component={SendAmountScreen} />
          <Stack.Screen name="SendConfirm" component={SendConfirmScreen} />
          <Stack.Screen name="QRCodeScan" component={QRCodeScanScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen
            name="SettingsNetwork"
            component={SettingsNetworkScreen}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Start"
            component={StartScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUpPasscode"
            component={SignUpPasscodeScreen}
          />
          <Stack.Screen
            name="SignUpGuardians"
            component={SignUpGuardiansScreen}
          />
          <Stack.Screen
            name="SignUpAddGuardian"
            component={SignUpAddGuardianScreen}
          />
          <Stack.Screen name="SignUpBackup" component={SignUpBackupScreen} />
          <Stack.Screen
            name="SignUpBackupPassword"
            component={SignUpBackupPasswordScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
