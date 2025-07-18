// <= IMPORTS =>
import { toast } from "sonner";
import { io } from "socket.io-client";
import { useEffect, useRef } from "react";
import { FaRegHeart } from "react-icons/fa6";
import axiosClient from "@/utils/axiosClient";
import { useSocketRef } from "@/context/SocketContext";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { setPosts, setSinglePost } from "@/redux/postSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { setChatUser, setOnlineUsers } from "@/redux/chatSlice";
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
  // GETTING POSTS & SINGLE POST FROM POST SLICE
  const { posts, singlePost } = useSelector((store) => store.post);
  // GETTING CHAT USER & CURRENT CONVERSATION FROM THE CHAT SLICE
  const { chatUser, currentConversation } = useSelector((store) => store.chat);
  // CURRENT USER ,CURRENT USER & SUGGESTED USERS PROFILE CREDENTIALS
  const { user, userProfile, suggestedUsers } = useSelector(
    (store) => store.auth
  );
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
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // POSTS REF
  const postsRef = useRef(posts);
  // CHAT USER REF
  const chatUserRef = useRef(chatUser);
  // SINGLE POST REF
  const singlePostRef = useRef(singlePost);
  // USER PROFILE REF
  const userProfileRef = useRef(userProfile);
  // CURRENT CONVERSATION REF
  const chatRef = useRef(currentConversation);
  // SUGGESTED USERS REF
  const suggestedUsersRef = useRef(suggestedUsers);
  // DISPATCH REF
  const dispatchRef = useRef(dispatch);
  // NAVIGATION REF
  const navigationRef = useRef(navigate);
  // CURRENT USER ID REF
  const currentUserIdRef = useRef(user?._id);
  // QUERY CLIENT REF
  const queryClientRef = useRef(queryClient);
  // MESSAGE PAGE REF
  const isOnMessagesPageRef = useRef(
    location.pathname.startsWith("/home/chat")
  );
  // SYNCING THE DISPATCH IN THE REF
  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);
  // SYNCING THE NAVIGATE IN THE REF
  useEffect(() => {
    navigationRef.current = navigate;
  }, [navigate]);
  // SYNCING THE QUERY CLIENT IN THE REF
  useEffect(() => {
    queryClientRef.current = queryClient;
  }, [queryClient]);
  // SYNCING THE CURRENT USER ID IN THE REF
  useEffect(() => {
    currentUserIdRef.current = user?._id;
  }, [user]);
  // SYNCING THE MESSAGE ROUTE LOCATION IN THE REF
  useEffect(() => {
    isOnMessagesPageRef.current = location.pathname.startsWith("/home/chat");
  }, [location.pathname]);
  // SYNCING THE LATEST SUGGESTED USERS IN THE REF
  useEffect(() => {
    suggestedUsersRef.current = suggestedUsers;
  }, [suggestedUsers]);
  // SYNCING THE LATEST POSTS IN THE REF
  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);
  // SYNCING THE LATEST CHAT USER IN THE REF
  useEffect(() => {
    chatUserRef.current = chatUser;
  }, [chatUser]);
  // SYNCING THE LATEST SINGLE POST IN THE REF
  useEffect(() => {
    singlePostRef.current = singlePost;
  }, [singlePost]);
  // SYNCING THE LATEST USER PROFILE IN THE REF
  useEffect(() => {
    userProfileRef.current = userProfile;
  }, [userProfile]);
  // SYNCING THE LATEST CURRENT CONVERSATION IN THE REF
  useEffect(() => {
    chatRef.current = currentConversation;
  }, [currentConversation]);
  // INITIALIZING SOCKET CONNECTION FOR CLIENT SIDE
  useEffect(() => {
    // IF USER DOES NOT EXISTS, THEN RETURNING
    if (!user || !socketRef.current) return;
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
            dispatchRef.current(
              updateSuggestedUserLastActive({ userId, lastActive: now })
            )
          );
        }
      }
      // UPDATING THE ONLINE USERS REF
      onlineUsersRef.current = onlineUsers;
      // DISPATCHING THE ONLINE USERS IN THE CHAT SLICE
      dispatchRef.current(setOnlineUsers(onlineUsers));
      // FETCHING THE LATEST SUGGESTED USER DATA
      const response = await axiosClient.get("/user/suggestedUsers");
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // DISPATCHING THE LATEST SUGGESTED USERS IN THE AUTH SLICE
        dispatchRef.current(setSuggestedUsers(response.data.users));
      }
    });
    // LISTENING FOR NEW CHAT MESSAGE SOCKET EVENT
    socketRef.current.on("newMessage", (populatedMessage) => {
      // MESSAGE SENDER
      const messageSender = populatedMessage?.senderId?._id;
      // DISPATCHING THE NEW MESSAGE IN THE MESSAGES ONLY WHEN THE USER IS CURRENTLY IN CHAT
      if (
        isOnMessagesPageRef.current ||
        chatUserRef.current ||
        chatRef.current
      ) {
        queryClientRef.current.setQueryData(
          ["messages", chatRef.current?._id || chatUserRef.current?._id],
          (old) => {
            if (!old) return old;
            const newPages = old.pages.map((page, idx) =>
              idx === 0
                ? {
                    ...page,
                    messages: [populatedMessage, ...page.messages],
                  }
                : page
            );
            return { ...old, pages: newPages };
          }
        );
      }
      // EMITTING TOAST NOTIFICATION IF USER IS NOT ON THE CHAT PAGE
      if (
        !isOnMessagesPageRef.current &&
        currentUserIdRef.current !== messageSender &&
        !chatUserRef.current &&
        !chatRef.current
      ) {
        toast(`New Message from ${populatedMessage?.senderId?.fullName}`, {
          icon: <MessageCircleMore />,
          action: {
            label: "View",
            onClick: () => {
              // NAVIGATING TO THE CHAT PAGE
              navigationRef.current("/home/chat");
              // DISPATCHING CHAT USER IN THE CHAT SLICE
              dispatchRef.current(setChatUser(populatedMessage?.senderId));
            },
          },
        });
      }
    });
    // LISTENING FOR LIKE OR UNLIKE POST SOCKET EVENT
    socketRef.current.on("notification", (notification) => {
      // INCREMENTING OR DECREMENTING THE POST LIKES COUNT BASED ON ACTION TYPE
      if (currentUserIdRef.current !== notification?.likingUser?._id) {
        // UPDATING THE GLOBAL FEED POSTS
        const updatedPosts = postsRef.current?.map((p) =>
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
        dispatchRef.current(setPosts(updatedPosts));
        // IF USER PROFILE EXISTS
        if (userProfileRef.current !== null) {
          // UPDATING THE USER PROFILE POSTS
          const updatedUserPosts = userProfileRef.current?.posts.map((p) =>
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
          dispatchRef.current(
            setUserProfile({
              ...userProfileRef.current,
              posts: updatedUserPosts,
            })
          );
        }
        // UPDATING THE SINGLE POST LIKES
        if (notification?.postId === singlePostRef.current._id) {
          dispatchRef.current(
            setSinglePost({
              ...singlePostRef.current,
              likes:
                notification?.type === "like"
                  ? [...singlePostRef.current.likes, notification?.userId]
                  : singlePostRef.current.likes.filter(
                      (id) => id !== notification?.userId
                    ),
            })
          );
        }
      }
      // DISPATCHING NOTIFICATIONS FOR THE POST OWNER
      if (notification.postAuthorId === currentUserIdRef.current) {
        // DISPATCHING THE NOTIFICATION IN NOTIFICATION SLICE
        dispatchRef.current(setLikeNotifications(notification));
      }
      // TOASTING LIVE NOTIFICATION TO THE POST OWNER ON LIKE EVENT
      if (
        notification?.type === "like" &&
        notification?.postAuthorId === currentUserIdRef.current
      ) {
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
      if (currentUserIdRef.current !== notification?.commentingUser?._id) {
        // UPDATING THE GLOBAL FEED POSTS
        const updatedPosts = postsRef.current?.map((p) =>
          p?._id === notification?.postId
            ? { ...p, comments: [comment, ...p.comments] }
            : p
        );
        // DISPATCHING THE UPDATED POSTS
        dispatchRef.current(setPosts(updatedPosts));
        // IF USER PROFILE EXISTS
        if (userProfileRef.current !== null) {
          // UPDATING THE USER PROFILE POSTS
          const updatedUserPosts = userProfileRef.current?.posts.map((p) =>
            p?._id === notification?.postId
              ? { ...p, comments: [comment, ...p.comments] }
              : p
          );
          // DISPATCHING THE UPDATED USER PROFILE POSTS
          dispatchRef.current(
            setUserProfile({
              ...userProfileRef.current,
              posts: updatedUserPosts,
            })
          );
        }
        // UPDATING THE SINGLE POST COMMENTS
        queryClientRef.current.setQueryData(
          ["comments", notification?.postId],
          (old) => {
            if (!old) return old;
            const newPages = old.pages.map((page, idx) =>
              idx === 0
                ? {
                    ...page,
                    comments: [comment, ...page.comments],
                    totalComments: page.totalComments + 1,
                  }
                : page
            );
            return { ...old, pages: newPages };
          }
        );
      }
      // DISPATCHING NOTIFICATIONS FOR THE POST OWNER
      if (
        notification.postAuthorId === currentUserIdRef.current &&
        notification?.commentingUser?._id !== currentUserIdRef.current
      ) {
        // DISPATCHING THE NOTIFICATION IN THE NOTIFICATION SLICE
        dispatchRef.current(setCommentNotifications(notification));
      }
      // TOASTING & DISPATCHING NOTIFICATION TO THE POST OWNER ON COMMENT EVENT
      if (
        notification?.postAuthorId === currentUserIdRef.current &&
        notification?.commentingUser?._id !== currentUserIdRef.current
      ) {
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
      if (currentUserIdRef.current === followedUserId) {
        // CREATING NEW FOLLOWERS OBJECT
        const newFollowers =
          type === "follow"
            ? [followingUserId, ...user.followers]
            : user?.followers?.filter((id) => id !== followingUserId);
        // DISPATCHING THE UPDATED USER IN THE AUTH SLICE
        dispatchRef.current(setUser({ ...user, followers: newFollowers }));
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
          dispatchRef.current(setSuggestedUsers(updatedSuggestedUsers));
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
        dispatchRef.current(setFollowNotifications(notification));
      }
    });
    // LISTENING FOR NEW CONVERSATION SOCKET EVENT
    socketRef.current.on("newConversation", () => {
      // INVALIDATING THE CONVERSATIONS LIST TO FETCH THE LATEST CHATS
      queryClientRef.current.invalidateQueries(["conversations"]);
    });
    // CLEANUP FUNCTION
    return () => {
      // CLOSING THE SOCKET CONNECTION
      socketRef.current.close();
      // CLOSING THE SOCKET NEW MESSAGE LISTENER
      socketRef.current.off();
    };
  }, [user, socketRef]);

  // RETURNING NULL
  return null;
};

export default SocketListener;
