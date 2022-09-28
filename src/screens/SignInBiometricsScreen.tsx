import { useMutation } from "@tanstack/react-query";
import * as LocalAuthentication from "expo-local-authentication";
import { Box, Image } from "native-base";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import splash from "../../assets/splash.png";
import { setIsAuthenticated } from "../features/auth/authSlice";

const SignInBiometricsScreen = () => {
  const dispatch = useDispatch();

  const { mutate: authenticate } = useMutation(
    async () => {
      const { success } = await LocalAuthentication.authenticateAsync({
        cancelLabel: "Cancel",
        disableDeviceFallback: true,
      });
      return success;
    },
    {
      onSuccess: (success) => {
        if (success) dispatch(setIsAuthenticated(true));
      },
    }
  );

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  return (
    <Box flex={1} bgColor="#111827">
      <Image alt="Laser logo" source={splash} flex={1} resizeMode="contain" />
    </Box>
  );
};

export default SignInBiometricsScreen;
