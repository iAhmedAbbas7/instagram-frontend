// <= IMPORTS =>
import RightSidebar from "@/components/shared/RightSidebar";
import Feed from "@/components/user/Feed";
import useTitle from "@/hooks/useTitle";
import { Outlet } from "react-router-dom";

const Home = () => {
  // USE TITLE HOOK
  useTitle("Instagram - Home");
  return (
    <div className="flex py-6 px-3">
      <div className="flex grow">
        <Feed />
        <Outlet />
      </div>
      <RightSidebar />
    </div>
  );
};

export default Home;
