import axios from "axios";
import Constants from "expo-constants";
import { FactoryTransaction } from "laser-sdk/dist/sdk/LaserFactory";
import { Transaction } from "laser-sdk/dist/types";

type TransactionResponse = {
  relayTransactionHash: string;
};

type CreateWalletOptions = {
  chainId: number;
  transaction: FactoryTransaction;
};

type SendTransactionOptions = {
  chainId: number;
  sender: string;
  transaction: Transaction;
};

export const createWallet = async ({
  chainId,
  transaction,
}: CreateWalletOptions) => {
  const { data } = await axios.post<TransactionResponse>(
    `${Constants.manifest?.extra?.relayerUrl}/wallets`,
    { chainId, transaction }
  );

  if (!data.relayTransactionHash) throw new Error("Wallet creation failed");
  return data.relayTransactionHash;
};

export const sendTransaction = async ({
  transaction,
  sender,
  chainId,
}: SendTransactionOptions) => {
  const { data } = await axios.post<TransactionResponse>(
    `${Constants.manifest?.extra?.relayerUrl}/transactions`,
    { transaction, sender, chainId }
  );

  if (!data.relayTransactionHash) throw new Error("Transaction failed");
  return data.relayTransactionHash;
};
