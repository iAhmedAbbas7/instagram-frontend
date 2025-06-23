// <= IMPORTS =>
import { toast } from "sonner";
import { io } from "socket.io-client";
import { useEffect, useRef } from "react";
import axiosClient from "@/utils/axiosClient";
import { MessageCircleMore } from "lucide-react";
import { useSocketRef } from "@/context/SocketContext";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setChatUser, setMessages, setOnlineUsers } from "@/redux/chatSlice";
import {
  setSuggestedUsers,
  updateSuggestedUserLastActive,
} from "@/redux/authSlice";

const SocketListener = () => {
  // CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // GETTING MESSAGES FROM THE CHAT SLICE
  const { messages } = useSelector((store) => store.chat);
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
      // CURRENT USER
      const isLoggedInUser = user?._id;
      // MESSAGE SENDER
      const messageSender = populatedMessage?.senderId?._id;
      // DISPATCHING THE NEW MESSAGE IN THE MESSAGES ONLY WHEN THE USER IS CURRENTLY IN CHAT
      if (isOnMessagesPage) {
        dispatch(setMessages([...messages, populatedMessage]));
      }
      // EMITTING TOAST NOTIFICATION IF USER IS NOT ON THE CHAT PAGE
      if (!isOnMessagesPage && !isLoggedInUser !== messageSender) {
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
    // CLEANUP FUNCTION
    return () => {
      // CLOSING THE SOCKET CONNECTION
      socketRef.current.close();
      // CLOSING THE SOCKET NEW MESSAGE LISTENER
      socketRef.current.off("newMessage");
    };
  }, [user, socketRef, messages, dispatch, navigate, isOnMessagesPage]);
};

export default SocketListener;
