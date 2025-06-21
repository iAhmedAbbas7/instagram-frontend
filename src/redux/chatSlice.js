// <= IMPORTS =>
import { createSlice } from "@reduxjs/toolkit";

// <= SLICE =>
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    socket: null,
    chatUser: null,
    onlineUsers: [],
  },
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setChatUser: (state, action) => {
      state.chatUser = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
  },
});

// <= EXPORTING SLICE ACTIONS =>
export const { setSocket, setChatUser, setOnlineUsers } = chatSlice.actions;

// <= EXPORTING CHAT SLICE =>
export default chatSlice.reducer;
