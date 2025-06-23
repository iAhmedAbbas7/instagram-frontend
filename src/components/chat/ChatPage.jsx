// <= IMPORTS =>
import { toast } from "sonner";
import Messages from "./Messages";
import { Button } from "../ui/button";
import useTitle from "@/hooks/useTitle";
import { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { setChatUser, setMessages } from "@/redux/chatSlice";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  ArrowLeft,
  ArrowRight,
  Edit,
  EyeOff,
  MessageCircleMore,
  Search,
  UserCircle2,
  X,
} from "lucide-react";

// CHATS TEMPORARY ARRAY
const chatsArray = [];
// REQUESTS TEMPORARY ARRAY
const requestsArray = [];

const ChatPage = () => {
  // USE TITLE HOOK
  useTitle("Instagram - Messages");
  // DISPATCH
  const dispatch = useDispatch();
  // NAVIGATION
  const navigate = useNavigate();
  // MESSAGE TEXT STATE
  const [messageText, setMessageText] = useState("");
  // CURRENT USER CREDENTIALS & SUGGESTED USERS
  const { user, suggestedUsers } = useSelector((store) => store.auth);
  // GETTING SELECTED CHAT USER & ONLINE USERS FROM CHAT SLICE
  const { chatUser, onlineUsers, messages } = useSelector(
    (store) => store.chat
  );
  // AVATAR FALLBACK MANAGEMENT FOR LOGGED IN USER
  const fullNameInitials = user?.fullName
    ? getFullNameInitials(user?.fullName)
    : "";
  // AVATAR FALLBACK MANAGEMENT FOR CHAT USER
  const fullNameInitialsChatUser = chatUser?.fullName
    ? getFullNameInitials(chatUser?.fullName)
    : "";
  // SIDEBAR CONTENT STATE MANAGEMENT
  const [sidebarContent, setSidebarContent] = useState("MESSAGES");
  // RESTORING THE MESSAGES CONTENT STATE WHEN CHAT USER BECOMES NULL
  useEffect(() => {
    if (chatUser === null) {
      setSidebarContent("MESSAGES");
    }
  }, [chatUser]);
  // ALWAYS SETTING THE CHAT USER TO NULL ON COMPONENT MOUNT
  useEffect(() => {
    return () => {
      setChatUser(null);
    };
  }, []);
  // SEND MESSAGE HANDLER
  const sendMessageHandler = async (receiverId) => {
    try {
      // MAKING REQUEST
      const response = await axiosClient.post(
        `/message/send/${receiverId}`,
        { message: messageText },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // SETTING MESSAGE IN THE CHAT MESSAGES STATE
        dispatch(setMessages([...messages, response.data.populatedMessage]));
        // CLEARING MESSAGE FIELD
        setMessageText("");
      }
    } catch (error) {
      // LOGGING ERROR MESSAGE
      console.error("Failed to Send Message", error);
      // TOASTING ERROR MESSAGE
      toast.error(error?.response?.data?.message || "Failed to Send Message");
    }
  };
  return (
    // CHAT PAGE MAIN WRAPPER
    <section className="w-full max-[768px]:pl-[0px] h-screen pl-[70px] flex items-start justify-start">
      {/* CHAT PAGE LEFT SIDEBAR */}
      <section className="border-r-2 border-gray-200 pt-6 w-[350px] h-full flex flex-col items-start justify-start max-[768px]:h-[89.5vh]">
        {/* MESSAGES CONTENT STATE */}
        {sidebarContent === "MESSAGES" && (
          <>
            {/* HEADER */}
            <div className="px-7 w-full flex items-center justify-between">
              <h1 className="text-[1.3rem] font-semibold">{user?.username}</h1>
              <span title="New Message" className="cursor-pointer">
                <Edit size={25} />
              </span>
            </div>
            {/* SEARCH INPUT */}
            <div className="px-4 w-full relative flex items-center justify-center mt-2 mb-6">
              <input
                onClick={() => setSidebarContent("SUGGESTED")}
                type="text"
                className="w-full bg-gray-100 border-none outline-none focus:outline-none rounded-md pl-10 pr-8 py-1.5 text-gray-500 placeholder:text-gray-500"
                placeholder="Search"
              />
              <span className="left-6 absolute">
                <Search className="text-gray-500" />
              </span>
              <span className="absolute right-6 p-1 rounded-full flex items-center justify-center bg-gray-200">
                <X size={13} className="text-gray-500" />
              </span>
            </div>
            {/* CHATS SECTION HEADING */}
            <div className="px-7 pb-2 w-full flex items-center justify-between">
              <h1 className="text-[1.1rem] font-semibold">Messages</h1>
              <span
                onClick={() => setSidebarContent("REQUESTS")}
                className="font-semibold text-gray-600 cursor-pointer"
              >
                Requests
              </span>
            </div>
            {/* CHATS SECTION */}
            <div className="w-full h-full overflow-y-auto">
              {/* WHEN NO CHATS AVAILABLE */}
              {chatsArray.length === 0 && (
                <div className="h-full w-full flex flex-col gap-2 items-center justify-center px-5">
                  <span className="text-center text-gray-500 text-sm">
                    Chats will appear here after you&apos;ve sent or received a
                    message.
                  </span>
                  <span
                    onClick={() => setSidebarContent("SUGGESTED")}
                    className="cursor-pointer text-sky-400 font-semibold bg-gray-100 px-3 rounded-md py-1"
                  >
                    Get Started
                  </span>
                </div>
              )}
              {/* WHEN CHATS AVAILABLE */}
              {chatsArray.length > 0 &&
                chatsArray.map((index) => (
                  <>
                    {/* AVATAR & USERNAME */}
                    <div
                      key={index}
                      className="w-full flex items-center gap-3 hover:bg-gray-100 p-3 cursor-pointer"
                    >
                      {/* AVATAR */}
                      <Avatar
                        className={`w-11 h-11 cursor-pointer ${
                          user.profilePhoto === "" ? "bg-gray-300" : "bg-none"
                        } `}
                      >
                        <AvatarImage
                          src={user.profilePhoto}
                          alt={user.fullName}
                        />
                        <AvatarFallback>{fullNameInitials}</AvatarFallback>
                      </Avatar>
                      {/* USERNAME */}
                      <div className="flex flex-col">
                        <span className="font-semibold text-[1rem]">
                          {user?.fullName}
                        </span>
                        <span className="text-gray-500 text-sm">
                          Active Time
                        </span>
                      </div>
                    </div>
                  </>
                ))}
            </div>
          </>
        )}
        {/* SUGGESTED CONTENT STATE */}
        {sidebarContent === "SUGGESTED" && (
          <>
            {/* HEADER */}
            <div className="px-7 w-full flex items-center justify-between">
              <h1 className="text-[1.3rem] font-semibold">{user?.username}</h1>
              <span title="New Message" className="cursor-pointer">
                <Edit size={25} />
              </span>
            </div>
            {/* SEARCH INPUT */}
            <div className="px-4 w-full relative flex items-center justify-center mt-2 mb-6">
              <input
                type="text"
                className="w-full bg-gray-100 border-none outline-none focus:outline-none rounded-md pl-10 pr-8 py-1.5 text-gray-500 placeholder:text-gray-500"
                placeholder="Search"
              />
              <span className="left-6 absolute">
                <Search className="text-gray-500" />
              </span>
              <span className="absolute right-6 p-1 rounded-full flex items-center justify-center bg-gray-200">
                <X size={13} className="text-gray-500" />
              </span>
            </div>
            {/* SUGGESTED SECTION */}
            <div className="px-7 pb-2 w-full flex items-center justify-between">
              <h1 className="text-[1.1rem] font-semibold">Suggested</h1>
              <span
                onClick={() => setSidebarContent("MESSAGES")}
                title="Go Back"
                className="cursor-pointer"
              >
                <ArrowLeft size={30} className="text-black" />
              </span>
            </div>
            {/* SUGGESTED LIST */}
            <div className="w-full h-full overflow-y-auto">
              {suggestedUsers.length > 0 &&
                suggestedUsers.map((suggestedUser) => {
                  // AVATAR FALLBACK MANAGEMENT
                  const fullNameInitials = suggestedUser?.fullName
                    ? getFullNameInitials(suggestedUser?.fullName)
                    : "";
                  // ONLINE FLAG
                  const isOnline = onlineUsers?.includes(suggestedUser?._id);
                  // LAST ACTIVE TIME
                  const lastActiveTime = suggestedUser?.lastActive
                    ? formatDistanceToNow(suggestedUser?.lastActive)
                    : "Offline";
                  return (
                    <>
                      {/* AVATAR & USERNAME */}
                      <div
                        onClick={() => dispatch(setChatUser(suggestedUser))}
                        key={suggestedUser._id}
                        className="w-full flex items-center gap-3 hover:bg-gray-100 p-3 cursor-pointer"
                      >
                        {/* AVATAR */}
                        <Avatar
                          className={`w-11 h-11 cursor-pointer ${
                            suggestedUser?.profilePhoto === ""
                              ? "bg-gray-300"
                              : "bg-none"
                          } `}
                        >
                          <AvatarImage
                            src={suggestedUser?.profilePhoto}
                            alt={suggestedUser?.fullName}
                          />
                          <AvatarFallback>{fullNameInitials}</AvatarFallback>
                        </Avatar>
                        {/* USERNAME */}
                        <div className="flex flex-col">
                          <span className="font-semibold text-[1rem] flex items-center gap-2">
                            <span>{suggestedUser?.fullName}</span>
                            {/* ONLINE SIGNAL */}
                            {isOnline && (
                              <div
                                title="Online"
                                className="w-3 h-3 rounded-full bg-green-500"
                              ></div>
                            )}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {suggestedUser?.username}
                          </span>
                          {/* LAST ACTIVE TIME */}
                          {!isOnline && (
                            <span className="text-[0.7rem] text-gray-500">
                              Active {lastActiveTime} ago
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })}
            </div>
          </>
        )}
        {/* REQUESTS CONTENT STATE */}
        {sidebarContent === "REQUESTS" && (
          <>
            {/* HEADER */}
            <div className="px-7 w-full flex items-center justify-start gap-6">
              <span
                onClick={() => setSidebarContent("MESSAGES")}
                title="Go Back"
                className="cursor-pointer"
              >
                <ArrowLeft size={40} />
              </span>
              <h1 className="font-semibold text-[1.5rem]">Message Requests</h1>
            </div>
            {/* IF REQUESTS AVAILABLE */}
            {requestsArray.length > 0 && (
              <>
                {/* TOP SECTION */}
                <div className="w-full px-7 pt-6 flex flex-col items-center justify-center">
                  {/* MESSAGE */}
                  <p className="text-center text-xs text-gray-500">
                    Open a chat to get more info about who&apos;s messaging you.
                    They won&apos;t know you&apos;ve seen it until you accept.
                  </p>
                  {/* SETTING LINK */}
                  <h5 className="text-sky-400 hover:text-sky-500 text-sm mt-2 font-semibold">
                    Decide who can message you
                  </h5>
                </div>
                {/* REQUESTS LIST */}
                <div className="w-full h-full overflow-y-auto mt-4">
                  {requestsArray.length > 0 &&
                    requestsArray.map((req) => {
                      // AVATAR FALLBACK MANAGEMENT
                      const fullNameInitials = getFullNameInitials(
                        user?.fullName
                      );
                      return (
                        <>
                          {/* AVATAR & USERNAME */}
                          <div
                            key={req}
                            className="w-full flex items-center gap-3 hover:bg-gray-100 p-3 cursor-pointer"
                          >
                            {/* AVATAR */}
                            <Avatar
                              className={`w-11 h-11 cursor-pointer ${
                                user?.profilePhoto === ""
                                  ? "bg-gray-300"
                                  : "bg-none"
                              } `}
                            >
                              <AvatarImage
                                src={user?.profilePhoto}
                                alt={user?.fullName}
                              />
                              <AvatarFallback>
                                {fullNameInitials}
                              </AvatarFallback>
                            </Avatar>
                            {/* USERNAME */}
                            <div className="flex flex-col">
                              <span className="font-semibold text-[1rem]">
                                {user?.fullName}
                              </span>
                              <span className="text-gray-500 text-sm">
                                {user?.username}
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })}
                  {requestsArray.length > 0 && (
                    <div className="my-4 flex items-center justify-center">
                      {/* DELETE ALL BUTTON */}
                      <span className="cursor-pointer text-red-500 font-semibold px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200">
                        Delete All
                      </span>
                    </div>
                  )}
                </div>
                {/* HIDDEN REQUESTS */}
                <div
                  onClick={() => setSidebarContent("HIDDEN")}
                  className="w-full flex items-center justify-between hover:bg-gray-100 p-3 cursor-pointer"
                >
                  {/* ICON SECTION */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full  flex items-center justify-center bg-gray-200">
                      <EyeOff size={30} />
                    </div>
                    <span className="font-semibold text-[0.9rem]">
                      Hidden Requests
                    </span>
                  </div>
                  {/* FORWARD BUTTON */}
                  <span>
                    <ArrowRight size={30} />
                  </span>
                </div>
              </>
            )}
            {/* IF NO REQUESTS AVAILABLE */}
            {requestsArray.length <= 0 && (
              <div
                onClick={() => setSidebarContent("HIDDEN")}
                className="w-full flex items-center justify-between hover:bg-gray-100 p-3 cursor-pointer mt-5"
              >
                {/* ICON SECTION */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full  flex items-center justify-center bg-gray-200">
                    <EyeOff size={30} />
                  </div>
                  <span className="font-semibold text-[0.9rem]">
                    Hidden Requests
                  </span>
                </div>
                {/* FORWARD BUTTON */}
                <span>
                  <ArrowRight size={30} />
                </span>
              </div>
            )}
          </>
        )}
        {/* HIDDEN REQUESTS CONTENT STATE */}
        {sidebarContent === "HIDDEN" && (
          <>
            {/* HEADER */}
            <div className="px-7 w-full flex items-center justify-start gap-6">
              <span
                onClick={() => setSidebarContent("REQUESTS")}
                title="Go Back"
                className="cursor-pointer"
              >
                <ArrowLeft size={40} />
              </span>
              <h1 className="font-semibold text-[1.5rem]">Hidden Requests</h1>
            </div>
          </>
        )}
      </section>
      {/* CHAT PAGE CHAT SECTION */}
      <section className="flex-1 h-screen">
        {/* WHEN NO CHAT USER SELECTED */}
        {chatUser === null ? (
          <div className="w-full h-full max-[768px]:h-[89.5vh] flex flex-col gap-1 items-center justify-center">
            {/* MESSAGES & SUGGESTED CONTENT STATE  */}
            {(sidebarContent === "MESSAGES" ||
              sidebarContent === "SUGGESTED") && (
              <>
                <MessageCircleMore size={"100px"} className="font-normals" />
                <h1 className="font-semibold text-[1.2rem]">Your Messages</h1>
                <p className="text-sm text-gray-500">
                  Send a message to start a chat.
                </p>
                <Button
                  type="button"
                  className="bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer mt-2"
                >
                  Send Message
                </Button>
              </>
            )}
            {/* REQUESTS CONTENT STATE */}
            {sidebarContent === "REQUESTS" && (
              <>
                <UserCircle2 size={"100px"} className="font-normals" />
                <h1 className="font-semibold text-[1.2rem]">
                  Message Requests
                </h1>
                <p className="text-sm text-gray-500 text-center">
                  These messages are from people you&apos;ve restricted or
                  don&apos;t follow. They won&apos;t <br /> know you viewed
                  their request until you allow them to message you.
                </p>
              </>
            )}
            {/* HIDDEN REQUESTS CONTENT STATE */}
            {sidebarContent === "HIDDEN" && (
              <>
                <EyeOff size={"100px"} className="font-normals" />
                <h1 className="font-semibold text-[1.2rem]">Hidden Requests</h1>
                <p className="text-sm text-gray-500 text-center">
                  These are message requests that maybe offensive or unwanted.
                </p>
              </>
            )}
          </div>
        ) : (
          // WHEN CHAT USER IS SELECTED
          <div className="w-full h-full max-[768px]:h-[89.5vh] flex flex-col items-start justify-start">
            {/* HEADER */}
            <div className="w-full p-3 border-b-2 border-gray-200 bg-white">
              {/* AVATAR & USERNAME */}
              <div className="flex items-center gap-3 cursor-pointer">
                {/* AVATAR */}
                <Avatar
                  className={`w-11 h-11 cursor-pointer ${
                    chatUser?.profilePhoto === "" ? "bg-gray-300" : "bg-none"
                  } `}
                >
                  <AvatarImage
                    src={chatUser?.profilePhoto}
                    alt={chatUser?.fullName}
                  />
                  <AvatarFallback>{fullNameInitialsChatUser}</AvatarFallback>
                </Avatar>
                {/* USERNAME */}
                <div className="flex flex-col">
                  <span className="font-semibold text-[1rem]">
                    {chatUser?.fullName}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {chatUser?.username}
                  </span>
                </div>
              </div>
            </div>
            {/* MESSAGES SECTION */}
            <div className="w-full flex-1 flex flex-col items-start justify-start overflow-y-auto px-3 py-4">
              {/* CHAT USER INFO SECTION */}
              <div className="w-full py-6 flex flex-col items-center justify-center">
                {/* AVATAR */}
                <Avatar
                  className={`w-24 h-24 cursor-pointer ${
                    chatUser?.profilePhoto === "" ? "bg-gray-300" : "bg-none"
                  } `}
                >
                  <AvatarImage
                    src={chatUser?.profilePhoto}
                    alt={chatUser?.fullName}
                  />
                  <AvatarFallback>{fullNameInitialsChatUser}</AvatarFallback>
                </Avatar>
                {/* FULLNAME */}
                <h1 className="font-semibold text-[1.3rem] mt-1">
                  {chatUser?.fullName}
                </h1>
                {/* USERNAME */}
                <span className="text-[1rem] text-gray-500">
                  {chatUser?.username} · Instagram
                </span>
                {/* VIEW PROFILE */}
                <Button
                  onClick={() => navigate(`/home/profile/${chatUser._id}`)}
                  type="button"
                  className="bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer mt-3"
                >
                  View Profile
                </Button>
              </div>
              {/* MESSAGES */}
              <Messages chatUser={chatUser} />
            </div>
            {/* MESSAGE INPUT */}
            <div className="w-full p-3 bg-white relative flex items-center justify-center">
              <input
                value={messageText}
                id="messageText"
                name="messageText"
                onChange={(e) => setMessageText(e.target.value)}
                type="text"
                className="w-full border-gray-200 outline-none focus:outline-none border-2 rounded-full pl-4 pr-15 py-2"
                placeholder="Message..."
                spellCheck="false"
                autoComplete="off"
              />
              {/* SEND BUTTON */}
              {messageText.trim() && (
                <span
                  onClick={() => sendMessageHandler(chatUser?._id)}
                  title="Send"
                  className="absolute right-8 text-sm text-sky-400 hover:text-sky-500 cursor-pointer font-semibold"
                >
                  Send
                </span>
              )}
            </div>
          </div>
        )}
      </section>
    </section>
  );
};

export default ChatPage;
