import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { ChevronLeftIcon } from "native-base";
import { Platform } from "react-native";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../features/auth/authSlice";
import { selectWalletAddress } from "../features/wallet/walletSlice";
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
import SignUpDeployWalletScreen from "../screens/SignUpDeployWalletScreen";
import SignUpEmailScreen from "../screens/SignUpEmailScreen";
import SignUpGuardianDetailsScreen from "../screens/SignUpGuardianDetailsScreen";
import SignUpGuardiansScreen from "../screens/SignUpGuardiansScreen";
import SignUpLaserGuardianDetailsScreen from "../screens/SignUpLaserGuardianDetailsScreen";
import SignUpPasscodeScreen from "../screens/SignUpPasscodeScreen";
import SignUpVerifyEmailScreen from "../screens/SignUpVerifyEmail";
import SignUpVerifySeedPhrase from "../screens/SignUpVerifySeedPhrase";
import StartScreen from "../screens/StartScreen";
import TransactionDetailsScreen from "../screens/TransactionDetailsScreen";
import VaultBackupPasswordScreen from "../screens/VaultBackupPasswordScreen";
import VaultBackupScreen from "../screens/VaultBackupScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const walletAddress = useSelector(selectWalletAddress);
  const authenticated = useSelector(selectIsAuthenticated);

  const renderScreens = () => {
    if (!walletAddress)
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
          <Stack.Screen name="SignUpBackup" component={SignUpBackupScreen} />
          <Stack.Screen
            name="SignUpVerifySeedPhrase"
            component={SignUpVerifySeedPhrase}
          />
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
          <Stack.Screen
            name="SignUpDeployWallet"
            component={SignUpDeployWalletScreen}
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
          <Stack.Screen
            name="TransactionDetails"
            component={TransactionDetailsScreen}
          />
          <Stack.Screen name="SignUpEmail" component={SignUpEmailScreen} />
          <Stack.Screen
            name="SignUpVerifyEmail"
            component={SignUpVerifyEmailScreen}
          />
          <Stack.Screen
            name="SignUpGuardians"
            component={SignUpGuardiansScreen}
          />
          <Stack.Screen
            name="SignUpGuardianDetails"
            component={SignUpGuardianDetailsScreen}
          />
          <Stack.Screen
            name="SignUpLaserGuardianDetails"
            component={SignUpLaserGuardianDetailsScreen}
          />
          <Stack.Screen
            name="SignUpAddGuardian"
            component={SignUpAddGuardianScreen}
          />
          <Stack.Screen name="VaultBackup" component={VaultBackupScreen} />
          <Stack.Screen
            name="VaultBackupPassword"
            component={VaultBackupPasswordScreen}
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
        ...(Platform.OS === "ios" && {
          headerBackTitleVisible: false,
          headerBackImage: () => (
            <ChevronLeftIcon size="5" color="black" ml="4" />
          ),
        }),
      }}
    >
      {renderScreens()}
    </Stack.Navigator>
  );
};

export default AppNavigator;
