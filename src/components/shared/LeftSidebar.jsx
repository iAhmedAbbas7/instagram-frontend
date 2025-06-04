// <= IMPORTS =>
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { USER_API_ENDPOINT } from "@/utils/constants";
import INSTAGRAM from "../../assets/images/INSTAGRAM-TXT.png";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Heart,
  Home,
  List,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
} from "lucide-react";

// SIDEBAR ITEMS
const sidebarItems = [
  { icon: <Home />, label: "Home" },
  { icon: <Search />, label: "Search" },
  { icon: <TrendingUp />, label: "Explore" },
  { icon: <MessageCircle />, label: "Messages" },
  { icon: <Heart />, label: "Notifications" },
  { icon: <PlusSquare />, label: "Create" },
  {
    icon: (
      <Avatar className="w-6 h-6">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    ),
    label: "Profile",
  },
  { icon: <LogOut />, label: "Logout" },
];

const LeftSidebar = () => {
  // NAVIGATION
  const navigate = useNavigate();
  // LOGOUT HANDLER
  const logoutHandler = async () => {
    try {
      const response = await axios.get(`${USER_API_ENDPOINT}/logout`, {
        withCredentials: true,
      });
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // NAVIGATING TO THE MAIN PAGE
        navigate("/");
        // TOASTING SUCCESS MESSAGE
        toast.success(response.data.message);
      }
    } catch (error) {
      // LOGGING ERROR IN THE CONSOLE
      console.error("Failed to Logout!", error);
      // TOASTING ERROR MESSAGE
      toast.error(error?.response?.data?.message || "Failed to Logout!");
    }
  };
  // SIDEBAR ITEM CLICK HANDLER
  const sidebarItemClickHandler = (label) => {
    // IF NO LABEL
    if (!label) return;
    // IF LOGOUT IS CLICKED
    if (label === "Logout") {
      logoutHandler();
      return;
    }
  };
  return (
    <>
      {/* LEFT SIDEBAR MAIN WRAPPER */}
      <section className="fixed top-0 left-0 bg-white h-screen w-[250px] border-r-2 border-gray-200 px-3 py-6">
        {/* LEFT SIDEBAR CONTENT WRAPPER */}
        <section className="flex flex-col items-center justify-between h-full">
          {/* LOGO */}
          <div className="w-full flex items-center justify-start ">
            <img
              src={INSTAGRAM}
              alt="Instagram Logo"
              className="h-10 cursor-pointer"
            />
          </div>
          {/* SIDEBAR ITEMS */}
          <div className="w-full flex flex-col items-start justify-center">
            {sidebarItems.map((item, index) => (
              <div
                onClick={() => sidebarItemClickHandler(item.label)}
                key={index}
                className="flex items-center justify-start gap-2 w-full p-3 rounded-md text-[1.1rem] hover:bg-gray-100 cursor-pointer"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          {/* MORE SECTION */}
          <div className="w-full flex items-center justify-start gap-2 p-3 rounded-md text-[1.1rem] hover:bg-gray-100 cursor-pointer">
            <span>
              <List />
            </span>
            <span>More</span>
          </div>
        </section>
      </section>
    </>
  );
};

export default LeftSidebar;
