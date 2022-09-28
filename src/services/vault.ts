import axios from "axios";
import Constants from "expo-constants";
import { OffChainTransaction } from "laser-sdk/dist/types";

export const signTransaction = async (
  transaction: OffChainTransaction,
  token: string
) => {
  const { data } = await axios.post<string>(
    `${Constants.expoConfig.extra.vaultApi}/sign-tx`,
    { transaction },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};
