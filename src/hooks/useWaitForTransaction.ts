import { providers } from "ethers";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import waitForTransaction from "../utils/waitForTransaction";

type WaitForTransactionOptions = {
  confirmations?: number;
  chainId: number;
  hash: string;
} & UseQueryOptions<providers.TransactionReceipt>;

const useWaitForTransaction = ({
  confirmations,
  chainId,
  hash,
  onError,
  onSuccess,
  enabled = true,
}: WaitForTransactionOptions) => {
  return useQuery(
    ["transaction"],
    () => waitForTransaction({ hash, chainId, confirmations }),
    {
      enabled: enabled && !!hash,
      onError,
      onSuccess,
    }
  );
};

export default useWaitForTransaction;
