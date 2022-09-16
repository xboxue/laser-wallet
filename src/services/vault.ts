import axios from "axios";
import Constants from "expo-constants";

export const signHash = async (hash: string) => {
  const { data } = await axios.post<string>(
    `${Constants.expoConfig.extra.relayerUrl}/sign-hash`,
    { hash }
  );
  return data;
};
