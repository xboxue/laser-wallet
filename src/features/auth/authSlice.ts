import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

interface AuthState {
  isAuthenticated: boolean;
  isBiometricsEnabled: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isBiometricsEnabled: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
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
export const selectIsBiometricsEnabled = (state: RootState) =>
  state.auth.isBiometricsEnabled;

export const { setIsAuthenticated, setIsBiometricsEnabled } = authSlice.actions;

export default authSlice.reducer;
