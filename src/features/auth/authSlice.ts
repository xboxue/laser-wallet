import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

type Wallet = {
  address: string;
  chainId: number;
  // ownerAddress: string;
  // recoveryOwnerAddress: string;
};

interface AuthState {
  ownerAddress: string | null;
  ownerPrivateKey: string | null;
  walletAddress: string | null;
  recoveryOwnerAddress: string | null;
  wallets: Wallet[];
}

const initialState: AuthState = {
  ownerAddress: null,
  ownerPrivateKey: null,
  walletAddress: null,
  recoveryOwnerAddress: null,
  wallets: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setOwnerAddress: (state, action: PayloadAction<string>) => {
      state.ownerAddress = action.payload;
    },
    setOwnerPrivateKey: (state, action: PayloadAction<string>) => {
      state.ownerPrivateKey = action.payload;
    },
    setWalletAddress: (state, action: PayloadAction<string>) => {
      state.walletAddress = action.payload;
    },
    setRecoveryOwnerAddress: (state, action: PayloadAction<string>) => {
      state.recoveryOwnerAddress = action.payload;
    },
    addWallet: (state, action: PayloadAction<Wallet>) => {
      state.wallets.push(action.payload);
    },
  },
});

export const selectOwnerAddress = (state: RootState) => state.auth.ownerAddress;
export const selectOwnerPrivateKey = (state: RootState) =>
  state.auth.ownerPrivateKey;
export const selectWalletAddress = (state: RootState) =>
  state.auth.walletAddress;
export const selectRecoveryOwnerAddress = (state: RootState) =>
  state.auth.recoveryOwnerAddress;
export const selectWallets = (state: RootState) => state.auth.wallets;

export const {
  setOwnerAddress,
  setOwnerPrivateKey,
  setWalletAddress,
  setRecoveryOwnerAddress,
  addWallet,
} = authSlice.actions;

export default authSlice.reducer;
