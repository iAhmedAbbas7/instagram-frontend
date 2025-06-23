// <= IMPORTS =>
import { createSlice } from "@reduxjs/toolkit";

// <= SLICE =>
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chatUser: null,
    onlineUsers: [],
    messages: [],
  },
  reducers: {
    setChatUser: (state, action) => {
      state.chatUser = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
  },
});

// <= EXPORTING SLICE ACTIONS =>
export const { setChatUser, setOnlineUsers, setMessages } = chatSlice.actions;

// <= EXPORTING CHAT SLICE =>
export default chatSlice.reducer;
