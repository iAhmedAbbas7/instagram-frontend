// <= IMPORTS =>
import { createSlice } from "@reduxjs/toolkit";

// <= SLICE =>
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearAuthState: (state) => {
      state.user = null;
    },
  },
});

// <= EXPORTING SLICE ACTIONS =>
export const { setUser, clearAuthState } = authSlice.actions;

// <= EXPORTING AUTH SLICE =>
export default authSlice.reducer;
