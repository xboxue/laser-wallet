import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

interface Guardian {
  name: string;
  address: string;
}

interface GuardiansState {
  guardians: Guardian[];
}

const initialState: GuardiansState = {
  guardians: [],
};

const guardiansSlice = createSlice({
  name: "guardians",
  initialState,
  reducers: {
    addGuardian: (state, action: PayloadAction<Guardian>) => {
      state.guardians.push(action.payload);
    },
  },
});

export const selectGuardians = (state: RootState) => state.guardians.guardians;

export const { addGuardian } = guardiansSlice.actions;

export default guardiansSlice.reducer;
