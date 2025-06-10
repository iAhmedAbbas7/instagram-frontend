// <= IMPORTS =>
import { createSlice } from "@reduxjs/toolkit";

// <= SLICE =>
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    expired: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.expired = false;
    },
    sessionExpired: (state) => {
      state.expired = true;
    },
    clearAuthState: (state) => {
      state.user = null;
      state.expired = false;
    },
  },
});

// <= EXPORTING SLICE ACTIONS =>
export const { setUser, sessionExpired, clearAuthState } = authSlice.actions;

// <= EXPORTING AUTH SLICE =>
export default authSlice.reducer;
