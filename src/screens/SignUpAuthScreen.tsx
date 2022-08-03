import { useNavigation } from "@react-navigation/native";
import * as LocalAuthentication from "expo-local-authentication";
import { Box, Button, Text } from "native-base";
import { useDispatch } from "react-redux";
import { setIsBiometricsEnabled } from "../features/auth/authSlice";
import useBiometricTypes from "../hooks/useBiometricTypes";

const SignUpAuthScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { data: biometricTypes } = useBiometricTypes();

  return (
    <Box p="4">
      <Text variant="subtitle1">Protect your wallet</Text>
      <Text mb="4">
        Add an extra layer of security to prevent someone with your phone from
        accessing your wallet.
      </Text>
      {biometricTypes &&
        [
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
          LocalAuthentication.AuthenticationType.FINGERPRINT,
        ].includes(biometricTypes[0]) && (
          <Button
            mt="4"
            onPress={async () => {
              const { success } = await LocalAuthentication.authenticateAsync({
                cancelLabel: "Cancel",
                disableDeviceFallback: true,
              });
              if (success) {
                dispatch(setIsBiometricsEnabled(true));
                navigation.navigate("SignUpEmail");
              }
            }}
          >
            {biometricTypes[0] ===
              LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION &&
              "Use Face ID"}
            {biometricTypes[0] ===
              LocalAuthentication.AuthenticationType.FINGERPRINT &&
              "Use fingerprint"}
          </Button>
        )}
      <Button
        mt="2"
        variant="subtle"
        onPress={() => navigation.navigate("SignUpPasscode")}
      >
        Create passcode
      </Button>
    </Box>
  );
};

export default SignUpAuthScreen;
