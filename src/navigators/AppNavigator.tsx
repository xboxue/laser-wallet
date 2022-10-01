import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ChevronLeftIcon } from "native-base";
import { Platform } from "react-native";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../features/auth/authSlice";
import { selectWallets } from "../features/wallet/walletSlice";
import QRCodeScanScreen from "../screens/QRCodeScanScreen";
import RecoveryAccountVaultsScreen from "../screens/RecoveryAccountVaultsScreen";
import RecoveryBackupPasswordScreen from "../screens/RecoveryBackupPasswordScreen";
import RecoveryEnterSeedPhraseScreen from "../screens/RecoveryEnterSeedPhraseScreen";
import RecoveryImportSeedPhraseScreen from "../screens/RecoveryImportSeedPhraseScreen";
import RecoveryImportVaultScreen from "../screens/RecoveryImportVaultScreen";
import RecoveryLockVaultScreen from "../screens/RecoveryLockVaultScreen";
import RecoverySeedPhrasePasswordScreen from "../screens/RecoverySeedPhrasePasswordScreen";
import RecoverySignInScreen from "../screens/RecoverySignInScreen";
import RecoveryVerifyEmailScreen from "../screens/RecoveryVerifyEmailScreen";
import SendAddressScreen from "../screens/SendAddressScreen";
import SendAmountScreen from "../screens/SendAmountScreen";
import SendAssetScreen from "../screens/SendAssetScreen";
import SendConfirmScreen from "../screens/SendConfirmScreen";
import SettingsBackupPasswordScreen from "../screens/SettingsBackupPasswordScreen";
import SettingsNetworkScreen from "../screens/SettingsNetworkScreen";
import SettingsPasscodeScreen from "../screens/SettingsPasscodeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SettingsSecurityScreen from "../screens/SettingsSecurityScreen";
import SettingsVaultScreen from "../screens/SettingsVaultScreen";
import SettingsWalletRecoveryScreen from "../screens/SettingsWalletRecoveryScreen";
import SignInBiometricsScreen from "../screens/SignInBiometricsScreen";
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
import StartScreen from "../screens/StartScreen";
import TransactionDetailsScreen from "../screens/TransactionDetailsScreen";
import VaultVerifyEmail from "../screens/VaultVerifyEmail";
import TabNavigator from "./TabNavigator";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const wallets = useSelector(selectWallets);
  const authenticated = useSelector(selectIsAuthenticated);

  const renderScreens = () => {
    if (!wallets.length)
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
            name="SignUpBackupPassword"
            component={SignUpBackupPasswordScreen}
          />
          <Stack.Screen
            name="RecoveryImportSeedPhrase"
            component={RecoveryImportSeedPhraseScreen}
          />
          <Stack.Screen
            name="RecoverySeedPhrasePassword"
            component={RecoverySeedPhrasePasswordScreen}
          />
          <Stack.Screen
            name="RecoveryEnterSeedPhrase"
            component={RecoveryEnterSeedPhraseScreen}
          />
        </>
      );

    if (authenticated)
      return (
        <>
          <Stack.Screen
            name="Home"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUpDeployWallet"
            component={SignUpDeployWalletScreen}
          />
          <Stack.Screen name="SendAddress" component={SendAddressScreen} />
          <Stack.Screen name="SendAsset" component={SendAssetScreen} />
          <Stack.Screen name="SendAmount" component={SendAmountScreen} />
          <Stack.Screen name="SendConfirm" component={SendConfirmScreen} />
          <Stack.Screen
            name="QRCodeScan"
            component={QRCodeScanScreen}
            options={{
              headerTransparent: true,
              headerStyle: { backgroundColor: "transparent" },
            }}
          />
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
          <Stack.Screen name="SettingsVault" component={SettingsVaultScreen} />
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
          <Stack.Screen name="VaultVerifyEmail" component={VaultVerifyEmail} />
          <Stack.Screen
            name="RecoveryImportVault"
            component={RecoveryImportVaultScreen}
          />
          <Stack.Screen
            name="RecoverySignIn"
            component={RecoverySignInScreen}
          />
          <Stack.Screen
            name="RecoveryVerifyEmail"
            component={RecoveryVerifyEmailScreen}
          />
          <Stack.Screen
            name="RecoveryAccountVaults"
            component={RecoveryAccountVaultsScreen}
          />
          <Stack.Screen
            name="RecoveryBackupPassword"
            component={RecoveryBackupPasswordScreen}
          />
          <Stack.Screen
            name="RecoveryLockVault"
            component={RecoveryLockVaultScreen}
          />
        </>
      );

    return (
      <Stack.Screen
        name="SignInBiometrics"
        component={SignInBiometricsScreen}
        options={{ headerShown: false }}
      />
    );
  };

  return (
    <Stack.Navigator
      screenOptions={{
        ...(Platform.OS === "ios" && {
          headerBackImageSource: () => (
            <ChevronLeftIcon size="5" color="black" ml="4" />
          ),
        }),
        headerBackTitleVisible: false,
        headerTitle: "",
        headerStyle: { backgroundColor: "white" },
        headerShadowVisible: false,
      }}
    >
      {renderScreens()}
    </Stack.Navigator>
  );
};

export default AppNavigator;
