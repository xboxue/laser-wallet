import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

interface NetworkState {
  chainId: number;
}

const initialState: NetworkState = {
  chainId: 5,
};

const networkSlice = createSlice({
  name: "network",
  initialState,
  reducers: {
    setChainId: (state, action: PayloadAction<number>) => {
      state.chainId = action.payload;
    },
  },
});

export const selectChainId = (state: RootState) => state.network.chainId;

export const { setChainId } = networkSlice.actions;

export default networkSlice.reducer;
