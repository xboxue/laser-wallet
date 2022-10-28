import { useAuth } from "@clerk/clerk-expo";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { BigNumber, ethers, providers } from "ethers";
import { arrayify, parseEther, splitSignature } from "ethers/lib/utils";
import { orderBy, sortBy } from "lodash";
import { useSelector } from "react-redux";
import { useProvider } from "wagmi";
import { GnosisSafe__factory } from "../abis/types";
import { selectChainId } from "../features/network/networkSlice";
import { selectWalletAddress } from "../features/wallet/walletSlice";
import { signTransaction } from "../services/emailGuardian";
import { getItem } from "../services/keychain";
import { estimateGas, sendTransaction } from "../services/safe";

type SendEthArgs = { to: string; amount: string };

const useSendVaultEth = (
  options?: Omit<
    UseMutationOptions<any, unknown, SendEthArgs, unknown>,
    "mutationFn" | "mutationKey"
  >
) => {
  const chainId = useSelector(selectChainId);
  const walletAddress = useSelector(selectWalletAddress);
  const provider = useProvider({ chainId });
  const { getToken } = useAuth();

  return useMutation(async ({ to, amount }: SendEthArgs) => {
    const ownerPrivateKey = await getItem("ownerPrivateKey");
    if (!ownerPrivateKey) throw new Error("No private key");

    const token = await getToken();
    if (!token) throw new Error("Not authenticated");

    const owner = new ethers.Wallet(ownerPrivateKey);
    const gasData = await estimateGas({
      safe: walletAddress,
      to,
      value: parseEther(amount).toString(),
      operation: 0,
      data: "0x",
    });

    const safe = GnosisSafe__factory.connect(walletAddress, provider);
    const safeTxHash = await safe.getTransactionHash(
      to,
      parseEther(amount),
      "0x",
      0,
      gasData.safeTxGas,
      gasData.baseGas,
      gasData.gasPrice,
      gasData.gasToken,
      gasData.refundReceiver,
      gasData.lastUsedNonce === null ? 0 : gasData.lastUsedNonce + 1
    );

    const signature = (await owner.signMessage(arrayify(safeTxHash)))
      .replace(/1b$/, "1f")
      .replace(/1c$/, "20");

    const guardianSignature = await signTransaction(
      {
        safe: walletAddress,
        chainId,
        hash: safeTxHash,
        to,
        value: parseEther(amount).toString(),
        data: "0x",
        operation: 0,
        safeTxGas: gasData.safeTxGas,
        baseGas: gasData.baseGas,
        gasPrice: gasData.gasPrice,
        gasToken: gasData.gasToken,
        refundReceiver: gasData.refundReceiver,
        nonce: gasData.lastUsedNonce === null ? 0 : gasData.lastUsedNonce + 1,
      },
      token
    );

    const { ethereumTx } = await sendTransaction({
      safe: walletAddress,
      to,
      value: parseEther(amount).toString(),
      data: "0x",
      operation: 0,
      signatures: sortBy([signature, guardianSignature], (signature) =>
        parseInt(signature, 16)
      ).map((signature) => {
        const { r, s, v } = splitSignature(signature);
        return {
          r: BigNumber.from(r).toString(),
          s: BigNumber.from(s).toString(),
          v,
        };
      }),
      safeTxGas: gasData.safeTxGas,
      dataGas: gasData.dataGas,
      gasPrice: gasData.gasPrice,
      gasToken: gasData.gasToken,
      refundReceiver: gasData.refundReceiver,
      nonce: gasData.lastUsedNonce === null ? 0 : gasData.lastUsedNonce + 1,
    });
    return ethereumTx;
  }, options);
};

export default useSendVaultEth;
