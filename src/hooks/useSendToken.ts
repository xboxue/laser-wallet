import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ethers, providers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { useSelector } from "react-redux";
import { useProvider } from "wagmi";
import { Erc20__factory } from "../abis/types";
import { selectChainId } from "../features/network/networkSlice";
import { selectWalletAddress } from "../features/wallet/walletSlice";
import { getPrivateKey } from "../utils/wallet";

type SendTokenArgs = { to: string; amount: string; token: any };

const useSendToken = (
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

  return useMutation(async ({ to, amount, token }: SendTokenArgs) => {
    const privateKey = await getPrivateKey(walletAddress);

    const owner = new ethers.Wallet(privateKey).connect(provider);
    const erc20 = Erc20__factory.connect(token.address, owner);
    return erc20.transfer(to, parseUnits(amount, token.decimals));
  }, options);
};

export default useSendToken;
