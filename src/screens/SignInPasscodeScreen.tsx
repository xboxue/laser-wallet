import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as LocalAuthentication from "expo-local-authentication";
import { Box, Button, Icon, Text } from "native-base";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import FaceIdIcon from "../../assets/face-id.svg";
import PasscodeNumberPad from "../components/PasscodeNumberPad/PasscodeNumberPad";
import { PASSCODE_LENGTH } from "../constants/auth";
import {
  selectIsBiometricsEnabled,
  selectPasscode,
  setIsAuthenticated,
} from "../features/auth/authSlice";
import theme from "../styles/theme";

const SignInPasscodeScreen = () => {
  const passcode = useSelector(selectPasscode);
  const isBiometricsEnabled = useSelector(selectIsBiometricsEnabled);
  const [passcodeAttempt, setPasscodeAttempt] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const { data: biometricTypes, isLoading } = useQuery(
    "biometricTypes",
    () => LocalAuthentication.supportedAuthenticationTypesAsync(),
    { enabled: isBiometricsEnabled }
  );

  const authenticate = async () => {
    const { success } = await LocalAuthentication.authenticateAsync({
      cancelLabel: "Cancel",
      disableDeviceFallback: true,
    });
    if (success) dispatch(setIsAuthenticated(true));
  };

  useEffect(() => {
    if (biometricTypes?.length) authenticate();
  }, [biometricTypes]);

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

  const renderToolbar = () => {
    if (!biometricTypes) return;
    const [type] = biometricTypes;

    if (type === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
      return (
        <Button
          variant="ghost"
          leftIcon={
            <FaceIdIcon
              width={20}
              height={20}
              fill={theme.colors.primary[600]}
              style={{ marginRight: 4 }}
            />
          }
          onPress={authenticate}
          mb="3"
          alignSelf="center"
        >
          Use face recognition
        </Button>
      );

    if (type === LocalAuthentication.AuthenticationType.FINGERPRINT)
      return (
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
      );
  };

  return (
    <>
      <Box p="4">
        <Text variant="subtitle1">Enter your passcode</Text>
      </Box>
      <PasscodeNumberPad
        passcode={passcodeAttempt}
        onChange={setPasscodeAttempt}
        helperText={error}
        toolbar={renderToolbar()}
      />
    </>
  );
};

export default SignInPasscodeScreen;
