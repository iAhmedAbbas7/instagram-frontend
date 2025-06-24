// <= IMPORTS =>
import { createSlice } from "@reduxjs/toolkit";

// <= SLICE =>
const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    likeNotifications: [],
    commentNotifications: [],
  },
  reducers: {
    setLikeNotifications: (state, action) => {
      // IF ACTION IS LIKE
      if (action.payload.type === "like") {
        state.likeNotifications.push(action.payload);
      } // IF ACTION IS DISLIKED
      else if (action.payload.type === "dislike") {
        state.likeNotifications = state.likeNotifications.filter(
          (notif) => notif.userId !== action.payload.userId
        );
      }
    },
    setCommentNotifications: (state, action) => {
      state.commentNotifications = action.payload;
    },
  },
});

// <= EXPORTING SLICE ACTIONS =>
export const { setLikeNotifications, setCommentNotifications } =
  notificationSlice.actions;

// <= EXPORTING CHAT SLICE =>
export default notificationSlice.reducer;
