import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { providers } from "ethers";
import { RootState } from "../../store";
import { CallRequest } from "../walletConnect/walletConnectSlice";

export interface PendingTransaction extends providers.TransactionResponse {
  hash: string;
  callRequest?: CallRequest;
  isDeployVault?: boolean;
  isLockVault?: boolean;
  isRecoverVault?: boolean;
}

interface TransactionsState {
  pendingTransactions: PendingTransaction[];
}

const initialState: TransactionsState = {
  pendingTransactions: [],
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    addPendingTransaction: (
      state,
      action: PayloadAction<PendingTransaction>
    ) => {
      state.pendingTransactions.push(action.payload);
    },
    removePendingTransaction: (state, action: PayloadAction<string>) => {
      state.pendingTransactions = state.pendingTransactions.filter(
        (transaction) => transaction.hash !== action.payload
      );
    },
  },
});

export const selectPendingTransactions = (state: RootState) =>
  state.transactions.pendingTransactions;

export const { addPendingTransaction, removePendingTransaction } =
  transactionsSlice.actions;

export default transactionsSlice.reducer;
