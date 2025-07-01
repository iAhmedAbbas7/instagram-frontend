// <= IMPORTS =>
import { toast } from "sonner";
import CreatePost from "../user/CreatePost";
import SearchSidebar from "./SearchSidebar";
import axiosClient from "@/utils/axiosClient";
import { setChatUser } from "@/redux/chatSlice";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import NotificationSidebar from "./NotificationSidebar";
import { markAllAsRead } from "@/redux/notificationSlice";
import { useLocation, useNavigate } from "react-router-dom";
import INSTA_SMALL from "../../assets/images/INSTA-SMALL.png";
import INSTAGRAM from "../../assets/images/INSTAGRAM-TXT.png";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Compass,
  Heart,
  Home,
  List,
  LogOut,
  MessageCircleMore,
  PlusSquare,
  Search,
} from "lucide-react";
import {
  clearAuthState,
  setIsLoggedIn,
  setIsLoggingOut,
} from "@/redux/authSlice";

const LeftSidebar = () => {
  // NAVIGATION
  const navigate = useNavigate();
  // DISPATCH
  const dispatch = useDispatch();
  // GETTING CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // LOCATION
  const { pathname } = useLocation();
  // CHAT PAGE CONDITIONAL DISPLAY
  const isChatPage = pathname.startsWith("/home/chat");
  // GETTING ALL NOTIFICATION STATE FROM NOTIFICATION SLICE
  const {
    likeNotifications,
    commentNotifications,
    followNotifications,
    hasUnread,
  } = useSelector((store) => store.notification);
  // TOTAL NOTIFICATIONS COUNT
  const totalNotifications =
    likeNotifications.length +
    commentNotifications.length +
    followNotifications.length;
  // AVATAR FALLBACK MANAGEMENT
  const fullNameInitials =
    user && user?.fullName ? getFullNameInitials(user?.fullName) : "";
  // POST DIALOG STATE
  const [showPostDialog, setShowPostDialog] = useState(false);
  // SEARCH SIDEBAR VISIBILITY STATE
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // NOTIFICATION SIDEBAR VISIBILITY STATE
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  // SHOW SMALL SIDEBAR VISIBILITY STATE
  const [showMinimalSidebar, setShowMinimalSidebar] = useState(false);
  // SEARCH SIDEBAR OPENED THROUGH SEARCH ICON TRACKING STATE
  const [searchJustOpened, setSearchJustOpened] = useState(false);
  // NOTIFICATION SIDEBAR OPENED THROUGH NOTIFICATION ICON TRACKING STATE
  const [notificationJustOpened, setNotificationJustOpened] = useState(false);
  // SEARCH TRANSITION REF
  const searchTransitionRef = useRef(false);
  // NOTIFICATION TRANSITION REF
  const notificationTransitionRef = useRef(false);
  // SEARCH CLICK HANDLER
  const searchClickHandler = () => {
    // IF SEARCH TRANSITION REF IS ONGOING
    if (searchTransitionRef.current) return;
    // OPEN & CLOSE SEARCH SIDEBAR HANDLING WHEN NOTIFICATION SIDEBAR IS OPEN
    if (!isSearchOpen && showMinimalSidebar && isNotificationOpen) {
      searchTransitionRef.current = true;
      setIsNotificationOpen(false);
      setTimeout(() => {
        setIsSearchOpen(true);
        setSearchJustOpened(true);
        searchTransitionRef.current = false;
      }, 500);
      return;
    }
    // OPEN & CLOSE SEARCH SIDEBAR HANDLING
    if (!isSearchOpen && !showMinimalSidebar) {
      searchTransitionRef.current = true;
      setShowMinimalSidebar(true);
      setTimeout(() => {
        setIsSearchOpen(true);
        setSearchJustOpened(true);
        searchTransitionRef.current = false;
      }, 500);
    } else if (isSearchOpen && showMinimalSidebar) {
      searchTransitionRef.current = true;
      setIsSearchOpen(false);
      setTimeout(() => {
        setShowMinimalSidebar(false);
        searchTransitionRef.current = false;
      }, 500);
    }
  };
  // NOTIFICATION CLICK HANDLER
  const notificationClickHandler = () => {
    // IF NOTIFICATION TRANSITION REF IS ONGOING
    if (notificationTransitionRef.current) return;
    // OPEN & CLOSE NOTIFICATION SIDEBAR HANDLING WHEN SEARCH SIDEBAR IS OPEN
    if (!isNotificationOpen && showMinimalSidebar && isSearchOpen) {
      notificationTransitionRef.current = true;
      setIsSearchOpen(false);
      setTimeout(() => {
        setIsNotificationOpen(true);
        setNotificationJustOpened(true);
        notificationTransitionRef.current = false;
      }, 500);
      return;
    }
    // OPEN & CLOSE NOTIFICATION SIDEBAR HANDLING
    if (!isNotificationOpen && !showMinimalSidebar) {
      notificationTransitionRef.current = true;
      setShowMinimalSidebar(true);
      setTimeout(() => {
        setIsNotificationOpen(true);
        setNotificationJustOpened(true);
        notificationTransitionRef.current = false;
      }, 500);
    } else if (isNotificationOpen && showMinimalSidebar) {
      notificationTransitionRef.current = true;
      setIsNotificationOpen(false);
      setTimeout(() => {
        setShowMinimalSidebar(false);
        notificationTransitionRef.current = false;
      }, 500);
    }
  };
  // EFFECT TO RESET THE SEARCH JUST OPENED STATE ON SEARCH OPEN
  useEffect(() => {
    if (searchJustOpened) {
      const timeout = setTimeout(() => setSearchJustOpened(false), 100);
      return () => clearTimeout(timeout);
    }
  }, [searchJustOpened]);
  // EFFECT TO RESET THE NOTIFICATION JUST OPENED STATE ON NOTIFICATION OPEN
  useEffect(() => {
    if (notificationJustOpened) {
      const timeout = setTimeout(() => setNotificationJustOpened(false), 100);
      return () => clearTimeout(timeout);
    }
  }, [notificationJustOpened]);
  // EFFECT TO MARK ALL NOTIFICATION AS READ ON NOTIFICATION SIDEBAR OPEN STATE
  useEffect(() => {
    if (isNotificationOpen && hasUnread) {
      dispatch(markAllAsRead());
    }
  }, [totalNotifications, hasUnread, dispatch, isNotificationOpen]);
  // LOGOUT HANDLER
  const logoutHandler = async () => {
    try {
      const response = await axiosClient.get(`/user/logout`);
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // SETTING LOGGING IN STATE IN AUTH SLICE
        dispatch(setIsLoggedIn(false));
        // SETTING LOGGING OUT STATE IN AUTH SLICE
        dispatch(setIsLoggingOut(true));
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
  // SIDEBAR ITEMS REGULAR SIDEBAR
  const sidebarItemsRegular = [
    { icon: <Home />, label: "Home" },
    { icon: <Search />, label: "Search" },
    { icon: <Compass />, label: "Explore" },
    { icon: <MessageCircleMore />, label: "Messages" },
    { icon: <Heart />, label: "Notifications" },
    { icon: <PlusSquare />, label: "Create" },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.profilePhoto} />
          <AvatarFallback>{fullNameInitials}</AvatarFallback>
        </Avatar>
      ),
      label: "Profile",
    },
    { icon: <LogOut />, label: "Logout" },
  ];
  // SIDEBAR ITEMS SMALL SIDEBAR
  const sidebarItemsSmall = [
    { icon: <Home size={30} />, label: "Home" },
    { icon: <Search size={30} />, label: "Search" },
    { icon: <Compass size={30} />, label: "Explore" },
    { icon: <MessageCircleMore size={30} />, label: "Messages" },
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
  const sidebarItemClickHandler = (label, e) => {
    // STOPPING EVENT PROPAGATION
    if (e) e.stopPropagation();
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
    // IF MESSAGES IS CLICKED
    else if (label === "Messages") {
      dispatch(setChatUser(null));
      navigate("chat");
    }
    // IS SEARCH IS CLICKED
    else if (label === "Search") {
      searchClickHandler();
    }
    // IF NOTIFICATION IS CLICKED
    else if (label === "Notifications") {
      notificationClickHandler();
    }
  };
  return (
    <>
      {/* LEFT SIDEBAR MAIN WRAPPER */}
      {showMinimalSidebar ? (
        <section
          className={`fixed top-0 max-[1200px]:hidden ${
            isChatPage ? "hidden" : "block"
          } left-0 bg-white h-screen w-[70px] border-r-2 border-gray-200 px-3 py-6 z-[20]`}
        >
          {/* LEFT SIDEBAR SMALL CONTENT WRAPPER */}
          <section className="flex flex-col items-center justify-between gap-2 h-full">
            {/* LOGO */}
            <div className="w-full flex items-start justify-center">
              <img
                src={INSTA_SMALL}
                alt="Instagram Logo"
                className="h-8 cursor-pointer"
              />
            </div>
            {/* SIDEBAR ITEMS */}
            <div className="w-full flex flex-col items-center justify-center gap-1">
              {sidebarItemsSmall.map((item, index) => (
                <div
                  title={item.label}
                  onClick={(e) => sidebarItemClickHandler(item.label, e)}
                  key={index}
                  className="w-full flex items-center justify-center p-2 rounded-md hover:bg-gray-100 cursor-pointer relative"
                >
                  <span>{item.icon}</span>
                  {item.label === "Notifications" && hasUnread && (
                    <span className="absolute w-3 h-3 rounded-full bg-red-500 top-2 right-1"></span>
                  )}
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
      ) : (
        <section
          className={`fixed top-0 max-[1200px]:hidden ${
            isChatPage ? "hidden" : "block"
          } left-0 bg-white h-screen w-[250px] border-r-2 border-gray-200 px-3 py-6 z-[20]`}
        >
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
              {sidebarItemsRegular.map((item, index) => (
                <div
                  onClick={(e) => sidebarItemClickHandler(item.label, e)}
                  key={index}
                  className="flex items-center justify-start gap-2 w-full p-3 rounded-md text-[1.1rem] hover:bg-gray-100 cursor-pointer relative"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.label === "Notifications" && hasUnread && (
                    <span
                      title="Unread Notifications"
                      className="absolute w-3 h-3 rounded-full bg-red-500 top-2 left-7"
                    ></span>
                  )}
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
          {/* POST DIALOG */}
          <CreatePost open={showPostDialog} setOpen={setShowPostDialog} />
        </section>
      )}
      {/* SEARCH SIDEBAR */}
      <SearchSidebar
        isOpen={isSearchOpen}
        onClose={searchClickHandler}
        offset={70}
        justOpened={searchJustOpened}
      />
      {/* NOTIFICATION SIDEBAR */}
      <NotificationSidebar
        isOpen={isNotificationOpen}
        onClose={notificationClickHandler}
        offset={70}
        justOpened={notificationJustOpened}
      />
    </>
  );
};

export default LeftSidebar;
