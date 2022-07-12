import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_CHAIN } from "../../constants/chains";
import { RootState } from "../../store";

interface NetworkState {
  chainId: number;
}

const initialState: NetworkState = {
  chainId: DEFAULT_CHAIN,
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
