// <= IMPORTS =>
import { Outlet } from "react-router-dom";
import LeftSidebar from "@/components/shared/LeftSidebar";

const MainLayout = () => {
  return (
    <>
      <div className="bg-gray-50">
        <LeftSidebar />
      </div>
      <Outlet />
    </>
  );
};

export default MainLayout;
