// <= IMPORTS =>
import { Outlet } from "react-router-dom";
import SocketListener from "@/components/global/SocketListener";
import SessionExpiryWatcher from "@/components/global/SessionExpiryWatcher";
import NetworkStatusWatcher from "@/components/global/NetworkStatusWatcher";

const RootLayout = () => {
  return (
    <>
      <SocketListener />
      <NetworkStatusWatcher />
      <SessionExpiryWatcher />
      <Outlet />
    </>
  );
};

export default RootLayout;
