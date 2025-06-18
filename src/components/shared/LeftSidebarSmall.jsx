// <= IMPORTS =>
import { toast } from "sonner";
import { useState } from "react";
import CreatePost from "../user/CreatePost";
import axiosClient from "@/utils/axiosClient";
import { useNavigate } from "react-router-dom";
import { clearAuthState } from "@/redux/authSlice";
import { useDispatch, useSelector } from "react-redux";
import INSTAGRAM from "../../assets/images/INSTA-SMALL.png";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Compass,
  Heart,
  Home,
  List,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
} from "lucide-react";

const LeftSidebarSmall = () => {
  // GETTING CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // AVATAR FALLBACK MANAGEMENT
  const fullNameInitials = getFullNameInitials(user?.fullName);
  // NAVIGATION
  const navigate = useNavigate();
  // DISPATCH
  const dispatch = useDispatch();
  // POST DIALOG STATE
  const [showPostDialog, setShowPostDialog] = useState(false);
  // LOGOUT HANDLER
  const logoutHandler = async () => {
    try {
      const response = await axiosClient.get(`/user/logout`);
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // CLEARING AUTH STATE
        dispatch(clearAuthState());
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
  // SIDEBAR ITEMS
  const sidebarItems = [
    { icon: <Home size={30} />, label: "Home" },
    { icon: <Search size={30} />, label: "Search" },
    { icon: <Compass size={30} />, label: "Explore" },
    { icon: <MessageCircle size={30} />, label: "Messages" },
    { icon: <Heart size={30} />, label: "Notifications" },
    { icon: <PlusSquare size={30} />, label: "Create" },
    {
      icon: (
        <Avatar className="w-8 h-8">
          <AvatarImage src={user?.profilePhoto} />
          <AvatarFallback>{fullNameInitials}</AvatarFallback>
        </Avatar>
      ),
      label: "Profile",
    },
    { icon: <LogOut size={30} />, label: "Logout" },
  ];
  // SIDEBAR ITEM CLICK HANDLER
  const sidebarItemClickHandler = (label) => {
    // IF NO LABEL
    if (!label) return;
    if (label === "Home") {
      navigate("/home");
    }
    // IF LOGOUT IS CLICKED
    else if (label === "Logout") {
      logoutHandler();
      return;
    }
    // IF CREATE IS CLICKED
    else if (label === "Create") {
      setShowPostDialog(true);
    }
    // IF PROFILE IS CLICKED
    else if (label === "Profile") {
      navigate(`profile/${user?._id}`);
    }
  };
  return (
    <>
      {/* LEFT SIDEBAR SMALL MAIN WRAPPER */}
      <section className="fixed top-0 max-[768px]:hidden max-[1200px]:block hidden left-0 bg-white h-screen w-[70px] border-r-2 border-gray-200 px-3 py-6">
        {/* LEFT SIDEBAR SMALL CONTENT WRAPPER */}
        <section className="flex flex-col items-center justify-between gap-2 h-full">
          {/* LOGO */}
          <div className="w-full flex items-start justify-center">
            <img
              src={INSTAGRAM}
              alt="Instagram Logo"
              className="h-8 cursor-pointer"
            />
          </div>
          {/* SIDEBAR ITEMS */}
          <div className="w-full flex flex-col items-center justify-center gap-1">
            {sidebarItems.map((item, index) => (
              <div
                title={item.label}
                onClick={() => sidebarItemClickHandler(item.label)}
                key={index}
                className="w-full flex items-center justify-center p-2 rounded-md hover:bg-gray-100 cursor-pointer"
              >
                <span>{item.icon}</span>
              </div>
            ))}
          </div>
          {/* MORE SECTION */}
          <div className="w-full flex items-center justify-center p-3 rounded-md text-[1.1rem] hover:bg-gray-100 cursor-pointer">
            <span title="More">
              <List size={30} />
            </span>
          </div>
        </section>
        {/* POST DIALOG */}
        <CreatePost open={showPostDialog} setOpen={setShowPostDialog} />
      </section>
    </>
  );
};

export default LeftSidebarSmall;
