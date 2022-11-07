import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import * as LocalAuthentication from "expo-local-authentication";
import { Box, Button, Text } from "native-base";
import { Platform } from "react-native";
import { useDispatch } from "react-redux";
import { setIsBiometricsEnabled } from "../features/auth/authSlice";
import * as Device from "expo-device";

const SignUpAuthScreen = ({ route }) => {
  const { nextScreen = "SignUpEmail" } = route.params || {};
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { mutate: authenticate, isLoading: isAuthenticating } = useMutation(
    async () => {
      if (!Device.isDevice) return true;
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
    <Box p="4" flexDir="column" height="100%" pb="5">
      <Text variant="h4" mb={1}>
        Enable Face ID
      </Text>
      <Text fontSize="lg" flex={1}>
        Add an extra layer of security to prevent someone with your phone from
        accessing your wallet.
      </Text>
      <Button
        size="lg"
        _text={{ fontSize: "xl" }}
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
