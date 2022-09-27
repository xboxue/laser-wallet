import { useAuth } from "@clerk/clerk-expo";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import axios from "axios";
import { ethers, providers, Wallet } from "ethers";
import * as SecureStore from "expo-secure-store";
import { Laser } from "laser-sdk";
import { bundleTransactions } from "laser-sdk/dist/utils";
import { useSelector } from "react-redux";
import { useProvider } from "wagmi";
import { selectChainId } from "../features/network/networkSlice";
import {
  selectWalletAddress,
  selectWallets,
} from "../features/wallet/walletSlice";
import { signTransaction } from "../services/vault";
import { getPrivateKey } from "../utils/wallet";

type SendEthArgs = { to: string; amount: string };

const useSendVaultEth = (
  options?: Omit<
    UseMutationOptions<
      providers.TransactionResponse,
      unknown,
      SendEthArgs,
      unknown
    >,
    "mutationFn" | "mutationKey"
  >
) => {
  const chainId = useSelector(selectChainId);
  const walletAddress = useSelector(selectWalletAddress);
  const provider = useProvider({ chainId });
  const wallets = useSelector(selectWallets);
  const { getToken } = useAuth();

  return useMutation(async ({ to, amount }: SendEthArgs) => {
    const ownerPrivateKey = await SecureStore.getItemAsync("ownerPrivateKey", {
      requireAuthentication: true,
    });
    if (!ownerPrivateKey) throw new Error("No private key");

    const privateKey = await getPrivateKey(wallets[0].address);

    const owner = new ethers.Wallet(ownerPrivateKey);
    const laser = new Laser(provider, owner, walletAddress);
    const nonce = await laser.wallet.nonce();

    const transaction = await laser.sendEth(to, amount, nonce);
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");

    const signatures = await signTransaction(transaction, token);
    const tx = bundleTransactions(transaction, {
      ...transaction,
      signatures,
      signer: "guardian",
    });

    const wallet = new Wallet(privateKey, provider);
    return laser.execTransaction(tx, wallet);
  }, options);
};

export default useSendVaultEth;
