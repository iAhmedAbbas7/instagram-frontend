// <= IMPORTS =>
import useTitle from "@/hooks/useTitle";
import { useSelector } from "react-redux";
import { Edit, Search, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

// CHATS TEMPORARY ARRAY
const chatsArray = [];

const ChatPage = () => {
  // USE TITLE HOOK
  useTitle("Instagram - Messages");
  // CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  return (
    // CHAT PAGE MAIN WRAPPER
    <section className="w-full max-[768px]:pl-[0px] pl-[70px] flex items-start justify-start">
      {/* CHAT PAGE LEFT SIDEBAR */}
      <section className="border-r-2 border-gray-200 pt-6 w-[350px] h-screen flex flex-col items-start justify-start">
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
                    <AvatarFallback>{item}</AvatarFallback>
                  </Avatar>
                  {/* USERNAME */}
                  <div className="flex flex-col">
                    <span className="font-semibold text-[0.9rem]">
                      {user?.username}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {user?.fullName}
                    </span>
                  </div>
                </div>
              </>
            ))}
        </div>
      </section>
      {/* CHAT PAGE CHAT SECTION */}
      <section className="flex-1 h-screen"></section>
    </section>
  );
};

export default ChatPage;
