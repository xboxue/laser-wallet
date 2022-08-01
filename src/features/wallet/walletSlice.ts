import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

type Wallet = {
  address: string;
  chainId: number;
  // ownerAddress: string;
  // recoveryOwnerAddress: string;
};

interface WalletState {
  ownerAddress: string | null;
  ownerPrivateKey: string | null;
  walletAddress: string | null;
  recoveryOwnerAddress: string | null;
  recoveryOwnerPrivateKey: string | null;
  wallets: Wallet[];
  salt: number | null;
}

const initialState: WalletState = {
  ownerAddress: null,
  ownerPrivateKey: null,
  walletAddress: null,
  recoveryOwnerAddress: null,
  recoveryOwnerPrivateKey: null,
  wallets: [],
  salt: null,
};

const walletSlice = createSlice({
  name: "wallet",
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
    setRecoveryOwnerPrivateKey: (state, action: PayloadAction<string>) => {
      state.recoveryOwnerPrivateKey = action.payload;
    },
    setSalt: (state, action: PayloadAction<number>) => {
      state.salt = action.payload;
    },
    addWallet: (state, action: PayloadAction<Wallet>) => {
      state.wallets.push(action.payload);
    },
  },
});

export const selectOwnerAddress = (state: RootState) =>
  state.wallet.ownerAddress;
export const selectOwnerPrivateKey = (state: RootState) =>
  state.wallet.ownerPrivateKey;
export const selectWalletAddress = (state: RootState) =>
  state.wallet.walletAddress;
export const selectRecoveryOwnerAddress = (state: RootState) =>
  state.wallet.recoveryOwnerAddress;
export const selectRecoveryOwnerPrivateKey = (state: RootState) =>
  state.wallet.recoveryOwnerPrivateKey;
export const selectWallets = (state: RootState) => state.wallet.wallets;
export const selectSalt = (state: RootState) => state.wallet.salt;

export const {
  setOwnerAddress,
  setOwnerPrivateKey,
  setWalletAddress,
  setRecoveryOwnerAddress,
  setRecoveryOwnerPrivateKey,
  addWallet,
  setSalt,
} = walletSlice.actions;

export default walletSlice.reducer;
