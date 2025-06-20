// <= IMPORTS =>
import { toast } from "sonner";
import { useState } from "react";
import CreatePost from "../user/CreatePost";
import axiosClient from "@/utils/axiosClient";
import { useNavigate } from "react-router-dom";
import { clearAuthState } from "@/redux/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Compass,
  Home,
  LogOut,
  MessageCircleMore,
  PlusSquare,
} from "lucide-react";

const Footer = () => {
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
  // FOOTER ITEMS
  const footerItems = [
    { icon: <Home size={27} />, label: "Home" },
    { icon: <Compass size={27} />, label: "Explore" },
    { icon: <MessageCircleMore size={27} />, label: "Messages" },
    { icon: <PlusSquare size={27} />, label: "Create" },
    {
      icon: (
        <Avatar className="w-6.5 h-6.5">
          <AvatarImage src={user?.profilePhoto} />
          <AvatarFallback>{fullNameInitials}</AvatarFallback>
        </Avatar>
      ),
      label: "Profile",
    },
    { icon: <LogOut size={30} />, label: "Logout" },
  ];
  // FOOTER ITEM CLICK HANDLER
  const footerItemClickHandler = (label) => {
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
    // FOOTER MAIN WRAPPER
    <section className="bg-white hidden max-[768px]:flex items-center justify-between px-6 h-[60px] fixed bottom-0 w-full overflow-hidden z-[999999] border-t-2 border-gray-200">
      {/* FOOTER ITEMS */}
      <div className="w-full flex items-center justify-evenly">
        {footerItems.map((item, index) => (
          <div
            title={item.label}
            onClick={() => footerItemClickHandler(item.label)}
            key={index}
            className="w-full flex items-center justify-center p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          >
            <span>{item.icon}</span>
          </div>
        ))}
      </div>
      {/* POST DIALOG */}
      <CreatePost open={showPostDialog} setOpen={setShowPostDialog} />
    </section>
  );
};

export default Footer;
