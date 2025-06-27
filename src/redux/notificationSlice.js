// <= IMPORTS =>
import { createSlice } from "@reduxjs/toolkit";

// <= SLICE =>
const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    likeNotifications: [],
    commentNotifications: [],
    followNotifications: [],
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
      state.commentNotifications.push(action.payload);
    },
    setFollowNotifications: (state, action) => {
      // IF ACTION IS FOLLOW
      if (action.payload.type === "follow") {
        // PREVENTING DUPLICATES
        const exists = state.followNotifications.some(
          (notif) =>
            notif.followingUserId === action.payload.followingUserId &&
            notif.followedUserId === action.payload.followedUserId
        );
        // IF THE NOTIFICATIONS DOES NOT EXISTS ALREADY
        if (!exists) {
          state.followNotifications.push(action.payload);
        }
      } // IF ACTION IS UNFOLLOW
      else if (action.payload.type === "unfollow") {
        state.followNotifications = state.followNotifications.filter(
          (notif) =>
            !(
              notif.followingUserId !== action.payload.followingUserId &&
              notif.followedUserId !== action.payload.followedUserId
            )
        );
      }
    },
  },
});

// <= EXPORTING SLICE ACTIONS =>
export const {
  setLikeNotifications,
  setCommentNotifications,
  setFollowNotifications,
} = notificationSlice.actions;

// <= EXPORTING CHAT SLICE =>
export default notificationSlice.reducer;
