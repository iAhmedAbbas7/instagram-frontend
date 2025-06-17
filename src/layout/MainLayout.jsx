// <= IMPORTS =>
import { Outlet } from "react-router-dom";
import LeftSidebar from "@/components/shared/LeftSidebar";
import LeftSidebarSmall from "@/components/shared/LeftSidebarSmall";

const MainLayout = () => {
  return (
    <>
      <div className="bg-gray-50">
        <LeftSidebar />
        <LeftSidebarSmall />
      </div>
      <Outlet />
    </>
  );
};

export default MainLayout;
