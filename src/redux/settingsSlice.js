// <= IMPORTS =>
import { createSlice } from "@reduxjs/toolkit";

// <= SLICE =>
const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    settings: {},
  },
  reducers: {
    setSettings: (state, action) => {
      state.settings = action.payload;
    },
    updateSettings: (state, action) => {
      const { section, updates } = action.payload;
      state.settings[section] = {
        ...state.settings[section],
        ...updates,
      };
    },
  },
});

// <= EXPORTING SLICE ACTIONS =>
export const { setSettings, updateSettings } = settingsSlice.actions;

// <= EXPORTING SETTINGS SLICE =>
export default settingsSlice.reducer;
