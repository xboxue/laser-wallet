import { useQuery } from "react-query";
import * as LocalAuthentication from "expo-local-authentication";

const useBiometricTypes = (enabled = true) => {
  return useQuery(
    "biometricTypes",
    () => LocalAuthentication.supportedAuthenticationTypesAsync(),
    { enabled }
  );
};

export default useBiometricTypes;
