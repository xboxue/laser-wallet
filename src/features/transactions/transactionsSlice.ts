import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { providers } from "ethers";
import { RootState } from "../../store";
import { CallRequest } from "../walletConnect/walletConnectSlice";

export interface PendingTransaction {
  hash: string;
  confirmed?: boolean;
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
    setTransactionConfirmed: (state, action: PayloadAction<string>) => {
      const pendingTx = state.pendingTransactions.find(
        (tx) => tx.hash === action.payload
      );
      if (!pendingTx) throw new Error("No pending transaction found");
      pendingTx.confirmed = true;
    },
  },
});

export const selectPendingTransactions = (state: RootState) =>
  state.transactions.pendingTransactions;

export const {
  addPendingTransaction,
  removePendingTransaction,
  setTransactionConfirmed,
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
