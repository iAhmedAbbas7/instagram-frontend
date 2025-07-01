// <= IMPORTS =>
import Main from "./pages/Main";
import Home from "./pages/Home";
import Login from "./components/auth/Login";
import MainLayout from "./layout/MainLayout";
import RootLayout from "./layout/RootLayout";
import SignUp from "./components/auth/SignUp";
import Profile from "./components/user/Profile";
import ChatPage from "./components/chat/ChatPage";
import EditPost from "./components/user/EditPost";
import PostPage from "./components/user/PostPage";
import EditProfile from "./components/user/EditProfile";
import ProtectedRoute from "./components/global/ProtectedRoute";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// <= PUBLIC ROUTES =>
const publicRoutes = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Main />
      </ProtectedRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <ProtectedRoute>
        <SignUp />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <ProtectedRoute>
        <Login />
      </ProtectedRoute>
    ),
  },
];

// <= PRIVATE ROUTES =>
const privateRoutes = {
  path: "/home",
  element: (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      index: true,
      element: (
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      ),
    },
    {
      path: "profile/:id",
      element: (
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      ),
    },
    {
      path: "account/edit",
      element: (
        <ProtectedRoute>
          <EditProfile />
        </ProtectedRoute>
      ),
    },
    {
      path: "chat",
      element: (
        <ProtectedRoute>
          <ChatPage />
        </ProtectedRoute>
      ),
    },
    {
      path: "post/:id/edit",
      element: (
        <ProtectedRoute>
          <EditPost />
        </ProtectedRoute>
      ),
    },
    {
      path: "post/:id",
      element: (
        <ProtectedRoute>
          <PostPage />
        </ProtectedRoute>
      ),
    },
  ],
};

// <= APP ROUTING =>
const appRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [...publicRoutes, privateRoutes],
  },
]);

const App = () => {
  return (
    <>
      <RouterProvider router={appRouter} />
    </>
  );
};

export default App;
