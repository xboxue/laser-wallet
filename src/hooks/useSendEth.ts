import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ethers, providers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import * as SecureStore from "expo-secure-store";
import { useSelector } from "react-redux";
import { useProvider } from "wagmi";
import { selectChainId } from "../features/network/networkSlice";
import { selectWalletAddress } from "../features/wallet/walletSlice";

type SendEthArgs = { to: string; amount: string };

const useSendEth = (
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

  return useMutation(async ({ to, amount }: SendEthArgs) => {
    const privateKeys = await SecureStore.getItemAsync("privateKeys", {
      requireAuthentication: true,
    });
    if (!privateKeys) throw new Error("No private key");
    const privateKey = JSON.parse(privateKeys)[walletAddress];
    if (!privateKey) throw new Error("No private key");

    const owner = new ethers.Wallet(privateKey, provider);
    return owner.sendTransaction({ to, value: parseEther(amount) });
  }, options);
};

export default useSendEth;
