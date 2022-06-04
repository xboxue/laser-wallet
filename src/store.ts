import { configureStore } from "@reduxjs/toolkit";
import walletConnectReducer from "./features/walletConnect/walletConnectSlice";
import guardiansReducer from "./features/guardians/guardiansSlice";

export const store = configureStore({
  reducer: {
    walletConnect: walletConnectReducer,
    guardians: guardiansReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
