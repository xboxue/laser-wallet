import axios from "axios";
import Constants from "expo-constants";

type CreateSafeOptions = {
  owners: string[];
  threshold: number;
  payment: string;
  saltNonce: string;
  chainId: number;
  safeAddress: string;
};

export const createSafe = async (options: CreateSafeOptions) => {
  const { data } = await axios.post<{ relayTransactionHash: string }>(
    `${Constants.expoConfig.extra.relayerApi}/safe/`,
    options
  );
  return data;
};
