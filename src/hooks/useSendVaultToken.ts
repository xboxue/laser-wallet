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
import { signHash } from "../services/vault";

type SendTokenArgs = { to: string; amount: string; token: any };

const useSendVaultToken = (
  options?: Omit<
    UseMutationOptions<
      providers.TransactionResponse,
      unknown,
      SendTokenArgs,
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

  return useMutation(async ({ to, amount, token }: SendTokenArgs) => {
    const ownerPrivateKey = await SecureStore.getItemAsync("ownerPrivateKey", {
      requireAuthentication: true,
    });
    const privateKeys = await SecureStore.getItemAsync("privateKeys", {
      requireAuthentication: true,
    });
    if (!privateKeys || !ownerPrivateKey) throw new Error("No private key");

    const owner = new ethers.Wallet(ownerPrivateKey);
    const laser = new Laser(provider, owner, walletAddress);
    const nonce = await laser.wallet.nonce();

    const transaction = await laser.transferERC20(
      token.address,
      to,
      amount,
      nonce
    );
    const hash = await laser.wallet.operationHash(
      token.address,
      0,
      transaction.callData,
      nonce
    );

    const authToken = await getToken();
    if (!authToken) throw new Error("Not authenticated");

    const signatures = await signHash(hash, authToken);
    const tx = bundleTransactions(transaction, {
      ...transaction,
      signatures,
      signer: "guardian",
    });

    const wallet = new Wallet(
      JSON.parse(privateKeys)[wallets[0].address],
      provider
    );
    return laser.execTransaction(tx, wallet, 100000);
  }, options);
};

export default useSendVaultToken;
