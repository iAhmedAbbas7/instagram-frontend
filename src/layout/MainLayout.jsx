// <= IMPORTS =>
import { Outlet } from "react-router-dom";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import ChatBubble from "@/components/chat/ChatBubble";
import LeftSidebar from "@/components/shared/LeftSidebar";
import LeftSidebarSmall from "@/components/shared/LeftSidebarSmall";

const MainLayout = () => {
  return (
    <>
      <div className="bg-gray-50 relative">
        <Header />
        <LeftSidebar />
        <LeftSidebarSmall />
        <ChatBubble />
        <Footer />
      </div>
      <Outlet />
    </>
  );
};

export default MainLayout;
