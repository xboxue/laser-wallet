import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import * as LocalAuthentication from "expo-local-authentication";
import { Box, Button, Text } from "native-base";
import { Platform } from "react-native";
import { useDispatch } from "react-redux";
import { setIsBiometricsEnabled } from "../features/auth/authSlice";

const SignUpAuthScreen = ({ route }) => {
  const { nextScreen = "SignUpBackup" } = route.params || {};
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { mutate: authenticate, isLoading: isAuthenticating } = useMutation(
    async () => {
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
    <Box p="4">
      <Text variant="subtitle1">Protect your wallet</Text>
      <Text mb="4">
        Add an extra layer of security to prevent someone with your phone from
        accessing your wallet.
      </Text>
      <Button
        mt="4"
        onPress={async () => authenticate()}
        isLoading={isAuthenticating}
      >
        {Platform.OS === "ios" ? "Use Face ID" : "Use fingerprint"}
      </Button>
      {/* <Button
        mt="2"
        variant="subtle"
        onPress={() => navigation.navigate("SignUpPasscode")}
      >
        Create passcode
      </Button> */}
    </Box>
  );
};

export default SignUpAuthScreen;
