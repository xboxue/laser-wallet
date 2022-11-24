import { useAuth } from "@clerk/clerk-expo";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { BigNumber, ethers, providers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import Constants from "expo-constants";
import { useSelector } from "react-redux";
import { Safe } from "safe-sdk-wrapper";
import { useProvider } from "wagmi";
import { selectChainId } from "../features/network/networkSlice";
import { selectWalletAddress } from "../features/wallet/walletSlice";
import { signTransaction } from "../services/guardian";
import { getItem } from "../services/keychain";
import {
  createMultisigTx,
  estimateGas,
  getMultsigTxSignatures,
  sendTransaction,
} from "../services/safe";

type SendEthArgs = { to: string; amount: string };

const useSendVaultEth = (
  onSuccess: ({
    hash,
    infuraHash,
  }: {
    hash: string;
    infuraHash: string;
  }) => void
) => {
  const chainId = useSelector(selectChainId);
  const walletAddress = useSelector(selectWalletAddress);
  const provider = useProvider({ chainId });
  const { getToken } = useAuth();

  return useMutation(
    async ({ to, amount }: SendEthArgs) => {
      const ownerPrivateKey = await getItem("ownerPrivateKey");
      if (!ownerPrivateKey) throw new Error("No private key");

      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const owner = new ethers.Wallet(ownerPrivateKey);
      try {
        const { safeTxGas } = await estimateGas({
          safe: walletAddress,
          to,
          value: parseEther(amount).toString(),
          operation: 0,
          data: "0x",
        });

        const safe = new Safe(provider, owner, walletAddress);
        const tx = await safe.sendEth(to, amount, {
          gasLimit: safeTxGas,
          relayer: Constants.expoConfig.extra.relayerAddress,
        });
        await createMultisigTx({
          ...tx,
          baseGas: tx.baseGas.toString(),
          gasPrice: tx.gasPrice.toString(),
          safeTxGas: tx.safeTxGas.toString(),
          nonce: tx.nonce.toString(),
          value: tx.value.toString(),
          safe: walletAddress,
          contractTransactionHash: tx.hash,
          signature: tx.signatures,
          sender: owner.address,
        });

        await signTransaction(tx.hash, token);
        const signatures = await getMultsigTxSignatures(tx.hash);

        const { relayTransactionHash } = await sendTransaction({
          ...tx,
          signatures,
          sender: walletAddress,
          chainId,
        });

        const infuraProvider = new providers.InfuraProvider(
          chainId,
          Constants.manifest?.extra?.infuraApiKey
        );

        let broadcasts;
        while (true) {
          broadcasts = (
            await infuraProvider.send("relay_getTransactionStatus", [
              relayTransactionHash,
            ])
          ).broadcasts;
          if (broadcasts) break;

          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        return {
          infuraHash: relayTransactionHash,
          hash: broadcasts[0].ethTxHash,
        };
      } catch (e) {
        console.log(e.response);
        throw e;
      }
    },
    { onSuccess }
  );
};

export default useSendVaultEth;
