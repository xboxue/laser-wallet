import axios from "axios";
import { getAddress } from "ethers/lib/utils";
import Constants from "expo-constants";
import { sortBy } from "lodash";
import { SendTxOpts } from "safe-sdk-wrapper/dist/Safe";

import SafeServiceClient, {
  TransferListResponse,
  TransferWithTokenInfoResponse,
} from "@gnosis.pm/safe-service-client";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import { ethers, providers } from "ethers";

// const provider = new providers.InfuraProvider(
//   // chainId,
//   "goerli",
//   Constants.manifest.extra.infuraApiKey
// );

// const ethAdapter = new EthersAdapter({
//   ethers,
//   signer: new ethers.Wallet(
//     "0x0f4eb853643472a57e6be53f6e93743fd41faa96910ff62ffd18ff52efe76dc6",
//     provider
//   ),
// });

// const safeService = new SafeServiceClient({
//   txServiceUrl: "https://safe-transaction-goerli.safe.global",
//   ethAdapter,
// });

const getTransactionServiceUrl = (chainId: number) => {
  if (chainId === 1) return "https://safe-transaction-mainnet.safe.global";
  else if (chainId === 5) return "https://safe-transaction-goerli.safe.global";
  else throw new Error("Chain not supported");
};

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

export const getTransfers = async (
  safe: string,
  chainId: number,
  limit: number,
  offset: number
) => {
  const { data } = await axios.get<
    Omit<TransferListResponse, "results"> & {
      results: TransferWithTokenInfoResponse[];
    }
  >(
    `${getTransactionServiceUrl(chainId)}/api/v1/safes/${getAddress(
      safe
    )}/transfers/`,
    { params: { limit, offset } }
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
