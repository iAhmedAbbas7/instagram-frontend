// <= IMPORTS =>
import Messages from "./Messages";
import { Button } from "../ui/button";
import useTitle from "@/hooks/useTitle";
import { useSelector } from "react-redux";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Edit, MessageCircleMore, Search, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

// CHATS TEMPORARY ARRAY
const chatsArray = [];

const ChatPage = () => {
  // USE TITLE HOOK
  useTitle("Instagram - Messages");
  // CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // GETTING SELECTED CHAT USER FROM CHAT SLICE
  const { chatUser } = useSelector((store) => store.chat);
  // AVATAR FALLBACK MANAGEMENT
  const fullNameInitials = getFullNameInitials(user?.fullName);
  return (
    // CHAT PAGE MAIN WRAPPER
    <section className="w-full max-[768px]:pl-[0px] h-screen pl-[70px] flex items-start justify-start">
      {/* CHAT PAGE LEFT SIDEBAR */}
      <section className="border-r-2 border-gray-200 pt-6 w-[350px] h-full flex flex-col items-start justify-start max-[768px]:h-[89.5vh]">
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
        {/* CHATS SECTION HEADING */}
        <div className="px-7 pb-2 w-full flex items-center justify-between">
          <h1 className="text-[1.1rem] font-semibold">Messages</h1>
          <span className="font-semibold text-gray-600 cursor-pointer">
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
              <span className="cursor-pointer text-sky-400 font-semibold bg-gray-100 px-3 rounded-md py-1">
                Get Started
              </span>
            </div>
          )}
          {/* WHEN CHATS AVAILABLE */}
          {chatsArray.length > 0 &&
            chatsArray.map((item, index) => (
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
                    <AvatarImage src={user.profilePhoto} alt={user.fullName} />
                    <AvatarFallback>{fullNameInitials}</AvatarFallback>
                  </Avatar>
                  {/* USERNAME */}
                  <div className="flex flex-col">
                    <span className="font-semibold text-[1rem]">
                      {user?.fullName}
                    </span>
                    <span className="text-gray-500 text-sm">Active Time</span>
                  </div>
                </div>
              </>
            ))}
        </div>
      </section>
      {/* CHAT PAGE CHAT SECTION */}
      <section className="flex-1 h-screen">
        {/* WHEN NO CHAT USER SELECTED */}
        {chatUser === null ? (
          <div className="w-full h-full max-[768px]:h-[89.5vh] flex flex-col gap-1 items-center justify-center">
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
                    user.profilePhoto === "" ? "bg-gray-300" : "bg-none"
                  } `}
                >
                  <AvatarImage src={user.profilePhoto} alt={user.fullName} />
                  <AvatarFallback>{fullNameInitials}</AvatarFallback>
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
            </div>
            {/* MESSAGES SECTION */}
            <div className="w-full flex-1 flex flex-col items-start justify-start overflow-y-auto px-3 py-4">
              {/* CHAT USER INFO SECTION */}
              <div className="w-full py-6 flex flex-col items-center justify-center">
                {/* AVATAR */}
                <Avatar
                  className={`w-24 h-24 cursor-pointer ${
                    user.profilePhoto === "" ? "bg-gray-300" : "bg-none"
                  } `}
                >
                  <AvatarImage src={user.profilePhoto} alt={user.fullName} />
                  <AvatarFallback>{fullNameInitials}</AvatarFallback>
                </Avatar>
                {/* FULLNAME */}
                <h1 className="font-semibold text-[1.3rem] mt-1">
                  {user?.fullName}
                </h1>
                {/* USERNAME */}
                <span className="text-[1rem] text-gray-500">
                  {user?.username} · Instagram
                </span>
                {/* VIEW PROFILE */}
                <Button
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
            <div className="w-full p-3 bg-white">
              <input
                type="text"
                className="w-full border-gray-200 outline-none focus:outline-none border-2 rounded-full px-4 py-2"
                placeholder="Message..."
              />
            </div>
          </div>
        )}
      </section>
    </section>
  );
};

export default ChatPage;
