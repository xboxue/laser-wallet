import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

interface AuthState {
  passcode: string | null;
  isAuthenticated: boolean;
  isBiometricsEnabled: boolean;
}

const initialState: AuthState = {
  passcode: null,
  isAuthenticated: false,
  isBiometricsEnabled: true,
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
  },
});

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectPasscode = (state: RootState) => state.auth.passcode;
export const selectIsBiometricsEnabled = (state: RootState) =>
  state.auth.isBiometricsEnabled;

export const { setPasscode, setIsAuthenticated, setIsBiometricsEnabled } =
  authSlice.actions;

export default authSlice.reducer;
