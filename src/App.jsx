// <= IMPORTS =>
import Main from "./pages/Main";
import Login from "./components/auth/Login";
import SignUp from "./components/auth/SignUp";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// <= APP ROUTING =>
const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/login",
    element: <Login />,
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
