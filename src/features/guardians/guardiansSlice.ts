import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { RootState } from "../../store";

interface Guardian {
  name: string;
  address: string;
  ensName?: string;
  id: string;
}

const guardiansAdapter = createEntityAdapter<Guardian>();

const guardiansSlice = createSlice({
  name: "guardians",
  initialState: guardiansAdapter.getInitialState({
    isLaserGuardianEnabled: false,
  }),
  reducers: {
    addGuardian: guardiansAdapter.addOne,
    updateGuardian: guardiansAdapter.updateOne,
    removeGuardian: guardiansAdapter.removeOne,
    setIsLaserGuardianEnabled: (state, action: PayloadAction<boolean>) => {
      state.isLaserGuardianEnabled = action.payload;
    },
  },
});

const guardiansSelectors = guardiansAdapter.getSelectors<RootState>(
  (state) => state.guardians
);

export const selectGuardians = guardiansSelectors.selectAll;
export const selectIsLaserGuardianEnabled = (state: RootState) =>
  state.guardians.isLaserGuardianEnabled;

export const {
  addGuardian,
  removeGuardian,
  updateGuardian,
  setIsLaserGuardianEnabled,
} = guardiansSlice.actions;

export default guardiansSlice.reducer;
