// <= IMPORTS =>
import { toast } from "sonner";
import { io } from "socket.io-client";
import { useEffect, useRef } from "react";
import { setPosts } from "@/redux/postSlice";
import { FaRegHeart } from "react-icons/fa6";
import axiosClient from "@/utils/axiosClient";
import { useSocketRef } from "@/context/SocketContext";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setChatUser, setMessages, setOnlineUsers } from "@/redux/chatSlice";
import { MessageCircleMore, MessageSquareMore, UserPlus2 } from "lucide-react";
import {
  setSuggestedUsers,
  setUser,
  setUserProfile,
  updateSuggestedUserLastActive,
} from "@/redux/authSlice";
import {
  setCommentNotifications,
  setFollowNotifications,
  setLikeNotifications,
} from "@/redux/notificationSlice";

const SocketListener = () => {
  // CURRENT USER ,CURRENT USER & SUGGESTED USERS PROFILE CREDENTIALS
  const { user, userProfile, suggestedUsers } = useSelector(
    (store) => store.auth
  );
  // GETTING MESSAGES FROM THE CHAT SLICE
  const { messages } = useSelector((store) => store.chat);
  // GETTING POSTS FROM POST SLICE
  const { posts } = useSelector((store) => store.post);
  // DISPATCH
  const dispatch = useDispatch();
  // LOCATION
  const location = useLocation();
  // NAVIGATION
  const navigate = useNavigate();
  // REF FOR ONLINE USERS
  const onlineUsersRef = useRef([]);
  // SOCKET REF
  const socketRef = useSocketRef();
  // MESSAGES ROUTE PATH
  const isOnMessagesPage = location.pathname.startsWith("/home/chat");
  // SETTING CURRENT USER ID
  const currentUserId = user?._id;
  // KEEPING A REFERENCE OF THE SUGGESTED USERS IN THE REF
  const suggestedUsersRef = useRef(suggestedUsers);
  // SYNCING THE LATEST SUGGESTED USERS IN THE REF
  useEffect(() => {
    suggestedUsersRef.current = suggestedUsers;
  }, [suggestedUsers]);
  // INITIALIZING SOCKET CONNECTION FOR CLIENT SIDE
  useEffect(() => {
    // IF USER DOES NOT EXISTS, THEN RETURNING
    if (!user) return;
    // SERVER URL
    const serverURL = "http://localhost:8080";
    // INITIATING SOCKET
    socketRef.current = io(serverURL, {
      query: {
        userId: user?._id,
      },
      transports: ["websocket"],
    });
    // LISTENING FOR SERVER GET ONLINE USERS SOCKET EVENT
    socketRef.current.on("getOnlineUsers", async (onlineUsers) => {
      // IF THE ONLINE USERS HAS NO CURRENT
      if (!onlineUsersRef.current) {
        // POPULATING THE ONLINE USERS REF
        onlineUsersRef.current = onlineUsers;
      } else {
        // COMPUTING WHO WENT OFFLINE
        const wentOffline = onlineUsersRef.current.filter(
          (id) => !onlineUsers.includes(id)
        );
        // IF SOMEONE HAS GONE OFFLINE
        if (wentOffline.length) {
          // CURRENT TIMESTAMP
          const now = new Date().toISOString();
          // UPDATING THE LAST ACTIVE TIME FOR THE USER
          wentOffline.forEach((userId) =>
            dispatch(updateSuggestedUserLastActive({ userId, lastActive: now }))
          );
        }
      }
      // UPDATING THE ONLINE USERS REF
      onlineUsersRef.current = onlineUsers;
      // DISPATCHING THE ONLINE USERS IN THE CHAT SLICE
      dispatch(setOnlineUsers(onlineUsers));
      // FETCHING THE LATEST SUGGESTED USER DATA
      const response = await axiosClient.get("/user/suggestedUsers");
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // DISPATCHING THE LATEST SUGGESTED USERS IN THE AUTH SLICE
        dispatch(setSuggestedUsers(response.data.users));
      }
    });
    // LISTENING FOR NEW CHAT MESSAGE SOCKET EVENT
    socketRef.current.on("newMessage", (populatedMessage) => {
      // MESSAGE SENDER
      const messageSender = populatedMessage?.senderId?._id;
      // DISPATCHING THE NEW MESSAGE IN THE MESSAGES ONLY WHEN THE USER IS CURRENTLY IN CHAT
      if (isOnMessagesPage) {
        dispatch(setMessages([...messages, populatedMessage]));
      }
      // EMITTING TOAST NOTIFICATION IF USER IS NOT ON THE CHAT PAGE
      if (!isOnMessagesPage && !currentUserId !== messageSender) {
        toast(`New Message from ${populatedMessage?.senderId?.fullName}`, {
          icon: <MessageCircleMore />,
          action: {
            label: "View",
            onClick: () => {
              // NAVIGATING TO THE CHAT PAGE
              navigate("/home/chat");
              // DISPATCHING CHAT USER IN THE CHAT SLICE
              dispatch(setChatUser(populatedMessage?.senderId));
            },
          },
        });
      }
    });
    // LISTENING FOR LIKE OR UNLIKE POST SOCKET EVENT
    socketRef.current.on("notification", (notification) => {
      // INCREMENTING OR DECREMENTING THE POST LIKES COUNT BASED ON ACTION TYPE
      if (currentUserId !== notification?.likingUser?._id) {
        // UPDATING THE GLOBAL FEED POSTS
        const updatedPosts = posts?.map((p) =>
          p?._id === notification?.postId
            ? {
                ...p,
                likes:
                  notification?.type === "like"
                    ? [...p.likes, notification?.userId]
                    : p.likes.filter((id) => id !== notification?.userId),
              }
            : p
        );
        // DISPATCHING THE UPDATED GLOBAL FEED POSTS
        dispatch(setPosts(updatedPosts));
        // IF USER PROFILE EXISTS
        if (userProfile !== null) {
          // UPDATING THE USER PROFILE POSTS
          const updatedUserPosts = userProfile?.posts.map((p) =>
            p?._id === notification?.postId
              ? {
                  ...p,
                  likes:
                    notification?.type === "like"
                      ? [...p.likes, notification?.userId]
                      : p.likes.filter((id) => id !== notification?.userId),
                }
              : p
          );
          // DISPATCHING THE UPDATED USER PROFILE POSTS
          dispatch(
            setUserProfile({
              ...userProfile,
              posts: updatedUserPosts,
            })
          );
        }
      }
      // TOASTING LIVE NOTIFICATION TO THE POST OWNER ON LIKE EVENT
      if (
        notification?.type === "like" &&
        notification?.postAuthorId === currentUserId
      ) {
        // DISPATCHING THE NOTIFICATION IN NOTIFICATION SLICE
        dispatch(setLikeNotifications(notification));
        toast(
          <div className="flex items-center gap-2">
            <FaRegHeart size={25} className="text-red-500" />
            <span>
              <span className="font-bold">
                {notification?.likingUser?.username}
              </span>{" "}
              Liked Your Post
            </span>
          </div>
        );
      }
    });
    // LISTENING FOR COMMENT ON POST SOCKET EVENT
    socketRef.current.on("comment", ({ notification, comment }) => {
      // ADDING COMMENT TO THE POST BASED ON WHO COMMENTED
      if (currentUserId !== notification?.commentingUser?._id) {
        // UPDATING THE GLOBAL FEED POSTS
        const updatedPosts = posts?.map((p) =>
          p?._id === notification?.postId
            ? { ...p, comments: [comment, ...p.comments] }
            : p
        );
        // DISPATCHING THE UPDATED POSTS
        dispatch(setPosts(updatedPosts));
        // IF USER PROFILE EXISTS
        if (userProfile !== null) {
          // UPDATING THE USER PROFILE POSTS
          const updatedUserPosts = userProfile?.posts.map((p) =>
            p?._id === notification?.postId
              ? { ...p, comments: [comment, ...p.comments] }
              : p
          );
          // DISPATCHING THE UPDATED USER PROFILE POSTS
          dispatch(
            setUserProfile({
              ...userProfile,
              posts: updatedUserPosts,
            })
          );
        }
      }
      // TOASTING & DISPATCHING NOTIFICATION TO THE POST OWNER ON COMMENT EVENT
      if (
        notification?.postAuthorId === currentUserId &&
        notification?.commentingUser?._id !== currentUserId
      ) {
        // DISPATCHING THE NOTIFICATION IN THE NOTIFICATION SLICE
        dispatch(setCommentNotifications(notification));
        toast(
          <div className="flex items-center gap-2">
            <MessageSquareMore size={25} className="text-red-500" />
            <span>
              <span className="font-bold">
                {notification?.commentingUser?.username}
              </span>{" "}
              Commented on Your Post
            </span>
          </div>
        );
      }
    });
    // LISTENING FOR FOLLOW OR UNFOLLOW USER SOCKET EVENT
    socketRef.current.on("followAction", (notification) => {
      // DESTRUCTURING NOTIFICATION OBJECT
      const { type, followedUserId, followingUserId } = notification;
      // UPDATING THE USER FOLLOWERS BASED ON ACTION TYPE
      if (currentUserId === followedUserId) {
        // CREATING NEW FOLLOWERS OBJECT
        const newFollowers =
          type === "follow"
            ? [followingUserId, ...user.followers]
            : user?.followers?.filter((id) => id !== followingUserId);
        // DISPATCHING THE UPDATED USER IN THE AUTH SLICE
        dispatch(setUser({ ...user, followers: newFollowers }));
        // IF THE FOLLOWING USER WAS IN SUGGESTED LIST UPDATING ITS FOLLOWING LIST
        const wasSuggestedUser = suggestedUsersRef.current.some(
          (u) => u._id === followingUserId
        );
        // IF THE FOLLOWING USER WAS SUGGESTED USER
        if (wasSuggestedUser) {
          // UPDATING THE SUGGESTED USER
          const updatedSuggestedUsers = suggestedUsersRef.current.map((u) =>
            u._id === followingUserId
              ? {
                  ...u,
                  following:
                    type === "follow"
                      ? [followedUserId, ...u.following]
                      : u.following.filter((id) => id !== followedUserId),
                }
              : u
          );
          // DISPATCHING THE UPDATED SUGGESTED USERS IN THE AUTH SLICE
          dispatch(setSuggestedUsers(updatedSuggestedUsers));
        }
        // TOASTING A LIVE NOTIFICATION TO THE FOLLOWED USER
        if (notification?.type === "follow") {
          toast(
            <div className="flex items-center gap-2">
              <UserPlus2 size={25} className="text-red-500" />
              <span>
                <span className="font-bold">
                  {notification?.followingUser?.username}
                </span>{" "}
                Started Following You
              </span>
            </div>
          );
        }
        // DISPATCHING THE NOTIFICATION IN NOTIFICATION SLICE
        dispatch(setFollowNotifications(notification));
      }
    });
    // CLEANUP FUNCTION
    return () => {
      // CLOSING THE SOCKET CONNECTION
      socketRef.current.close();
      // CLOSING THE SOCKET NEW MESSAGE LISTENER
      socketRef.current.off("newMessage");
    };
  }, [
    user,
    socketRef,
    messages,
    dispatch,
    navigate,
    isOnMessagesPage,
    posts,
    currentUserId,
    userProfile,
  ]);
};

export default SocketListener;
