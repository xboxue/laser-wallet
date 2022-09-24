import axios from "axios";
import Constants from "expo-constants";
import { defaultChains } from "wagmi";

export interface Transaction {
  blockNumber: string;
  contractAddress: string;
  errCode: string;
  from: string;
  gas: string;
  gasUsed: string;
  hash: string;
  input: string;
  isError: string;
  timeStamp: string;
  traceId: string;
  to: string;
  type: string;
  value: string;
  functionName: string;
  txreceipt_status: string;
}

export interface TransactionERC20 extends Transaction {
  nonce: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gasPrice: string;
  cumulativeGasUsed: string;
  confirmations: string;
}

interface GetTransactionsOptions {
  address?: string;
  chainId: number;
  internal?: boolean;
  txHash?: string;
  sort?: string;
  offset?: number;
  page?: number;
}

const getUrl = (chainId: number) => {
  const chain = defaultChains.find((chain) => chain.id === chainId);
  if (!chain) throw new Error("Unsupported network");

  if (chain.network === "homestead") return "https://api.etherscan.io/api";
  return `https://api-${chain.network}.etherscan.io/api`;
};

export const getAddressUrl = (chainId: number, address: string) => {
  const chain = defaultChains.find((chain) => chain.id === chainId);
  if (!chain) throw new Error("Unsupported network");

  if (chain.network === "homestead")
    return `https://etherscan.io/address/${address}`;
  return `https://${chain.network}.etherscan.io/address/${address}`;
};

export const getTransactionUrl = (chainId: number, hash: string) => {
  const chain = defaultChains.find((chain) => chain.id === chainId);
  if (!chain) throw new Error("Unsupported network");

  if (chain.network === "homestead") return `https://etherscan.io/tx/${hash}`;
  return `https://${chain.network}.etherscan.io/tx/${hash}`;
};

export const getTransactions = async ({
  address,
  chainId,
  internal,
  txHash,
  sort = "asc",
  page,
  offset,
}: GetTransactionsOptions) => {
  const { data } = await axios.get<{ result: Transaction[] }>(getUrl(chainId), {
    params: {
      module: "account",
      ...(!txHash && {
        address,
        sort,
        page,
        offset,
      }),
      apikey: Constants.expoConfig.extra.etherscanApiKey,
      action: internal ? "txlistinternal" : "txlist",
      txhash: txHash,
    },
  });
  return data.result;
};

export const getERC20Transfers = async (address: string, chainId: number) => {
  const { data } = await axios.get<{ result: TransactionERC20[] }>(
    getUrl(chainId),
    {
      params: {
        module: "account",
        action: "tokentx",
        address,
        startblock: 0,
        endblock: 99999999,
        sort: "asc",
        apikey: Constants.expoConfig.extra.etherscanApiKey,
      },
    }
  );
  return data.result;
};
