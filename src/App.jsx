// <= IMPORTS =>
import Main from "./pages/Main";
import Home from "./pages/Home";
import Login from "./components/auth/Login";
import MainLayout from "./layout/MainLayout";
import SignUp from "./components/auth/SignUp";
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
  children: [{ index: true, element: <Home /> }],
};

// <= APP ROUTING =>
const appRouter = createBrowserRouter([...publicRoutes, privateRoutes]);

const App = () => {
  return (
    <>
      <RouterProvider router={appRouter} />
    </>
  );
};

export default App;
