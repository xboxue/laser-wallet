import axios from "axios";
import Constants from "expo-constants";

export const signHash = async (hash: string, token: string) => {
  const { data } = await axios.post<string>(
    `${Constants.expoConfig.extra.vaultApi}/sign-hash`,
    { hash },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};
