import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

interface AuthState {
  ownerAddress: string | null;
  ownerPrivateKey: string | null;
  walletAddress: string | null;
  recoveryOwnerAddress: string | null;
}

const initialState: AuthState = {
  ownerAddress: null,
  ownerPrivateKey: null,
  walletAddress: null,
  recoveryOwnerAddress: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setOwnerAddress: (state, action: PayloadAction<string | null>) => {
      state.ownerAddress = action.payload;
    },
    setOwnerPrivateKey: (state, action: PayloadAction<string | null>) => {
      state.ownerPrivateKey = action.payload;
    },
    setWalletAddress: (state, action: PayloadAction<string | null>) => {
      state.walletAddress = action.payload;
    },
    setRecoveryOwnerAddress: (state, action: PayloadAction<string | null>) => {
      state.recoveryOwnerAddress = action.payload;
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

export const {
  setOwnerAddress,
  setOwnerPrivateKey,
  setWalletAddress,
  setRecoveryOwnerAddress,
} = authSlice.actions;

export default authSlice.reducer;
