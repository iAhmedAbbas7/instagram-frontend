// <= IMPORTS =>
import { createSlice } from "@reduxjs/toolkit";

// <= SLICE =>
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    userProfile: null,
    suggestedUsers: [],
    expired: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.expired = false;
    },
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },
    setSuggestedUsers: (state, action) => {
      state.suggestedUsers = action.payload;
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
export const {
  setUser,
  setUserProfile,
  setSuggestedUsers,
  sessionExpired,
  clearAuthState,
} = authSlice.actions;

// <= EXPORTING AUTH SLICE =>
export default authSlice.reducer;
