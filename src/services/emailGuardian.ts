import axios from "axios";
import Constants from "expo-constants";

export const signTransaction = async (hash: string, token: string) => {
  const { data } = await axios.post<string>(
    `${Constants.expoConfig.extra.vaultApi}/sign-tx`,
    { hash },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};
