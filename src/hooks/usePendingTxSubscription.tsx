import { useQueries } from "@tanstack/react-query";
import { providers } from "ethers";
import { Interface } from "ethers/lib/utils";
import { useToast } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import ToastAlert from "../components/ToastAlert/ToastAlert";
import {
  selectPendingTransactions,
  setTransactionConfirmed,
} from "../features/transactions/transactionsSlice";
import { setVaultAddress } from "../features/wallet/walletSlice";

const usePendingTxSubscription = () => {
  const dispatch = useDispatch();
  const pendingTxs = useSelector(selectPendingTransactions);
  const toast = useToast();

  useQueries({
    queries: pendingTxs.map((pendingTx) => ({
      queryKey: ["pendingTx", pendingTx.hash],
      queryFn: () => pendingTx.wait(1),
      onSuccess: (receipt: providers.TransactionReceipt) => {
        if (receipt && pendingTx.isDeployVault) {
          const iface = new Interface(["event LaserCreated(address laser)"]);
          const vaultAddress = iface.parseLog(receipt.logs[0]).args[0];
          dispatch(setVaultAddress(vaultAddress));
        }

        if (receipt && pendingTx.isLockVault) {
          dispatch(setVaultAddress(receipt.to));
        }

        dispatch(setTransactionConfirmed(pendingTx.hash));

        toast.show({
          render: () => (
            <ToastAlert status="success" title="Transaction confirmed" />
          ),
          duration: 2000,
        });
      },
      enabled: !pendingTx.confirmed,
    })),
  });
};

export default usePendingTxSubscription;
