// <= IMPORTS =>
import { Outlet } from "react-router-dom";
import LeftSidebar from "@/components/shared/LeftSidebar";

const MainLayout = () => {
  return (
    <>
      <div>
        <LeftSidebar />
      </div>
      <Outlet />
    </>
  );
};

export default MainLayout;
