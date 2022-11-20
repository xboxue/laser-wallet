import { DeploySafeProps } from "@gnosis.pm/safe-core-sdk";
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
  email: string | null;
  ownerAddress: string | null;
  recoveryOwnerAddress: string | null;
  trustedOwnerAddress: string | null;
  safeConfig: DeploySafeProps | null;
}

const initialState: WalletState = {
  walletAddress: null,
  vaultAddress: null,
  wallets: [],
  email: null,
  ownerAddress: null,
  recoveryOwnerAddress: null,
  trustedOwnerAddress: null,
  safeConfig: null,
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
    setOwnerAddress: (state, action: PayloadAction<string>) => {
      state.ownerAddress = action.payload;
    },
    setRecoveryOwnerAddress: (state, action: PayloadAction<string>) => {
      state.recoveryOwnerAddress = action.payload;
    },
    setTrustedOwnerAddress: (state, action: PayloadAction<string>) => {
      state.trustedOwnerAddress = action.payload;
    },
    setSafeConfig: (state, action: PayloadAction<DeploySafeProps>) => {
      state.safeConfig = action.payload;
    },
  },
});

export const selectWallets = (state: RootState) => state.wallet.wallets;
export const selectWalletAddress = (state: RootState) => {
  // if (!state.wallet.walletAddress) throw new Error("Wallet address not set");
  return state.wallet.walletAddress;
};
export const selectVaultAddress = (state: RootState) =>
  state.wallet.vaultAddress;
export const selectEmail = (state: RootState) => state.wallet.email;
export const selectOwnerAddress = (state: RootState) => {
  return state.wallet.ownerAddress;
};
export const selectRecoveryOwnerAddress = (state: RootState) => {
  return state.wallet.recoveryOwnerAddress;
};
export const selectTrustedOwnerAddress = (state: RootState) => {
  return state.wallet.trustedOwnerAddress;
};
export const selectSafeConfig = (state: RootState) => {
  return state.wallet.safeConfig;
};

export const {
  setWalletAddress,
  setVaultAddress,
  setWallets,
  setEmail,
  setOwnerAddress,
  setRecoveryOwnerAddress,
  setTrustedOwnerAddress,
  setSafeConfig,
} = walletSlice.actions;

export default walletSlice.reducer;
