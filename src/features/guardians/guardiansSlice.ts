import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import Constants from "expo-constants";
interface Guardian {
  name: string;
  address: string;
  ensName?: string;
}

interface GuardiansState {
  guardians: Guardian[];
}

const initialState: GuardiansState = {
  guardians: [
    {
      name: "Laser Guardian",
      address: Constants.manifest?.extra?.laserGuardianAddress,
    },
  ],
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
