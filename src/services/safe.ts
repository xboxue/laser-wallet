import axios from "axios";
import Constants from "expo-constants";

type GetSafeCreationDataArgs = {
  deployer: string;
  funder: string;
  gasEstimated: string; // it’s what the service gets as refund
  gasPriceEstimated: string; // it’s what the service gets as refund
  masterCopy: string;
  payment: string; // it’s what the service gets as refund
  paymentReceiver: string; // if NULL_ADDRESS (0x00...000) receiver would be the address sending the transaction
  paymentToken: string; // if no gasToken was specified in the request this will be address(0) for ETH
  proxyFactory: string;
  safe: string;
  setupData: string;
};

export const getSafeCreationData = async (
  owners: string[],
  salt: string,
  threshold: number
) => {
  const { data } = await axios.post<GetSafeCreationDataArgs>(
    `${Constants.expoConfig.extra.safeRelayApi}/api/v3/safes/`,
    {
      owners,
      saltNonce: salt,
      threshold,
    }
  );
  return data;
};

export const createSafe = async (address: string) => {
  await axios.put(
    `${Constants.expoConfig.extra.safeRelayApi}/api/v2/safes/${address}/funded/`
  );
};

export const getSafeCreationTx = async (address: string) => {
  const { data } = await axios.get<{ blockNumber: string; txHash: string }>(
    `${Constants.expoConfig.extra.safeRelayApi}/api/v2/safes/${address}/funded/`
  );
  return data;
};

type SendTransactionArgs = {
  safe: string;
  to: string;
  value: string;
  data: string;
  operation: 0;
  signatures: any[];
  safeTxGas: string;
  dataGas: string;
  gasPrice: string;
  nonce: string;
  gasToken: string;
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

export const sendTransaction = async (options: SendTransactionArgs) => {
  const { data } = await axios.post<SendTransactionResponse>(
    `${Constants.expoConfig.extra.safeRelayApi}/api/v1/safes/${options.safe}/transactions/`,
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
  baseGas: number;
  dataGas: number;
  operationalGas: number;
  gasPrice: number;
  lastUsedNonce: number;
  gasToken: string;
  refundReceiver: string;
};

export const estimateGas = async (options: EstimateGasArgs) => {
  const { data } = await axios.post<EstimateGasResponse>(
    `${Constants.expoConfig.extra.safeRelayApi}/api/v2/safes/${options.safe}/transactions/estimate/`,
    options
  );
  return data;
};
