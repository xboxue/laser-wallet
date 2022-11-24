import axios from "axios";
import Constants from "expo-constants";

interface SignTransactionOptions {
  hash: string;
  chainId: number;
  token: string;
}

export const signTransaction = async ({
  hash,
  chainId,
  token,
}: SignTransactionOptions) => {
  const { data } = await axios.post<string>(
    `${Constants.expoConfig.extra.vaultApi}/sign-tx`,
    { hash, chainId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};
