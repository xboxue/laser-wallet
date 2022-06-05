import { configureStore } from "@reduxjs/toolkit";
import walletConnectReducer from "./features/walletConnect/walletConnectSlice";
import guardiansReducer from "./features/guardians/guardiansSlice";
import authReducer from "./features/auth/authSlice";

export const store = configureStore({
  reducer: {
    walletConnect: walletConnectReducer,
    guardians: guardiansReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
