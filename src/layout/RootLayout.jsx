// <= IMPORTS =>
import { Outlet } from "react-router-dom";
import SessionExpiryWatcher from "@/components/global/SessionExpiryWatcher";

const RootLayout = () => {
  return (
    <>
      <SessionExpiryWatcher />
      <Outlet />
    </>
  );
};

export default RootLayout;
