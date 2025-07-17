// <= IMPORTS =>
import { Loader2 } from "lucide-react";
import { useCallback, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import useConversations from "@/hooks/useConversations";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { setChatUser, setCurrentConversation } from "@/redux/chatSlice";

const ChatsList = ({ setPanelState }) => {
  // DISPATCH
  const dispatch = useDispatch();
  // CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // GETTING ONLINE USERS LIST FROM CHAT SLICE
  const { onlineUsers } = useSelector((store) => store.chat);
  // USING USE CONVERSATIONS HOOK
  const {
    allConversations,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
  } = useConversations();
  // SETTING OBSERVER REF
  const observerRef = useRef();
  // SETTING REF ON LAST CHAT IN THE LAST FOR TRIGGERING SCROLL FETCH
  const lastRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [hasNextPage, fetchNextPage, isFetchingNextPage]
  );
  return (
    <>
      {/* IF LOADING */}
      {isLoading && (
        <div className="w-full flex flex-1 items-center justify-center">
          <Loader2 size={30} className="animate-spin text-gray-500" />
        </div>
      )}
      {/* CHAT LIST */}
      {!isLoading && allConversations.length > 0 && (
        <div className="flex-1 w-full overflow-y-auto flex flex-col items-start justify-start">
          {/* ALL CONVERSATIONS */}
          {allConversations.map((chat, idx) => {
            // SETTING REF FOR THE LAST CHAT
            const isLast = idx === allConversations.length - 1;
            // SETTING OTHER CHAT PARTICIPANT
            const other = chat?.participants.find((p) => p._id !== user._id);
            // ONLINE FLAG
            const isOnline = onlineUsers?.includes(other?._id);
            // LAST ACTIVE TIME
            const lastActiveTime = other?.lastActive
              ? formatDistanceToNow(other?.lastActive)
              : "Offline";
            // AVATAR FALLBACK MANAGEMENT
            const fullNameInitials = other?.fullName
              ? getFullNameInitials(other?.fullName)
              : "";
            return (
              <>
                {/* AVATAR & USERNAME */}
                <div
                  key={chat._id}
                  onClick={() => {
                    dispatch(setCurrentConversation(chat));
                    chat.type === "ONE-TO-ONE" && dispatch(setChatUser(other));
                    setPanelState("CHAT");
                  }}
                  ref={isLast ? lastRef : undefined}
                  className="w-full flex items-center gap-3 hover:bg-gray-100 p-3 cursor-pointer"
                >
                  {/* AVATAR */}
                  <Avatar
                    className={`w-13 h-13 cursor-pointer ${
                      other?.profilePhoto === "" ? "bg-gray-300" : "bg-none"
                    } `}
                  >
                    <AvatarImage
                      src={
                        chat.type === "GROUP"
                          ? chat?.avatar
                          : other?.profilePhoto
                      }
                      alt={chat.type === "GROUP" ? chat?.name : other?.fullName}
                      className="w-13 h-13"
                    />
                    <AvatarFallback>{fullNameInitials}</AvatarFallback>
                  </Avatar>
                  {/* USERNAME */}
                  {chat.type === "ONE-TO-ONE" && (
                    <div className="flex flex-col">
                      <span className="font-semibold text-[1rem] flex items-center gap-2">
                        <span>{other?.fullName}</span>
                        {/* ONLINE SIGNAL */}
                        {isOnline && (
                          <div
                            title="Online"
                            className="w-3 h-3 rounded-full bg-green-500"
                          ></div>
                        )}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {other?.username}
                      </span>
                      {/* LAST ACTIVE TIME */}
                      {!isOnline && (
                        <span className="text-[0.7rem] text-gray-500">
                          Active {lastActiveTime} ago
                        </span>
                      )}
                    </div>
                  )}
                  {/* GROUP NAME */}
                  {chat.type === "GROUP" && (
                    <div className="flex flex-col">
                      <span className="font-semibold text-[1rem]">
                        {chat?.name}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {chat.participants.length} Members
                      </span>
                    </div>
                  )}
                </div>
              </>
            );
          })}
          {/* FETCHING NEXT PAGE */}
          {isFetchingNextPage && (
            <div className="w-full flex items-center justify-center py-4">
              <Loader2 size={30} className="animate-spin text-gray-500" />
            </div>
          )}
        </div>
      )}
      {/* IF NO CHATS AVAILABLE */}
      {!isLoading && allConversations.length === 0 && (
        <div className="w-full flex flex-col gap-2 flex-1 items-center justify-center">
          {/* TEXT */}
          <h4 className="text-gray-500 text-sm text-center">
            Chat will appear here after you&apos;ve sent <br /> or received a
            message.
          </h4>
          {/* BUTTON */}
          <span
            onClick={() => setPanelState("NEW-MESSAGE")}
            className="px-3 py-1.5 bg-gray-100 text-sky-400 rounded-md font-semibold hover:bg-gray-200 text-center cursor-pointer"
          >
            Get Started
          </span>
        </div>
      )}
    </>
  );
};

export default ChatsList;
