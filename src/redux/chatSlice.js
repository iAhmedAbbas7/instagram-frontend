// <= IMPORTS =>
import { createSlice } from "@reduxjs/toolkit";

// <= SLICE =>
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    currentConversation: null,
    chatUser: null,
    onlineUsers: [],
  },
  reducers: {
    setCurrentConversation: (state, action) => {
      console.log("setCurrentConversation called", action.payload);
      state.currentConversation = action.payload;
    },
    setChatUser: (state, action) => {
      console.log("setChatUser called", action.payload);
      state.chatUser = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
  },
});

// <= EXPORTING SLICE ACTIONS =>
export const { setCurrentConversation, setChatUser, setOnlineUsers } =
  chatSlice.actions;

// <= EXPORTING CHAT SLICE =>
export default chatSlice.reducer;
