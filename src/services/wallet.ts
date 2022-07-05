import axios from "axios";
import { providers } from "ethers";
import Constants from "expo-constants";
import { Transaction } from "laser-sdk/dist/types";

type CreateWalletOptions = {
  chainId: number;
  ownerAddress: string;
  recoveryOwnerAddress: string;
  guardians: string[];
};

type SendTransactionOptions = {
  chainId: number;
  sender: string;
  transaction: Transaction;
};

export const createWallet = async ({
  chainId,
  ownerAddress,
  recoveryOwnerAddress,
  guardians,
}: CreateWalletOptions) => {
  const { data } = await axios.post(
    `${Constants.manifest?.extra?.relayerUrl}/wallets`,
    {
      chainId,
      ownerAddress,
      recoveryOwnerAddress,
      guardians,
    }
  );

  if (!data.walletAddress) throw new Error("Wallet creation failed");

  return data.walletAddress;
};

export const sendTransaction = async ({
  transaction,
  sender,
  chainId,
}: SendTransactionOptions) => {
  const { data } = await axios.post<providers.TransactionResponse>(
    `${Constants.manifest?.extra?.relayerUrl}/transactions`,
    { transaction, sender, chainId }
  );

  return data;
};
