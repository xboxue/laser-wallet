import {
  setInternetCredentials,
  Options,
  getInternetCredentials,
  AuthenticationPrompt,
} from "react-native-keychain";
import * as Sentry from "sentry-expo";

export const setItem = async (
  key: string,
  value: string,
  options?: Options
) => {
  try {
    await setInternetCredentials(key, key, value, options);
  } catch (error) {
    Sentry.Native.captureMessage("Keychain write first attempt failed");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      await setInternetCredentials(key, key, value, options);
    } catch (error) {
      Sentry.Native.captureMessage("Keychain write second attempt failed");
      Sentry.Native.captureException(error);
      throw error;
    }
  }
};

export const getItem = async (
  key: string,
  authenticationPrompt?: AuthenticationPrompt
) => {
  const options = {
    authenticationPrompt: {
      title: "Laser",
      subtitle: "Unlock your wallet using your fingerprint",
      ...authenticationPrompt,
    },
  };

  try {
    const credentials = await getInternetCredentials(key, options);
    if (!credentials) return null;
    return credentials.password;
  } catch (error) {
    if (
      error.message ===
      "The user name or passphrase you entered is not correct."
    ) {
      Sentry.Native.captureMessage("Keychain read first attempt failed");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const credentials = await getInternetCredentials(key, options);
        if (!credentials) return null;
        return credentials.password;
      } catch (error) {
        Sentry.Native.captureMessage("Keychain read second attempt failed");
        Sentry.Native.captureException(error);
        throw error;
      }
    }
    throw error;
  }
};
