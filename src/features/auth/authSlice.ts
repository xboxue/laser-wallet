import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

interface AuthState {
  ownerAddress: string | null;
  walletAddress: string | null;
}

const initialState: AuthState = { ownerAddress: null, walletAddress: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setOwnerAddress: (state, action: PayloadAction<string | null>) => {
      state.ownerAddress = action.payload;
    },
    setWalletAddress: (state, action: PayloadAction<string | null>) => {
      state.walletAddress = action.payload;
    },
  },
});

export const selectOwnerAddress = (state: RootState) => state.auth.ownerAddress;
export const selectWalletAddress = (state: RootState) =>
  state.auth.walletAddress;

export const { setOwnerAddress, setWalletAddress } = authSlice.actions;

export default authSlice.reducer;
