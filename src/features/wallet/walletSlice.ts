import { createSlice, PayloadAction } from "@reduxjs/toolkit";
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
}

const initialState: WalletState = {
  walletAddress: null,
  vaultAddress: null,
  wallets: [],
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
  },
});

export const selectWallets = (state: RootState) => state.wallet.wallets;
export const selectWalletAddress = (state: RootState) =>
  state.wallet.walletAddress;
export const selectVaultAddress = (state: RootState) =>
  state.wallet.vaultAddress;

export const { setWalletAddress, setVaultAddress, setWallets } =
  walletSlice.actions;

export default walletSlice.reducer;
