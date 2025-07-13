// <= IMPORTS =>
import { createSlice } from "@reduxjs/toolkit";

// <= SLICE =>
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    currentConversation: null,
    chatUser: null,
    onlineUsers: [],
    messages: [],
  },
  reducers: {
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
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
export const {
  setCurrentConversation,
  setChatUser,
  setOnlineUsers,
  setMessages,
} = chatSlice.actions;

// <= EXPORTING CHAT SLICE =>
export default chatSlice.reducer;
