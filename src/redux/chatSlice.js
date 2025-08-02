// <= IMPORTS =>
import { createSlice } from "@reduxjs/toolkit";

// <= SLICE =>
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chatUser: null,
    onlineUsers: [],
    typingStatus: {},
    currentConversation: null,
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
    setTypingStatus: (state, action) => {
      const { chatId: conversationId, user, isTyping, userId } = action.payload;
      if (!state.typingStatus[conversationId]) {
        state.typingStatus[conversationId] = {};
      }
      state.typingStatus[conversationId][userId] = {
        isTyping,
        user: user ?? state.typingStatus[conversationId][userId]?.user,
      };
    },
  },
});

// <= EXPORTING SLICE ACTIONS =>
export const {
  setCurrentConversation,
  setChatUser,
  setOnlineUsers,
  setTypingStatus,
} = chatSlice.actions;

// <= EXPORTING CHAT SLICE =>
export default chatSlice.reducer;
