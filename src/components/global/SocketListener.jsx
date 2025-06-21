// <= IMPORTS =>
import { io } from "socket.io-client";
import { useEffect, useRef } from "react";
import axiosClient from "@/utils/axiosClient";
import { useDispatch, useSelector } from "react-redux";
import { setOnlineUsers, setSocket } from "@/redux/chatSlice";
import {
  setSuggestedUsers,
  updateSuggestedUserLastActive,
} from "@/redux/authSlice";

const SocketListener = () => {
  // CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // DISPATCH
  const dispatch = useDispatch();
  // REF FOR ONLINE USERS
  const onlineUsersRef = useRef([]);
  // INITIALIZING SOCKET CONNECTION FOR CLIENT SIDE
  useEffect(() => {
    // IF USER DOES NOT EXISTS, THEN RETURNING
    if (!user) return;
    // SERVER URL
    const serverURL = "http://localhost:8080";
    // INITIATING SOCKET
    const socket = io(serverURL, {
      query: {
        userId: user?._id,
      },
      transports: ["websocket"],
    });
    // DISPATCHING SOCKET IN THE CHAT SLICE
    dispatch(setSocket(socket));
    // LISTENING FOR SERVER SOCKET EVENTS
    socket.on("getOnlineUsers", async (onlineUsers) => {
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
    // CLEANUP FUNCTION
    return () => {
      // CLOSING THE SOCKET CONNECTION
      socket.close();
      // DISPATCHING THE SOCKET AS NULL IN CHAT SLICE
      dispatch(setSocket(null));
    };
  }, [user, dispatch]);
};

export default SocketListener;
