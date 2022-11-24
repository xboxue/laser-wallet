import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import SafeServiceClient, {
  TransferListResponse,
  TransferWithTokenInfoResponse,
} from "@gnosis.pm/safe-service-client";
import axios from "axios";
import { ethers, providers } from "ethers";
import { getAddress } from "ethers/lib/utils";
import Constants from "expo-constants";

export const getTransactionServiceUrl = (chainId: number) => {
  if (chainId === 1) return "https://safe-transaction-mainnet.safe.global";
  else if (chainId === 5) return "https://safe-transaction-goerli.safe.global";
  else throw new Error("Chain not supported");
};

export const getSafeService = (chainId: number) => {
  const provider = new providers.InfuraProvider(
    chainId,
    Constants.manifest.extra.infuraApiKey
  );

  const ethAdapter = new EthersAdapter({
    ethers,
    signer: new ethers.Wallet(
      "0x0f4eb853643472a57e6be53f6e93743fd41faa96910ff62ffd18ff52efe76dc6",
      provider
    ),
  });

  return new SafeServiceClient({
    txServiceUrl: getTransactionServiceUrl(chainId),
    ethAdapter,
  });
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
