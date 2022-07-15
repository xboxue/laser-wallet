import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as LocalAuthentication from "expo-local-authentication";
import { Box, Button, Icon, Text } from "native-base";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PasscodeNumberPad from "../components/PasscodeNumberPad/PasscodeNumberPad";
import { PASSCODE_LENGTH } from "../constants/auth";
import {
  selectIsBiometricsEnabled,
  selectPasscode,
  setIsAuthenticated,
} from "../features/auth/authSlice";

const SignInPasscodeScreen = () => {
  const passcode = useSelector(selectPasscode);
  const isBiometricsEnabled = useSelector(selectIsBiometricsEnabled);
  const [passcodeAttempt, setPasscodeAttempt] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const authenticate = async () => {
    const { success } = await LocalAuthentication.authenticateAsync({
      cancelLabel: "Cancel",
      disableDeviceFallback: true,
    });
    if (success) dispatch(setIsAuthenticated(true));
  };

  useEffect(() => {
    if (isBiometricsEnabled) authenticate();
  }, []);

  useEffect(() => {
    if (passcodeAttempt.length > 0 && error) setError("");
    if (passcodeAttempt.length !== PASSCODE_LENGTH) return;

    if (passcodeAttempt === passcode) {
      setPasscodeAttempt("");
      dispatch(setIsAuthenticated(true));
      return;
    } else {
      setPasscodeAttempt("");
      setError("Incorrect");
    }
  }, [passcodeAttempt]);

  return (
    <>
      <Box p="4">
        <Text variant="subtitle1">Enter your passcode</Text>
      </Box>
      <PasscodeNumberPad
        passcode={passcodeAttempt}
        onChange={setPasscodeAttempt}
        helperText={error}
        toolbar={
          isBiometricsEnabled ? (
            <Button
              variant="ghost"
              leftIcon={
                <Icon size="lg" as={<MaterialIcons name="fingerprint" />} />
              }
              onPress={authenticate}
              mb="3"
              alignSelf="center"
            >
              Use fingerprint
            </Button>
          ) : undefined
        }
      />
    </>
  );
};

export default SignInPasscodeScreen;
