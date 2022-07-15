import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

interface AuthState {
  passcode: string | null;
  authenticated: boolean;
}

const initialState: AuthState = {
  passcode: null,
  authenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setPasscode: (state, action: PayloadAction<string>) => {
      state.passcode = action.payload;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.authenticated = action.payload;
    },
  },
});

export const selectAuthenticated = (state: RootState) =>
  state.auth.authenticated;
export const selectPasscode = (state: RootState) => state.auth.passcode;

export const { setPasscode, setAuthenticated } = authSlice.actions;

export default authSlice.reducer;
