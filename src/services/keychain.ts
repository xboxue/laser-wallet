import { Platform } from "react-native";
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
    Sentry.Native.addBreadcrumb({
      message: `Keychain: saved string for key: ${key}`,
      level: Sentry.Native.Severity.Info,
    });
  } catch (error) {
    Sentry.Native.captureMessage("Keychain write first attempt failed");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      await setInternetCredentials(key, key, value, options);
      Sentry.Native.addBreadcrumb({
        message: `Keychain: saved string for key on second attempt: ${key}`,
        level: Sentry.Native.Severity.Info,
      });
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
  // https://github.com/oblador/react-native-keychain/issues/525
  if (Platform.OS === "android") {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  try {
    const credentials = await getInternetCredentials(key, options);
    if (credentials) {
      Sentry.Native.addBreadcrumb({
        message: `Keychain: loaded string for key: ${key}`,
        level: Sentry.Native.Severity.Info,
      });
      return credentials.password;
    }
    Sentry.Native.addBreadcrumb({
      message: `Keychain: string does not exist for key: ${key}`,
      level: Sentry.Native.Severity.Info,
    });
  } catch (error) {
    if (
      error.message ===
      "The user name or passphrase you entered is not correct."
    ) {
      Sentry.Native.captureMessage("Keychain read first attempt failed");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const credentials = await getInternetCredentials(key, options);
        if (credentials) {
          Sentry.Native.addBreadcrumb({
            message: `Keychain: loaded string for key on second attempt: ${key}`,
            level: Sentry.Native.Severity.Info,
          });
          return credentials.password;
        }
        Sentry.Native.addBreadcrumb({
          message: `Keychain: string does not exist for key: ${key}`,
          level: Sentry.Native.Severity.Info,
        });
      } catch (error) {
        Sentry.Native.captureMessage("Keychain read second attempt failed");
        Sentry.Native.captureException(error);
        throw error;
      }
    }
    throw error;
  }
  return null;
};
