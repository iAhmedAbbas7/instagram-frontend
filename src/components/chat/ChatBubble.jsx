// <= IMPORTS =>
import { toast } from "sonner";
import Messages from "./Messages";
import ChatsList from "./ChatsList";
import { Button } from "../ui/button";
import ChatButton from "./ChatButton";
import axiosClient from "@/utils/axiosClient";
import useSearchUsers from "@/hooks/useSearchUsers";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useCallback, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import useConversations from "@/hooks/useConversations";
import { useLocation, useNavigate } from "react-router-dom";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import {
  ArrowLeftIcon,
  CheckCircle2,
  Circle,
  Edit,
  Loader2,
  Maximize,
  MessageCircleMore,
  Search,
  SearchX,
  X,
} from "lucide-react";
import {
  setChatUser,
  setCurrentConversation,
  setMessages,
} from "@/redux/chatSlice";

const ChatBubble = () => {
  // DISPATCH
  const dispatch = useDispatch();
  // NAVIGATION
  const navigate = useNavigate();
  // LOCATION
  const { pathname } = useLocation();
  // USING USE SEARCH USERS HOOK
  const {
    query,
    loading,
    hasMore,
    setQuery,
    loadMore,
    hasFetched,
    users: searchResults,
  } = useSearchUsers("");
  // USING QUERY CLIENT
  const queryClient = useQueryClient();
  // SCROLL CONTAINER REF
  const scrollContainerRef = useRef();
  // GETTING ALL CONVERSATIONS FROM CONVERSATIONS HOOK
  const { allConversations } = useConversations();
  // MESSAGE TEXT STATE
  const [messageText, setMessageText] = useState("");
  // SETTING PATHNAME FOR CHAT PAGE
  const isChatPage = pathname.startsWith("/home/chat");
  // MESSAGE TRAY STATE
  const [showMessages, setShowMessages] = useState(false);
  // MESSAGES TRAY CONTENT STATE
  const [panelState, setPanelState] = useState("MESSAGES");
  // SELECTED USERS STATE MANAGEMENT
  const [selectedUsers, setSelectedUsers] = useState([]);
  // CURRENT USER CREDENTIALS
  const { suggestedUsers } = useSelector((store) => store.auth);
  // GETTING CHAT USER FROM CHAT SLICE
  const { chatUser, messages, currentConversation } = useSelector(
    (store) => store.chat
  );
  // COMPUTING FILTERED SUGGESTED USERS LIST
  const filteredSuggestedUsers = suggestedUsers.filter(
    (u) =>
      !allConversations.some((c) => c.participants.some((p) => p._id === u._id))
  );
  // AVATAR FALLBACK MANAGEMENT FOR CHAT USER
  const fullNameInitialsChatUser = chatUser?.fullName
    ? getFullNameInitials(chatUser?.fullName)
    : "";
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
        // DISPATCHING THE CONVERSATION IN THE CURRENT CONVERSATION IF NOT SET ALREADY
        if (currentConversation === null) {
          dispatch(setCurrentConversation(response.data.conversation));
        }
        // CLEARING MESSAGE FIELD
        setMessageText("");
        // INVALIDATING CONVERSATION LIST
        queryClient.invalidateQueries(["conversations"]);
      }
    } catch (error) {
      // LOGGING ERROR MESSAGE
      console.error("Failed to Send Message", error);
      // TOASTING ERROR MESSAGE
      toast.error(error?.response?.data?.message || "Failed to Send Message");
    }
  };
  // SETTING UP OBSERVER REF FOR INFINITE SCROLL ON SEARCH RESULTS
  const searchObserverRef = useRef();
  // SETTING LAST REF FOR THE LAST ITEM OF EACH SEARCH RESULTS FETCH
  const lastSearchRef = useCallback(
    (node) => {
      if (loading) return;
      if (searchObserverRef.current) searchObserverRef.current.disconnect();
      searchObserverRef.current = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && hasMore) {
          loadMore();
        }
      });
      if (node) searchObserverRef.current.observe(node);
    },
    [loading, hasMore, loadMore]
  );
  // TOGGLE SELECTED USERS HANDLER
  const toggleSelected = (user) => {
    setSelectedUsers((prev) =>
      prev.find((x) => x._id === user._id)
        ? prev.filter((x) => x._id !== user._id)
        : [...prev, user]
    );
  };
  return (
    <>
      {/* CHAT BUBBLE */}
      {!showMessages && (
        <div
          onClick={() => {
            setShowMessages(true);
            setSelectedUsers([]);
            dispatch(setChatUser(null));
            dispatch(setCurrentConversation(null));
          }}
          className={`${
            isChatPage ? "hidden" : "fixed"
          } bottom-9 right-9 bg-white hover:bg-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.4)] px-5 py-3 cursor-pointer rounded-full min-w-[250px] z-[25]`}
        >
          {/* CHAT BUBBLE CONTENT WRAPPER */}
          <div className="w-f-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircleMore size={30} />
              <h4 className="font-semibold">Messages</h4>
            </div>
          </div>
        </div>
      )}
      {/* MESSAGES TRAY */}
      {showMessages && (
        <div
          className={`${
            isChatPage ? "hidden" : "fixed"
          } right-7 bottom-7 w-[350px] h-[85vh] bg-white shadow-[0_4px_15px_rgba(0,0,0,0.4)] rounded-lg z-[25] flex flex-col items-start justify-start`}
        >
          {/* MESSAGES PANEL STATE */}
          {panelState === "MESSAGES" && (
            <>
              {/* NEW CHAT BUBBLE */}
              <div
                className="rounded-full p-3 flex items-center justify-center bg-white shadow-[0_4px_15px_rgba(0,0,0,0.4)] absolute bottom-3 right-3 z-[100] cursor-pointer hover:bg-gray-100"
                title="New Message"
                onClick={() => {
                  setQuery("");
                  setPanelState("NEW-MESSAGE");
                  setSelectedUsers([]);
                  dispatch(setChatUser(null));
                  dispatch(setMessages([]));
                  dispatch(setCurrentConversation(null));
                }}
              >
                <Edit size={30} />
              </div>
              {/* HEADER */}
              <div className="w-full px-3 py-3.5 flex items-center justify-between border-b-2 border-gray-200">
                {/* TEXT */}
                <h5 className="text-[1.1rem] font-semibold">Messages</h5>
                {/* ACTIONS */}
                <div className="flex items-center gap-3">
                  {/* EXPAND */}
                  <div title="Expand" onClick={() => navigate("/home/chat")}>
                    <Maximize
                      size={20}
                      className="cursor-pointer hover:text-gray-500"
                    />
                  </div>
                  {/* CLOSE */}
                  <div
                    title="Close"
                    onClick={() => {
                      setQuery("");
                      setSelectedUsers([]);
                      setShowMessages(false);
                      setPanelState("MESSAGES");
                      dispatch(setChatUser(null));
                      dispatch(setMessages([]));
                      dispatch(setCurrentConversation(null));
                    }}
                  >
                    <X
                      size={28}
                      className="cursor-pointer hover:text-gray-500"
                    />
                  </div>
                </div>
              </div>
              <ChatsList setPanelState={setPanelState} />
            </>
          )}
          {/* NEW-MESSAGE PANEL STATE */}
          {panelState === "NEW-MESSAGE" && (
            <>
              {/* NEW MESSAGE MAIN CONTAINER */}
              <div className="w-full h-full flex flex-col items-start justify-between">
                {/* HEADER */}
                <div className="w-full px-3 py-3.5 flex items-center justify-between border-b-2 border-gray-200">
                  {/* BACK AND HEADING */}
                  <div className="flex items-center gap-2">
                    {/* BACK BUTTON */}
                    <div
                      title="Go Back"
                      onClick={() => {
                        setQuery("");
                        setPanelState("MESSAGES");
                        setSelectedUsers([]);
                        dispatch(setChatUser(null));
                        dispatch(setMessages([]));
                        dispatch(setCurrentConversation(null));
                      }}
                    >
                      <ArrowLeftIcon
                        size={25}
                        className="cursor-pointer hover:text-gray-500"
                      />
                    </div>
                    {/* TEXT */}
                    <h5 className="text-[1.1rem] font-semibold">New Message</h5>
                  </div>
                  {/* CLOSE BUTTON */}
                  <div
                    title="Close"
                    onClick={() => {
                      setQuery("");
                      setShowMessages(false);
                      setSelectedUsers([]);
                      setPanelState("MESSAGES");
                      dispatch(setChatUser(null));
                      dispatch(setMessages([]));
                      dispatch(setCurrentConversation(null));
                    }}
                  >
                    <X
                      size={28}
                      className="cursor-pointer hover:text-gray-500"
                    />
                  </div>
                </div>
                {/* ACCOUNTS LIST & SEARCH */}
                <div className="w-full flex flex-col items-start flex-1 overflow-y-auto">
                  {/* SEARCH INPUT */}
                  <div className="w-full border-b-2 border-gray-200 relative flex items-center px-3 py-1.5">
                    <input
                      type="text"
                      value={query}
                      name="searchQuery"
                      id="searchQuery"
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full border-none outline-none focus:outline-none text-gray-500 placeholder:text-gray-500 pl-8 pr-3 text-sm placeholder:text-sm"
                      placeholder="Search..."
                      spellCheck="false"
                      autoComplete="off"
                    />
                    <span className="absolute left-3 font-semibold">To:</span>
                  </div>
                  {/* SEARCH RESULTS LIST */}
                  {query && (
                    <>
                      {/* SEARCH RESULTS LOADING */}
                      {loading && (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader2
                            size={30}
                            className="animate-spin text-gray-500"
                          />
                        </div>
                      )}
                      {/* SEARCH RESULTS DISPLAY */}
                      <div className="flex-1 overflow-y-auto flex flex-col items-start justify-start w-full">
                        {searchResults.map((u, idx) => {
                          // SETTING REF ON LAST SEARCH ELEMENT
                          const isLast = idx === searchResults.length - 1;
                          // AVATAR FALLBACK MANAGEMENT
                          const fullNameInitials = u?.fullName
                            ? getFullNameInitials(u?.fullName)
                            : "";
                          // SELECTED FLAG
                          const isSelected = selectedUsers.some(
                            (x) => x._id === u._id
                          );
                          return (
                            <>
                              {/* MAIN CONTAINER */}
                              <div
                                key={u._id}
                                ref={isLast ? lastSearchRef : undefined}
                                onClick={() => toggleSelected(u)}
                                className="w-full p-3 cursor-pointer flex items-center justify-between hover:bg-gray-100"
                              >
                                {/* AVATAR & USERNAME */}
                                <div className="w-full flex items-center gap-3 ">
                                  {/* AVATAR */}
                                  <Avatar
                                    className={`w-11 h-11 cursor-pointer ${
                                      u?.profilePhoto === ""
                                        ? "bg-gray-300"
                                        : "bg-none"
                                    } `}
                                  >
                                    <AvatarImage
                                      src={u?.profilePhoto}
                                      alt={u?.fullName}
                                      className="w-11 h-11"
                                    />
                                    <AvatarFallback>
                                      {fullNameInitials}
                                    </AvatarFallback>
                                  </Avatar>
                                  {/* USERNAME */}
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-[1rem]">
                                      {u?.username}
                                    </span>
                                    <span className="text-gray-500 text-sm">
                                      {u.fullName}
                                    </span>
                                  </div>
                                </div>
                                {/* SELECT ICON */}
                                <div>
                                  {isSelected ? (
                                    <CheckCircle2 className="text-sky-400" />
                                  ) : (
                                    <Circle className="text-sky-400" />
                                  )}
                                </div>
                              </div>
                            </>
                          );
                        })}
                      </div>
                      {/* IF NO SEARCH RESULTS */}
                      {hasFetched && !loading && searchResults.length === 0 && (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                          <SearchX size={50} className="text-sky-400" />
                          <span className="text-sm text-gray-500">
                            No search results for{" "}
                            <span className="font-semibold">
                              &quot;{query}&quot;
                            </span>
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {/* SUGGESTED ACCOUNTS LIST */}
                  {!query && (
                    <div className="flex-1 overflow-y-auto flex flex-col items-start justify-start w-full">
                      {/* HEADING */}
                      {filteredSuggestedUsers.length > 0 && (
                        <>
                          <h4 className="px-3 py-1.5 text-sm font-semibold">
                            Suggested
                          </h4>
                        </>
                      )}
                      {/* SUGGESTIONS LIST */}
                      {filteredSuggestedUsers.map((u) => {
                        // AVATAR FALLBACK MANAGEMENT
                        const fullNameInitials = u?.fullName
                          ? getFullNameInitials(u?.fullName)
                          : "";
                        // SELECTED FLAG
                        const isSelected = selectedUsers.some(
                          (x) => x._id === u._id
                        );
                        return (
                          <>
                            {/* MAIN CONTAINER */}
                            <div
                              key={u}
                              className="w-full flex items-center justify-between hover:bg-gray-100 p-3 cursor-pointer"
                              onClick={() => toggleSelected(u)}
                            >
                              {/* AVATAR & USERNAME */}
                              <div className="w-full flex items-center gap-3">
                                {/* AVATAR */}
                                <Avatar
                                  className={`w-12 h-12 cursor-pointer ${
                                    u?.profilePhoto === ""
                                      ? "bg-gray-300"
                                      : "bg-none"
                                  } `}
                                >
                                  <AvatarImage
                                    src={u?.profilePhoto}
                                    alt={u?.fullName}
                                    className="w-12 h-12"
                                  />
                                  <AvatarFallback>
                                    {fullNameInitials}
                                  </AvatarFallback>
                                </Avatar>
                                {/* USERNAME */}
                                <div className="flex flex-col">
                                  <span className="font-semibold text-[0.975rem]">
                                    {u?.username}
                                  </span>
                                  <span className="text-gray-500 text-sm">
                                    {u?.fullName}
                                  </span>
                                </div>
                              </div>
                              {/* SELECT ICON */}
                              <div>
                                {isSelected ? (
                                  <CheckCircle2 className="text-sky-400" />
                                ) : (
                                  <Circle className="text-sky-400" />
                                )}
                              </div>
                            </div>
                          </>
                        );
                      })}
                      {/* IF NO SUGGESTIONS */}
                      {filteredSuggestedUsers.length === 0 && (
                        <div className="w-full flex-1 flex flex-col items-center justify-center gap-2">
                          <div>
                            <Search size={50} className="text-sky-400" />
                          </div>
                          <span className="text-sm text-gray-500 text-center">
                            Search & find people to <br /> start a chat with
                            them.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* FOOTER */}
                <div className="w-full px-5 py-3.5 border-t-2 border-gray-200">
                  <ChatButton
                    selectedUsers={selectedUsers}
                    setPanelState={setPanelState}
                  />
                </div>
              </div>
            </>
          )}
          {/* ACTIVE CHAT PANEL STATE */}
          {panelState === "CHAT" && chatUser !== null && (
            <>
              {/* CHAT MAIN CONTAINER */}
              <div className="w-full h-full flex flex-col items-start justify-between">
                {/* HEADER */}
                <div className="w-full px-3 py-3.5 flex items-center justify-between border-b-2 border-gray-200">
                  {/* BACK & AVATAR SECTION */}
                  <div className="flex items-center gap-2">
                    {/* BACK BUTTON */}
                    <div
                      title="Go Back"
                      onClick={() => {
                        setQuery("");
                        setSelectedUsers([]);
                        setPanelState("NEW-MESSAGE");
                        dispatch(setChatUser(null));
                        dispatch(setMessages([]));
                        dispatch(setCurrentConversation(null));
                      }}
                    >
                      <ArrowLeftIcon
                        size={25}
                        className="cursor-pointer hover:text-gray-500"
                      />
                    </div>
                    {/* AVATAR & USERNAME */}
                    <div className="flex items-center gap-3 cursor-pointer">
                      {/* AVATAR */}
                      <Avatar
                        onClick={() =>
                          navigate(`/home/profile/${chatUser._id}`)
                        }
                        className={`w-12 h-12 cursor-pointer ${
                          chatUser?.profilePhoto === ""
                            ? "bg-gray-300"
                            : "bg-none"
                        } `}
                      >
                        <AvatarImage
                          src={chatUser?.profilePhoto}
                          alt={chatUser?.fullName}
                          className="w-12 h-12"
                        />
                        <AvatarFallback>
                          {fullNameInitialsChatUser}
                        </AvatarFallback>
                      </Avatar>
                      {/* USERNAME */}
                      <div className="flex flex-col">
                        <span
                          title={chatUser?.fullName}
                          onClick={() =>
                            navigate(`/home/profile/${chatUser._id}`)
                          }
                          className="font-semibold text-[1rem]"
                        >
                          {chatUser?.fullName}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {chatUser?.username}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* ACTIONS */}
                  <div className="flex items-center gap-3">
                    {/* EXPAND */}
                    <div
                      title="Expand"
                      onClick={() => {
                        navigate("/home/chat");
                        dispatch(setChatUser(chatUser));
                      }}
                    >
                      <Maximize
                        size={20}
                        className="cursor-pointer hover:text-gray-500"
                      />
                    </div>
                    {/* CLOSE */}
                    <div
                      title="Close"
                      onClick={() => {
                        setQuery("");
                        setShowMessages(false);
                        setPanelState("MESSAGES");
                        setSelectedUsers([]);
                        dispatch(setChatUser(null));
                        dispatch(setMessages([]));
                        dispatch(setCurrentConversation(null));
                      }}
                    >
                      <X
                        size={28}
                        className="cursor-pointer hover:text-gray-500"
                      />
                    </div>
                  </div>
                </div>
                {/* MESSAGES SECTION */}
                <div
                  className="w-full flex-1 flex flex-col items-start justify-start overflow-y-auto px-3 py-4"
                  ref={scrollContainerRef}
                >
                  {/* CHAT USER INFO SECTION */}
                  <div className="w-full py-4 flex flex-col items-center justify-center">
                    {/* AVATAR */}
                    <Avatar
                      className={`w-20 h-20 cursor-pointer ${
                        chatUser?.profilePhoto === ""
                          ? "bg-gray-300"
                          : "bg-none"
                      } `}
                    >
                      <AvatarImage
                        src={chatUser?.profilePhoto}
                        alt={chatUser?.fullName}
                        className="w-20 h-20"
                      />
                      <AvatarFallback>
                        {fullNameInitialsChatUser}
                      </AvatarFallback>
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
                  <Messages scrollContainerRef={scrollContainerRef} />
                </div>
                {/* MESSAGE INPUT */}
                <div className="w-full p-3 bg-white relative flex items-center justify-center rounded-b-lg">
                  <input
                    value={messageText}
                    id="messageText"
                    name="messageText"
                    onChange={(e) => setMessageText(e.target.value)}
                    type="text"
                    className="w-full border-gray-200 outline-none focus:outline-none border-2 rounded-full pl-4 pr-15 py-2 text-gray-500 placeholder:text-gray-500 text-sm placeholder:text-sm"
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
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBubble;
