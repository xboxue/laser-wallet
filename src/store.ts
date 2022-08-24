import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import createSecureStore from "redux-persist-expo-securestore";
import authReducer from "./features/auth/authSlice";
import guardiansReducer from "./features/guardians/guardiansSlice";
import networkReducer from "./features/network/networkSlice";
import transactionsReducer from "./features/transactions/transactionsSlice";
import walletReducer from "./features/wallet/walletSlice";
import walletConnectReducer from "./features/walletConnect/walletConnectSlice";

export const store = configureStore({
  reducer: {
    walletConnect: persistReducer(
      {
        key: "walletConnect",
        storage: AsyncStorage,
        whitelist: ["sessions"],
      },
      walletConnectReducer
    ),
    guardians: persistReducer(
      { key: "guardians", storage: AsyncStorage },
      guardiansReducer
    ),
    transactions: transactionsReducer,
    network: persistReducer(
      { key: "network", storage: AsyncStorage },
      networkReducer
    ),
    wallet: persistReducer(
      { key: "wallet", storage: AsyncStorage },
      walletReducer
    ),
    auth: persistReducer(
      {
        key: "passcode",
        storage: createSecureStore(),
        blacklist: ["isAuthenticated"],
      },
      authReducer
    ),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const getPersistor = () => persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
