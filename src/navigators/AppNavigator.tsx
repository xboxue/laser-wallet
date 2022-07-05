import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { useSelector } from "react-redux";
import { selectOwnerAddress } from "../features/auth/authSlice";
import { selectChainId } from "../features/network/networkSlice";
import HomeScreen from "../screens/HomeScreen";
import QRCodeScanScreen from "../screens/QRCodeScanScreen";
import SendAddressScreen from "../screens/SendAddressScreen";
import SendAmountScreen from "../screens/SendAmountScreen";
import SendAssetScreen from "../screens/SendAssetScreen";
import SendConfirmScreen from "../screens/SendConfirmScreen";
import SettingsNetworkScreen from "../screens/SettingsNetworkScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SignUpAddGuardianScreen from "../screens/SignUpAddGuardianScreen";
import SignUpBackupPasswordScreen from "../screens/SignUpBackupPasswordScreen";
import SignUpBackupScreen from "../screens/SignUpBackupScreen";
import SignUpGuardiansScreen from "../screens/SignUpGuardiansScreen";
import SignUpPasscodeScreen from "../screens/SignUpPasscodeScreen";
import StartScreen from "../screens/StartScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const ownerAddress = useSelector(selectOwnerAddress);
  const chainId = useSelector(selectChainId);

  return (
    <Stack.Navigator
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS,
        headerTitle: "",
      }}
      // Fix stale data in wagmi by rerendering app when chain changes
      key={chainId}
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
