// <= IMPORTS =>
import useTitle from "@/hooks/useTitle";
import { Outlet } from "react-router-dom";
import Feed from "@/components/user/Feed";
import RightSidebar from "@/components/shared/RightSidebar";

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
