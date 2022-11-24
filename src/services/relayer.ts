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

type SendTxOptions = {
  safeTxHash: string;
  chainId: number;
};

export const createSafe = async (options: CreateSafeOptions) => {
  const { data } = await axios.post<{ relayTransactionHash: string }>(
    `${Constants.expoConfig.extra.relayerApi}/safe/`,
    options
  );
  return data;
};

export const sendTransaction = async (options: SendTxOptions) => {
  const { data } = await axios.post<{ relayTransactionHash: string }>(
    `${Constants.expoConfig.extra.relayerApi}/transaction/`,
    options
  );
  return data;
};
