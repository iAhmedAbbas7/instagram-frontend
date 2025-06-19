// <= IMPORTS =>
import { createSlice } from "@reduxjs/toolkit";

// <= SLICE =>
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chatUser: null,
  },
  reducers: {
    setChatUser: (state, action) => {
      state.chatUser = action.payload;
    },
  },
});

// <= EXPORTING SLICE ACTIONS =>
export const { setChatUser } = chatSlice.actions;

// <= EXPORTING CHAT SLICE =>
export default chatSlice.reducer;
