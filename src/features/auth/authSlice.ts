import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

interface AuthState {
  passcode: string | null;
  isAuthenticated: boolean;
  isBiometricsEnabled: boolean;
  backupPassword: string | null;
}

const initialState: AuthState = {
  passcode: null,
  isAuthenticated: false,
  isBiometricsEnabled: true,
  backupPassword: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setPasscode: (state, action: PayloadAction<string>) => {
      state.passcode = action.payload;
    },
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setIsBiometricsEnabled: (state, action: PayloadAction<boolean>) => {
      state.isBiometricsEnabled = action.payload;
    },
    setBackupPassword: (state, action: PayloadAction<string>) => {
      state.backupPassword = action.payload;
    },
  },
});

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectPasscode = (state: RootState) => state.auth.passcode;
export const selectIsBiometricsEnabled = (state: RootState) =>
  state.auth.isBiometricsEnabled;
export const selectBackupPassword = (state: RootState) =>
  state.auth.backupPassword;

export const {
  setPasscode,
  setIsAuthenticated,
  setIsBiometricsEnabled,
  setBackupPassword,
} = authSlice.actions;

export default authSlice.reducer;
