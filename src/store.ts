import { configureStore } from "@reduxjs/toolkit";
import walletConnectReducer from "./features/walletConnect/walletConnectSlice";

export const store = configureStore({
  reducer: {
    walletConnect: walletConnectReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
