import { useQueries } from "@tanstack/react-query";
import { providers } from "ethers";
import { useToast } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import ToastAlert from "../components/ToastAlert/ToastAlert";
import { selectChainId } from "../features/network/networkSlice";
import {
  selectPendingTransactions,
  setTransactionConfirmed,
} from "../features/transactions/transactionsSlice";
import waitForTransaction from "../utils/waitForTransaction";

const usePendingTxSubscription = () => {
  const dispatch = useDispatch();
  const pendingTxs = useSelector(selectPendingTransactions);
  const toast = useToast();
  const chainId = useSelector(selectChainId);

  useQueries({
    queries: pendingTxs.map((pendingTx) => ({
      queryKey: ["pendingTx", pendingTx.hash],
      queryFn: () =>
        waitForTransaction({ hash: pendingTx.infuraHash, chainId }),
      onSuccess: (receipt: providers.TransactionReceipt) => {
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
