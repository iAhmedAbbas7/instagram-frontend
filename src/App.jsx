// <= IMPORTS =>
import Main from "./pages/Main";
import Home from "./pages/Home";
import { useEffect } from "react";
import { io } from "socket.io-client";
import Login from "./components/auth/Login";
import MainLayout from "./layout/MainLayout";
import RootLayout from "./layout/RootLayout";
import SignUp from "./components/auth/SignUp";
import Profile from "./components/user/Profile";
import ChatPage from "./components/chat/ChatPage";
import { useDispatch, useSelector } from "react-redux";
import EditProfile from "./components/user/EditProfile";
import { setOnlineUsers, setSocket } from "./redux/chatSlice";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// <= PUBLIC ROUTES =>
const publicRoutes = [
  { path: "/", element: <Main /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/login", element: <Login /> },
];

// <= PRIVATE ROUTES =>
const privateRoutes = {
  path: "/home",
  element: <MainLayout />,
  children: [
    { index: true, element: <Home /> },
    { path: "profile/:id", element: <Profile /> },
    { path: "account/edit", element: <EditProfile /> },
    { path: "chat", element: <ChatPage /> },
  ],
};

// <= APP ROUTING =>
const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [...publicRoutes, privateRoutes],
  },
]);

const App = () => {
  // DISPATCH
  const dispatch = useDispatch();
  // CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // INITIALING SOCKET CONNECTION FOR CLIENT SIDE
  useEffect(() => {
    // SERVER URL
    const serverURL = "http://localhost:8080";
    // INITIATING SOCKET
    const socket = io(serverURL, {
      query: {
        userId: user?._id,
      },
      transports: ["websocket"],
    });
    // IF USER EXISTS
    if (user) {
      // DISPATCHING SOCKET IN THE CHAT SLICE
      dispatch(setSocket(socket));
      // LISTENING FOR SERVER SOCKET EVENTS
      socket.on("getOnlineUsers", (onlineUsers) => {
        // DISPATCHING THE ONLINE USERS IN THE CHAT SLICE
        dispatch(setOnlineUsers(onlineUsers));
      });
      // CLEANUP FUNCTION
      return () => {
        // CLOSING THE SOCKET CONNECTION
        socket.close();
        // DISPATCHING THE SOCKET AS NULL IN CHAT SLICE
        dispatch(setSocket(null));
      };
    } else {
      // CLOSING THE SOCKET CONNECTION
      socket.close();
      // DISPATCHING THE SOCKET AS NULL IN CHAT SLICE
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);
  return (
    <>
      <RouterProvider router={appRouter} />
    </>
  );
};

export default App;
