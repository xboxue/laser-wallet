import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../features/auth/authSlice";
import { selectChainId } from "../features/network/networkSlice";
import { selectOwnerAddress } from "../features/wallet/walletSlice";
import HomeScreen from "../screens/HomeScreen";
import QRCodeScanScreen from "../screens/QRCodeScanScreen";
import SendAddressScreen from "../screens/SendAddressScreen";
import SendAmountScreen from "../screens/SendAmountScreen";
import SendAssetScreen from "../screens/SendAssetScreen";
import SendConfirmScreen from "../screens/SendConfirmScreen";
import SettingsBackupPasswordScreen from "../screens/SettingsBackupPasswordScreen";
import SettingsNetworkScreen from "../screens/SettingsNetworkScreen";
import SettingsPasscodeScreen from "../screens/SettingsPasscodeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SettingsSecurityScreen from "../screens/SettingsSecurityScreen";
import SettingsWalletRecoveryScreen from "../screens/SettingsWalletRecoveryScreen";
import SignInPasscodeScreen from "../screens/SignInPasscodeScreen";
import SignUpAddGuardianScreen from "../screens/SignUpAddGuardianScreen";
import SignUpAuthScreen from "../screens/SignUpAuthScreen";
import SignUpBackupPasswordScreen from "../screens/SignUpBackupPasswordScreen";
import SignUpBackupScreen from "../screens/SignUpBackupScreen";
import SignUpGuardiansScreen from "../screens/SignUpGuardiansScreen";
import SignUpPasscodeScreen from "../screens/SignUpPasscodeScreen";
import StartScreen from "../screens/StartScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const ownerAddress = useSelector(selectOwnerAddress);
  const chainId = useSelector(selectChainId);
  const authenticated = useSelector(selectIsAuthenticated);

  const renderScreens = () => {
    if (!ownerAddress)
      return (
        <>
          <Stack.Screen
            name="Start"
            component={StartScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="SignUpAuth" component={SignUpAuthScreen} />
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
      );

    if (authenticated)
      return (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            initialParams={{ tab: 0 }}
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
          <Stack.Screen
            name="SettingsSecurity"
            component={SettingsSecurityScreen}
          />
          <Stack.Screen
            name="SettingsPasscode"
            component={SettingsPasscodeScreen}
          />
          <Stack.Screen
            name="SettingsWalletRecovery"
            component={SettingsWalletRecoveryScreen}
          />
          <Stack.Screen
            name="SettingsBackupPassword"
            component={SettingsBackupPasswordScreen}
          />
        </>
      );

    return (
      <Stack.Screen name="SignInPasscode" component={SignInPasscodeScreen} />
    );
  };

  return (
    <Stack.Navigator
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS,
        headerTitle: "",
      }}
      // Fix stale data in wagmi by rerendering app when chain changes
      key={chainId}
    >
      {renderScreens()}
    </Stack.Navigator>
  );
};

export default AppNavigator;
