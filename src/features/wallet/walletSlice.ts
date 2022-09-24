import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OffChainTransaction } from "laser-sdk/dist/types";
import { RootState } from "../../store";

type Wallet = {
  address: string;
  // chainId: number;
};

interface WalletState {
  walletAddress: string | null;
  vaultAddress: string | null;
  // vaults: Wallet[];
  wallets: Wallet[];
  email: string | null;
  isVaultLocked: boolean;
  recoverTx: OffChainTransaction | null;
}

const initialState: WalletState = {
  walletAddress: null,
  vaultAddress: null,
  wallets: [],
  email: null,
  isVaultLocked: false,
  recoverTx: null,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setWalletAddress: (state, action: PayloadAction<string>) => {
      state.walletAddress = action.payload;
    },
    setVaultAddress: (state, action: PayloadAction<string>) => {
      state.vaultAddress = action.payload;
    },
    setWallets: (state, action: PayloadAction<Wallet[]>) => {
      state.wallets = action.payload;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setIsVaultLocked: (state, action: PayloadAction<boolean>) => {
      state.isVaultLocked = action.payload;
    },
    setRecoverTx: (
      state,
      action: PayloadAction<OffChainTransaction | null>
    ) => {
      state.recoverTx = action.payload;
    },
  },
});

export const selectWallets = (state: RootState) => state.wallet.wallets;
export const selectWalletAddress = (state: RootState) =>
  state.wallet.walletAddress;
export const selectVaultAddress = (state: RootState) =>
  state.wallet.vaultAddress;
export const selectEmail = (state: RootState) => state.wallet.email;
export const selectIsVaultLocked = (state: RootState) =>
  state.wallet.isVaultLocked;
export const selectRecoverTx = (state: RootState) => state.wallet.recoverTx;

export const {
  setWalletAddress,
  setVaultAddress,
  setWallets,
  setEmail,
  setIsVaultLocked,
  setRecoverTx,
} = walletSlice.actions;

export default walletSlice.reducer;
