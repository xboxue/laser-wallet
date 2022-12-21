import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import * as LocalAuthentication from "expo-local-authentication";
import { Box, Button, Text } from "native-base";
import { Platform } from "react-native";
import { useDispatch } from "react-redux";
import { setIsBiometricsEnabled } from "../features/auth/authSlice";
import SignUpLayout from "../components/SignUpLayout/SignUpLayout";
import { isDevice } from "expo-device";

const SignUpAuthScreen = ({ route }) => {
  const { nextScreen = "SignUpEmail" } = route.params || {};
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { mutate: authenticate, isLoading: isAuthenticating } = useMutation(
    async () => {
      if (!isDevice) return true;
      const { success } = await LocalAuthentication.authenticateAsync({
        cancelLabel: "Cancel",
        disableDeviceFallback: true,
      });
      return success;
    },
    {
      onSuccess: (success) => {
        if (success) {
          dispatch(setIsBiometricsEnabled(true));
          navigation.navigate(nextScreen);
        }
      },
    }
  );

  return (
    <SignUpLayout
      title="Enable Face ID"
      subtitle="Add an extra layer of security to prevent someone with your phone from accessing your wallet."
      nextText={Platform.OS === "ios" ? "Use Face ID" : "Use fingerprint"}
      onNext={authenticate}
      isLoading={isAuthenticating}
    />
  );
};

export default SignUpAuthScreen;
