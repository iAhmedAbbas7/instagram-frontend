// <= IMPORTS =>
import useTitle from "@/hooks/useTitle";
import { Outlet } from "react-router-dom";
import Feed from "@/components/user/Feed";
import RightSidebar from "@/components/shared/RightSidebar";

const Home = () => {
  // USE TITLE HOOK
  useTitle("Instagram - Home");
  return (
    <div className="flex max-[768px]:pt-0 py-6">
      <div className="flex grow">
        <Feed />
        <Outlet />
      </div>
      <RightSidebar />
    </div>
  );
};

export default Home;
