// <= IMPORTS =>
import { createSlice } from "@reduxjs/toolkit";

// <= SLICE =>
const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    likeNotifications: [],
    commentNotifications: [],
    followNotifications: [],
    hasUnread: false,
  },
  reducers: {
    setLikeNotifications: (state, action) => {
      // IF ACTION IS LIKE
      if (action.payload.type === "like") {
        state.likeNotifications.push(action.payload);
        state.hasUnread = true;
      } // IF ACTION IS DISLIKED
      else if (action.payload.type === "dislike") {
        state.likeNotifications = state.likeNotifications.filter(
          (notif) => notif.userId !== action.payload.userId
        );
        state.hasUnread =
          state.likeNotifications.length +
            state.commentNotifications.length +
            state.followNotifications.length >
          0;
      }
    },
    setCommentNotifications: (state, action) => {
      state.commentNotifications.push(action.payload);
      state.hasUnread = true;
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
          state.hasUnread = true;
        }
      } // IF ACTION IS UNFOLLOW
      else if (action.payload.type === "unfollow") {
        state.followNotifications = state.followNotifications.filter(
          (notif) =>
            !(
              notif.followingUserId === action.payload.followingUserId &&
              notif.followedUserId === action.payload.followedUserId
            )
        );
        state.hasUnread =
          state.likeNotifications.length +
            state.commentNotifications.length +
            state.followNotifications.length >
          0;
      }
    },
    markAllAsRead: (state) => {
      state.hasUnread = false;
    },
    removeNotification: (state, action) => {
      // GETTING CATEGORY & NOTIFICATION FROM PAYLOAD
      const { category, createdAt } = action.payload;
      // MAKING A CASE SWITCH BASED ON CATEGORY
      switch (category) {
        case "like":
          state.likeNotifications = state.likeNotifications.filter(
            (n) => n.createdAt !== createdAt
          );
          break;
        case "comment":
          state.commentNotifications = state.commentNotifications.filter(
            (n) => n.createdAt !== createdAt
          );
          break;
        case "follow":
          state.followNotifications = state.followNotifications.filter(
            (n) => n.createdAt !== createdAt
          );
          break;
        default:
          break;
      }
      state.hasUnread =
        state.likeNotifications.length +
          state.commentNotifications.length +
          state.followNotifications.length >
        0;
    },
    clearAllNotifications: (state) => {
      state.likeNotifications = [];
      state.commentNotifications = [];
      state.followNotifications = [];
      state.hasUnread = true;
    },
  },
});

// <= EXPORTING SLICE ACTIONS =>
export const {
  setLikeNotifications,
  setCommentNotifications,
  setFollowNotifications,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
} = notificationSlice.actions;

// <= EXPORTING CHAT SLICE =>
export default notificationSlice.reducer;
