import axios from "axios";
import { getAddress } from "ethers/lib/utils";
import Constants from "expo-constants";
import { sortBy } from "lodash";
import { SendTxOpts } from "safe-sdk-wrapper/dist/Safe";

type CreateMultisigTxArgs = {
  safe: string;
  to: string;
  value: string;
  data: string;
  operation: 0;
  signature: string;
  safeTxGas: string;
  refundReceiver: string;
  gasPrice: string;
  nonce: string;
  gasToken?: string;
  contractTransactionHash: string;
  sender: string;
};

export type Transaction = {
  blockNumber: string | null;
  blockTimestamp: string | null;
  created: string;
  data: string;
  from: string;
  gas: string;
  gasPrice: string;
  gasUsed: string | null;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  modified: string;
  nonce: string;
  status: string | null;
  to: string;
  transactionIndex: string | null;
  txHash: string;
  value: string;
};

type SendTransactionResponse = {
  to: string;
  ethereumTx: Transaction;
  value: string;
  data: string;
  timestamp: string;
  operation: 0;
  safeTxGas: string;
  dataGas: string;
  gasPrice: string;
  nonce: string;
  gasToken: string;
  refundReceiver: string;
  safeTxHash: string;
};

export const createSafe = async (
  owners: string[],
  saltNonce: string,
  threshold: number,
  gasLimit: number,
  chainId: number
) => {
  const { data } = await axios.post<{ relayTransactionHash: string }>(
    `${Constants.expoConfig.extra.relayerApi}/wallets/`,
    {
      owners,
      saltNonce,
      threshold,
      gasLimit,
      chainId,
    }
  );
  return data;
};

export const getMultsigTxSignatures = async (hash: string) => {
  const { data } = await axios.get<{
    results: { owner: string; signature: string }[];
  }>(
    `${Constants.expoConfig.extra.safeTransactionApi}/api/v1/multisig-transactions/${hash}/confirmations`
  );
  return (
    "0x" +
    sortBy(data.results, (result) => result.owner.toLowerCase())
      .map(({ signature }) => signature.replace("0x", ""))
      .join("")
  );
};

export const confirmMultisigTx = async (hash: string, signature: string) => {
  const { data } = await axios.post(
    `${Constants.expoConfig.extra.safeTransactionApi}/api/v1/multisig-transactions/${hash}/confirmations`,
    { signature }
  );
  return data;
};

export const createMultisigTx = async (options: CreateMultisigTxArgs) => {
  const { data } = await axios.post<SendTransactionResponse>(
    `${Constants.expoConfig.extra.safeTransactionApi}/api/v1/safes/${getAddress(
      options.safe
    )}/multisig-transactions/`,
    options
  );
  return data;
};

type EstimateGasArgs = {
  safe: string;
  to: string;
  value: string;
  operation: 0;
  data: string;
  gasToken?: string;
};

type EstimateGasResponse = {
  safeTxGas: number;
};

export const estimateGas = async (options: EstimateGasArgs) => {
  const { data } = await axios.post<EstimateGasResponse>(
    `${Constants.expoConfig.extra.safeTransactionApi}/api/v1/safes/${getAddress(
      options.safe
    )}/multisig-transactions/estimations/`,
    options
  );
  return data;
};

export const sendTransaction = async (
  options: SendTxOpts & { sender: string; chainId: number }
) => {
  const { chainId, sender, ...tx } = options;
  const { data } = await axios.post<{ relayTransactionHash: string }>(
    `${Constants.expoConfig.extra.relayerApi}/transactions/`,
    { transaction: tx, chainId, sender }
  );
  return data;
};

export const getTransfers = async (safe: string) => {
  const { data } = await axios.get(
    `${Constants.expoConfig.extra.safeTransactionApi}/api/v1/safes/${getAddress(
      safe
    )}/transfers/`
  );
  return data;
};

export const getBalances = async (safe: string) => {
  const { data } = await axios.get(
    `${Constants.expoConfig.extra.safeTransactionApi}/api/v1/safes/${getAddress(
      safe
    )}/balances/usd/`
  );
  return data;
};
