import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import WalletConnect from "@walletconnect/client";
import {
  IClientMeta,
  IJsonRpcRequest,
  IWalletConnectSession,
} from "@walletconnect/types";
import { RootState } from "../../store";

export type SessionRequest = {
  peerId: string;
  peerMeta: IClientMeta;
};

export type CallRequest = {
  peerId: string;
  peerMeta: IClientMeta;
} & IJsonRpcRequest;

interface WalletConnectState {
  connectors: WalletConnect[];
  sessions: IWalletConnectSession[];
  callRequest: CallRequest | null;
  sessionRequest: SessionRequest | null;
  isConnecting: boolean;
}

const initialState: WalletConnectState = {
  connectors: [],
  sessions: [],
  callRequest: null,
  sessionRequest: null,
  isConnecting: false,
};

const walletConnectSlice = createSlice({
  name: "walletConnect",
  initialState,
  reducers: {
    setIsConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
    },
    addConnector: (state, action: PayloadAction<WalletConnect>) => {
      state.connectors.push(action.payload);
    },
    removeConnector: (state, action: PayloadAction<string>) => {
      state.connectors = state.connectors.filter(
        (connector) => connector.peerId !== action.payload
      );
    },
    addSession: (state, action: PayloadAction<IWalletConnectSession>) => {
      state.sessions.push(action.payload);
    },
    removeSession: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter(
        (session) => session.peerId !== action.payload
      );
    },
    setSessionRequest: (
      state,
      action: PayloadAction<SessionRequest | null>
    ) => {
      state.sessionRequest = action.payload;
    },
    setCallRequest: (state, action: PayloadAction<CallRequest | null>) => {
      state.callRequest = action.payload;
    },
  },
});

export const selectIsConnecting = (state: RootState) =>
  state.walletConnect.isConnecting;
export const selectConnectors = (state: RootState) =>
  state.walletConnect.connectors;
export const selectSessions = (state: RootState) =>
  state.walletConnect.sessions;
export const selectCallRequest = (state: RootState) =>
  state.walletConnect.callRequest;
export const selectSessionRequest = (state: RootState) =>
  state.walletConnect.sessionRequest;

export const {
  setSessionRequest,
  setCallRequest,
  addSession,
  removeSession,
  addConnector,
  removeConnector,
  setIsConnecting,
} = walletConnectSlice.actions;

export default walletConnectSlice.reducer;
