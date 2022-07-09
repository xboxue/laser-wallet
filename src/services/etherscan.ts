import axios from "axios";
import { providers } from "ethers";
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

const getUrl = (chainId: number) => {
  if (!defaultChains.some((chain) => chain.id === chainId))
    throw new Error("Unsupported network");
  const chain = providers.getNetwork(chainId);

  if (chain.name === "homestead") return "https://api.etherscan.io/api";
  return `https://api-${chain.name}.etherscan.io/api`;
};

export const getTransactions = async (
  address: string,
  chainId: number,
  internal: boolean = false
) => {
  const { data } = await axios.get(getUrl(chainId), {
    params: {
      module: "account",
      address,
      startblock: 0,
      endblock: 99999999,
      sort: "asc",
      apikey: Constants.manifest?.extra?.etherscanApiKey,
      action: internal ? "txlistinternal" : "txlist",
    },
  });
  return data?.result;
};

export const getERC20Transfers = async (address: string, chainId: number) => {
  const { data } = await axios.get(getUrl(chainId), {
    params: {
      module: "account",
      action: "tokentx",
      address,
      startblock: 0,
      endblock: 99999999,
      sort: "asc",
      apikey: Constants.manifest?.extra?.etherscanApiKey,
    },
  });
  return data?.result;
};