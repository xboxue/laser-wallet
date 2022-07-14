import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import createSecureStore from "redux-persist-expo-securestore";
import walletReducer from "./features/wallet/walletSlice";
import guardiansReducer from "./features/guardians/guardiansSlice";
import networkReducer from "./features/network/networkSlice";
import walletConnectReducer from "./features/walletConnect/walletConnectSlice";
import transactionsReducer from "./features/transactions/transactionsSlice";

export const store = configureStore({
  reducer: {
    walletConnect: walletConnectReducer,
    guardians: guardiansReducer,
    transactions: transactionsReducer,
    network: persistReducer(
      { key: "network", storage: AsyncStorage },
      networkReducer
    ),
    wallet: persistReducer(
      { key: "auth", storage: createSecureStore() },
      walletReducer
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
