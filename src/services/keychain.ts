import {
  setInternetCredentials,
  Options,
  getInternetCredentials,
  AuthenticationPrompt,
} from "react-native-keychain";

export const setItem = (key: string, value: string, options?: Options) => {
  return setInternetCredentials(key, key, value, options);
};

export const getItem = async (
  key: string,
  authenticationPrompt?: AuthenticationPrompt
) => {
  const credentials = await getInternetCredentials(key, {
    authenticationPrompt: {
      title: "Laser",
      subtitle: "Unlock your wallet using your fingerprint",
      ...authenticationPrompt,
    },
  });
  if (!credentials) return null;
  return credentials.password;
};
