// <= IMPORTS =>
import { Outlet } from "react-router-dom";
import LeftSidebar from "@/components/shared/LeftSidebar";

const MainLayout = () => {
  return (
    <>
      <>
        <LeftSidebar />
      </>
      <Outlet />
    </>
  );
};

export default MainLayout;
