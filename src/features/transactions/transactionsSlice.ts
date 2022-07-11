import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Transaction } from "laser-sdk/dist/types";
import { RootState } from "../../store";

export interface PendingTransaction extends Transaction {
  hash: string;
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