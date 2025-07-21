// <= IMPORTS =>
import { toast } from "sonner";
import axiosClient from "@/utils/axiosClient";
import { formatDistanceToNow } from "date-fns";
import { useCallback, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import useConversations from "@/hooks/useConversations";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { setChatUser, setCurrentConversation } from "@/redux/chatSlice";
import {
  ArrowLeft,
  BellOff,
  Loader2,
  MoreHorizontal,
  Pin,
  Trash2,
} from "lucide-react";

const ChatsList = ({ setPanelState }) => {
  // DISPATCH
  const dispatch = useDispatch();
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // CHAT MENU STATE MANAGEMENT
  const [showChatMenu, setShowChatMenu] = useState(false);
  // SELECTED CHAT STATE MANAGEMENT
  const [selectedChat, setSelectedChat] = useState([]);
  // DELETE LOADING STATE
  const [deleteLoading, setDeleteLoading] = useState(false);
  // CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // GETTING ONLINE USERS LIST FROM CHAT SLICE
  const { onlineUsers } = useSelector((store) => store.chat);
  // GETTING CURRENT CONVERSATION FROM CHAT SLICE
  const { currentConversation, chatUser } = useSelector((store) => store.auth);
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
  // DELETE CHAT HANDLER
  const deleteChatHandler = async () => {
    // DELETE LOADING STATE
    setDeleteLoading(true);
    // MAKING REQUEST
    try {
      const response = await axiosClient.delete(
        `/message/conversation/${selectedChat._id}`
      );
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // GRABBING THE OTHER PARTICIPANT FROM SELECTED CHAT
        const otherParticipant = selectedChat?.participants?.find(
          (p) => p.userId._id !== user._id
        )?.userId;
        // DISPATCHING THE OTHER PARTICIPANT AS THE CHAT USER
        if (otherParticipant) {
          dispatch(setChatUser(otherParticipant));
          // INVALIDING THE MESSAGES CACHE FOR THAT CONVERSATION
          queryClient.removeQueries(["messages", chatUser?._id]);
        }
        // INVALIDING THE MESSAGES CACHE FOR THAT CONVERSATION
        queryClient.removeQueries(["messages", selectedChat?._id]);
        // INVALIDING CONVERSATIONS CACHE TO TRIGGER NEW FETCH
        queryClient.invalidateQueries(["conversations"]);
        // HIDING MENU
        setShowChatMenu(false);
        // TOASTING SUCCESS MESSAGE
        toast.success(response.data.message || "Chat Deleted Successfully!");
      }
    } catch (error) {
      console.error("Failed to Delete Chat!", error);
      // TOASTING ERROR MESSAGE
      toast.error(error?.response?.data?.message || "Failed to Delete Chat!");
    } finally {
      // LOADING STATE
      setDeleteLoading(false);
    }
  };
  // AVATAR FALLBACK MANAGEMENT
  const chatNameInitials = currentConversation?.name
    ? getFullNameInitials(currentConversation?.name)
    : "";
  return (
    <>
      {/* IF LOADING */}
      {isLoading && (
        <div className="w-full flex flex-1 items-center justify-center">
          <Loader2 size={30} className="animate-spin text-gray-500" />
        </div>
      )}
      {/* CHAT LIST */}
      {!isLoading && allConversations?.length > 0 && (
        <div className="flex-1 w-full overflow-y-auto flex flex-col items-start justify-start">
          {/* ALL CONVERSATIONS */}
          {allConversations.map((chat, idx) => {
            // SETTING REF FOR THE LAST CHAT
            const isLast = idx === allConversations.length - 1;
            // SETTING OTHER CHAT PARTICIPANT
            const other = chat?.participants?.find(
              (p) => String(p.userId._id) !== user._id
            )?.userId;
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
                    if (chat.type === "ONE-TO-ONE" && other) {
                      dispatch(setChatUser(other));
                    }
                    setPanelState("CHAT");
                  }}
                  ref={isLast ? lastRef : undefined}
                  className="w-full flex items-center gap-3 hover:bg-gray-100 p-3 cursor-pointer relative group"
                >
                  {/* AVATAR */}
                  <Avatar
                    className={`w-13 h-13 cursor-pointer ${
                      other?.profilePhoto === "" ? "bg-gray-300" : "bg-none"
                    } `}
                  >
                    <AvatarImage
                      src={
                        chat?.type === "GROUP"
                          ? chat?.avatar
                          : other?.profilePhoto
                      }
                      className="w-13 h-13"
                    />
                    <AvatarFallback>
                      {chat?.type === "GROUP"
                        ? chatNameInitials
                        : fullNameInitials}
                    </AvatarFallback>
                  </Avatar>
                  {/* USERNAME */}
                  {chat?.type === "ONE-TO-ONE" && (
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
                  {chat?.type === "GROUP" && (
                    <div className="flex flex-col">
                      <span className="font-semibold text-[1rem]">
                        {chat?.name}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {chat.participants.length} Members
                      </span>
                    </div>
                  )}
                  {/* CHAT MENU TRIGGER */}
                  <div
                    title="Menu"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowChatMenu(true);
                      setSelectedChat(chat);
                    }}
                    className="absolute right-3 opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal size={25} className="text-gray-500" />
                  </div>
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
      {/* CHAT MENU */}
      {showChatMenu && (
        <>
          {/* CHAT MENU OVERLAY */}
          <div className="absolute w-full h-full flex flex-col items-start justify-start rounded-xl bg-white z-[150]">
            {/* MENU HEADER */}
            <div className="w-full flex items-center gap-3 px-3 py-3.5 border-b-2 border-gray-200">
              {/* BACK BUTTON */}
              <div
                className="cursor-pointer"
                onClick={() => {
                  setSelectedChat([]);
                  setShowChatMenu(false);
                }}
              >
                <ArrowLeft size={25} className="hover:text-gray-500" />
              </div>
              {/* TEXT */}
              <h6 className="text-[1.1rem] font-semibold">Chat Actions</h6>
            </div>
            {/* CHAT ACTIONS SECTION */}
            <div className="w-full flex items-start justify-start flex-col p-2">
              {/* DELETE CHAT */}
              <div
                className="w-full p-2 flex items-center justify-between rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={deleteChatHandler}
              >
                <span className="font-semibold">Delete Chat</span>
                {deleteLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Trash2 size={22} />
                )}
              </div>
              {/* MUTE CHAT */}
              <div className="w-full p-2 flex items-center justify-between rounded-md hover:bg-gray-100 cursor-pointer">
                <span className="font-semibold">Mute Chat</span>
                <BellOff size={22} />
              </div>
              {/* PIN CHAT */}
              <div className="w-full p-2 flex items-center justify-between rounded-md hover:bg-gray-100 cursor-pointer">
                <span className="font-semibold">Pin Chat</span>
                <Pin size={22} />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ChatsList;
