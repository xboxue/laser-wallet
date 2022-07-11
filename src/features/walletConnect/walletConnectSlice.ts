import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import WalletConnect from "@walletconnect/client";
import { IJsonRpcRequest } from "@walletconnect/types";
import { RootState } from "../../store";

interface WalletConnectState {
  connector: WalletConnect | null;
  callRequest: IJsonRpcRequest | null;
  pending: boolean;
}

const initialState: WalletConnectState = {
  connector: null,
  callRequest: null,
  pending: false,
};

const walletConnectSlice = createSlice({
  name: "walletConnect",
  initialState,
  reducers: {
    setConnector: (state, action: PayloadAction<WalletConnect | null>) => {
      state.connector = action.payload;
    },
    setPending: (state, action: PayloadAction<boolean>) => {
      state.pending = action.payload;
    },
    setCallRequest: (state, action: PayloadAction<IJsonRpcRequest | null>) => {
      state.callRequest = action.payload;
    },
  },
});

export const selectConnector = (state: RootState) =>
  state.walletConnect.connector;
export const selectCallRequest = (state: RootState) =>
  state.walletConnect.callRequest;
export const selectPending = (state: RootState) => state.walletConnect.pending;

export const { setConnector, setPending, setCallRequest } =
  walletConnectSlice.actions;

export default walletConnectSlice.reducer;
