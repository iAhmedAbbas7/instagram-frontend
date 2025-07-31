// <= IMPORTS =>
import { toast } from "sonner";
import ChatMenu from "./ChatMenu";
import Messages from "./Messages";
import store from "@/redux/store";
import ChatsList from "./ChatsList";
import { Button } from "../ui/button";
import ChatButton from "./ChatButton";
import axiosClient from "@/utils/axiosClient";
import ScrollToBottom from "./ScrollToBottom";
import GroupChatButton from "./GroupChatButton";
import useSearchUsers from "@/hooks/useSearchUsers";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useCallback, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import useConversations from "@/hooks/useConversations";
import { getImageDataURI } from "@/utils/getImageDataURI";
import { useLocation, useNavigate } from "react-router-dom";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { setChatUser, setCurrentConversation } from "@/redux/chatSlice";
import {
  ArrowLeftIcon,
  CheckCircle2,
  Circle,
  Edit,
  Eye,
  EyeOff,
  Loader2,
  Maximize,
  MessageCircleMore,
  MoreVertical,
  PlusSquare,
  Search,
  SearchX,
  Trash2,
  UserLock,
  UsersIcon,
  X,
} from "lucide-react";

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
  // GROUP AVATAR FILE INPUT REF
  const groupAvatarRef = useRef();
  // SCROLL CONTAINER REF
  const scrollContainerRef = useRef();
  // GROUP NAME STATE MANAGEMENT
  const [groupName, setGroupName] = useState("");
  // GROUP AVATAR STATE MANAGEMENT
  const [groupAvatar, setGroupAvatar] = useState("");
  // GROUP AVATAR PREVIEW STATE MANAGEMENT
  const [avatarPreview, setAvatarPreview] = useState(null);
  // SHOW GROUP ADMIN VISIBILITY STATE
  const [showAdmin, setShowAdmin] = useState(true);
  // GROUP MEMBERS VISIBILITY STATE
  const [showMembers, setShowMembers] = useState(false);
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
  // GETTING ALL CONVERSATIONS FROM CONVERSATIONS HOOK
  const { chatUsers, unreadConversationCount } = useConversations();
  // GETTING CHAT USER FROM CHAT SLICE
  const { chatUser } = useSelector((store) => store.chat);
  // GETTING CURRENT USER & SUGGESTED USERS FROM AUTH SLICE
  const { user, suggestedUsers } = useSelector((store) => store.auth);
  // GETTING CURRENT CONVERSATION AS CHAT FROM CHAT SLICE
  const { currentConversation: chat } = useSelector((store) => store.chat);
  // SEND MESSAGE HANDLER
  const sendMessageHandler = async (receiverId) => {
    try {
      // CHECKING THE TYPE OF CURRENT CONVERSATION
      const isChat = chat?.type === "GROUP";
      // SETTING THE URL BASED ON CURRENT CONVERSATION TYPE
      const URL = isChat
        ? `/message/conversation/${chat._id}/send`
        : `/message/send/${receiverId}`;
      // MAKING REQUEST
      const response = await axiosClient.post(
        URL,
        { message: messageText },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // GETTING CHAT USER & CURRENT CONVERSATION FROM GLOBAL REDUX STORE
      const { currentConversation } = store.getState().chat;
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // CLEARING MESSAGE FIELD
        setMessageText("");
        // SETTING CURRENT CONVERSATION ID FROM CURRENT CONVERSATION
        const conversationID = currentConversation?._id;
        // SETTING QUERY KEY FOR SETTING QUERY DATA
        const queryKey = conversationID;
        // IF QUERY KEY EXISTS, APPENDING MESSAGE TO HE CHAT
        if (queryKey) {
          // GETTING NEWLY CREATED MESSAGE FROM RESPONSE
          const newMessage = response.data.populatedMessage;
          // OPTIMISTICALLY APPENDING THE NEW MESSAGE TO THE CHAT MESSAGES
          queryClient.setQueryData(["messages", queryKey], (oldData) => {
            // IF NO PREVIOUS DATA RETURNING CURRENT DATA
            if (!oldData) return oldData;
            // GETTING THE CURRENT PAGE 1 OF DATA
            const previousData = oldData.pages[0];
            // CHECKING IF THE MESSAGE IS ALREADY APPENDED
            if (previousData?.messages[0]?._id === newMessage._id) {
              return oldData;
            }
            // SETTING NEW PAGES FOR MESSAGES
            const newPages = [...oldData.pages];
            // APPENDING NEW MESSAGE TO THE FIRST PAGE OF PAGES
            newPages[0] = {
              ...newPages[0],
              // APPENDING NEW MESSAGE AT THE TOP OF FIRST PAGE
              messages: [newMessage, ...newPages[0].messages],
            };
            return { ...oldData, pages: newPages };
          });
        }
        // UPDATING THE SENDER'S LAST READ TO KEEP UI IN SYNC
        if (conversationID) {
          // CLEARING THE UNREAD BADGE & UPDATING LAST READ FOR THE CONVERSATION
          queryClient.setQueryData(["conversations"], (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                conversations: page.conversations.map((c) =>
                  c._id === conversationID
                    ? {
                        ...c,
                        participants: c.participants.map((p) =>
                          p.userId._id === user?._id
                            ? { ...p, lastRead: new Date().toISOString() }
                            : p
                        ),
                      }
                    : c
                ),
              })),
            };
          });
        }
        // UPDATING THE LAST READ ON THE SERVER TO UPDATE LAST READ
        if (conversationID) {
          axiosClient
            .get(`/message/markRead/${conversationID}`)
            .catch((error) => console.log(error));
        }
        // IF NO CONVERSATION SET
        if (!currentConversation) {
          // MERGING THE RETURNED CONVERSATION IN THE CACHED CONVERSATIONS LIST
          const conversation = response.data.conversation;
          // SETTING QUERY DATA
          queryClient.setQueryData(["conversations"], (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page, i) =>
                i === 0
                  ? {
                      ...page,
                      conversations: [
                        conversation,
                        ...page.conversations.filter(
                          (c) => c._id !== conversation._id
                        ),
                      ],
                    }
                  : page
              ),
            };
          });
          // DISPATCHING THE CURRENT CONVERSATION IN THE LIST
          dispatch(setCurrentConversation(conversation));
        }
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
  // CHANGE FILE HANDLER
  const changeFileHandler = async (e) => {
    // SETTING AVATAR
    const avatar = e.target.files[0];
    // IF AVATAR AVAILABLE
    if (avatar) {
      setGroupAvatar(avatar);
      // GETTING FILE DATA URL
      const imageURL = await getImageDataURI(avatar);
      // SETTING IMAGE PREVIEW
      setAvatarPreview(imageURL);
    }
  };
  // COMPUTING FILTERED SUGGESTED USERS LIST
  const filteredSuggestedUsers = suggestedUsers.filter(
    (u) => !chatUsers.includes(u._id)
  );
  // AVATAR FALLBACK MANAGEMENT FOR CHAT USER
  const fullNameInitialsChatUser = chatUser?.fullName
    ? getFullNameInitials(chatUser?.fullName)
    : "";
  // AVATAR FALLBACK MANAGEMENT FOR CURRENT USER
  const fullNameInitialsCurrentUser = user?.fullName
    ? getFullNameInitials(user?.fullName)
    : "";
  // AVATAR FALLBACK MANAGEMENT FOR CURRENT USER
  const groupChatNameInitials = chat?.name
    ? getFullNameInitials(chat?.name)
    : "";
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
          } bottom-9 right-6 bg-white hover:bg-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.4)] px-5 py-3 cursor-pointer rounded-full min-w-[280px] z-[25]`}
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
          } right-2 bottom-4 w-[400px] h-[95.5vh] bg-white shadow-[0_4px_15px_rgba(0,0,0,0.4)] rounded-lg z-[25] flex flex-col items-start justify-start`}
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
                  dispatch(setCurrentConversation(null));
                }}
              >
                <Edit size={30} />
              </div>
              {/* HEADER */}
              <div className="w-full px-3 py-3.5 flex items-center justify-between border-b-2 border-gray-200">
                {/* TEXT & COUNT */}
                <div className="flex items-center gap-2">
                  <h5 className="text-[1.1rem] font-semibold">Messages</h5>
                  {unreadConversationCount > 0 && (
                    <div className="right-11 p-2.5 w-3 h-3 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {unreadConversationCount}
                      </span>
                    </div>
                  )}
                </div>
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
                        <div className="px-3 w-full h-full flex flex-col items-center justify-center gap-2">
                          <SearchX size={50} className="text-sky-400" />
                          <span className="text-center text-sm text-gray-500">
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
          {/* GROUP-CHAT PANEL STATE */}
          {panelState === "GROUP-CHAT" && (
            <>
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
                        setPanelState("NEW-MESSAGE");
                        dispatch(setChatUser(null));
                        dispatch(setCurrentConversation(null));
                      }}
                    >
                      <ArrowLeftIcon
                        size={25}
                        className="cursor-pointer hover:text-gray-500"
                      />
                    </div>
                    {/* TEXT */}
                    <h5 className="text-[1.1rem] font-semibold">Group Chat</h5>
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
                      dispatch(setCurrentConversation(null));
                    }}
                  >
                    <X
                      size={28}
                      className="cursor-pointer hover:text-gray-500"
                    />
                  </div>
                </div>
                {/* CONTENT SECTION */}
                <div className="w-full flex flex-col items-start flex-1 overflow-y-auto">
                  {/* GROUP PARTICIPANTS SECTION */}
                  <div className="w-full flex flex-col items-start justify-start py-2">
                    {/* ADMIN HEADING */}
                    <div className="w-full flex items-center justify-between px-3 pb-1">
                      {/* TEXT SECTION */}
                      <div className="flex items-center gap-2">
                        <UserLock size={17} />
                        <h4 className="text-sm font-semibold">Admin (You)</h4>
                      </div>
                      {/* SHOW/HIDE */}
                      <div
                        className="cursor-pointer"
                        title={showAdmin ? "Collapse" : "Show"}
                        onClick={() => setShowAdmin((prev) => !prev)}
                      >
                        {showAdmin ? <EyeOff size={17} /> : <Eye size={17} />}
                      </div>
                    </div>
                    {/* CURRENT USER AVATAR & USERNAME */}
                    {showAdmin && (
                      <div className="w-full flex items-center gap-3 hover:bg-gray-100 p-3 cursor-pointer">
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
                            className="w-11 h-11"
                          />
                          <AvatarFallback>
                            {fullNameInitialsCurrentUser}
                          </AvatarFallback>
                        </Avatar>
                        {/* USERNAME */}
                        <div className="flex flex-col">
                          <span className="font-semibold text-[1rem]">
                            {user?.username}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {user.fullName}
                          </span>
                        </div>
                      </div>
                    )}
                    {/* MEMBERS HEADING */}
                    <div className="w-full flex items-center justify-between px-3 py-1">
                      {/* TEXT SECTION */}
                      <div className="flex items-center gap-2">
                        <UsersIcon size={17} />
                        <h4 className="text-sm font-semibold">
                          Members ({selectedUsers.length})
                        </h4>
                      </div>
                      {/* SHOW/HIDE */}
                      <div
                        className="cursor-pointer"
                        title={showMembers ? "Collapse" : "Show"}
                        onClick={() => setShowMembers((prev) => !prev)}
                      >
                        {showMembers ? <EyeOff size={17} /> : <Eye size={17} />}
                      </div>
                    </div>
                    {/* MEMBERS SECTION */}
                    {showMembers && (
                      <div className="w-full flex flex-col items-start justify-start">
                        {selectedUsers?.map((selectedUser) => {
                          // AVATAR FALLBACK MANAGEMENT FOR CURRENT USER
                          const fullNameInitialsSelectedUser =
                            selectedUser?.fullName
                              ? getFullNameInitials(selectedUser?.fullName)
                              : "";
                          return (
                            <>
                              {/* MAIN CONTAINER */}
                              <div
                                key={selectedUser._id}
                                className="w-full flex items-center justify-between hover:bg-gray-100 p-3 cursor-pointer"
                              >
                                {/* AVATAR & USERNAME */}
                                <div className="w-full flex items-center gap-3">
                                  {/* AVATAR */}
                                  <Avatar
                                    className={`w-11 h-11 cursor-pointer ${
                                      selectedUser?.profilePhoto === ""
                                        ? "bg-gray-300"
                                        : "bg-none"
                                    } `}
                                  >
                                    <AvatarImage
                                      src={selectedUser?.profilePhoto}
                                      alt={selectedUser?.fullName}
                                      className="w-11 h-11"
                                    />
                                    <AvatarFallback>
                                      {fullNameInitialsSelectedUser}
                                    </AvatarFallback>
                                  </Avatar>
                                  {/* USERNAME */}
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-[0.975rem]">
                                      {selectedUser?.username}
                                    </span>
                                    <span className="text-gray-500 text-sm">
                                      {selectedUser?.fullName}
                                    </span>
                                  </div>
                                </div>
                                {/* REMOVE ICON */}
                                <div
                                  onClick={() =>
                                    setSelectedUsers((prev) =>
                                      prev.filter(
                                        (u) => u._id !== selectedUser._id
                                      )
                                    )
                                  }
                                  title="Remove"
                                >
                                  <Trash2 size={20} className="text-sky-400" />
                                </div>
                              </div>
                            </>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {/* GROUP NAME */}
                  <div className="w-full px-3">
                    {/* LABEL */}
                    <label
                      htmlFor="groupName"
                      className="text-sm font-semibold"
                    >
                      Group Name
                    </label>
                    {/* INPUT */}
                    <input
                      type="text"
                      id="groupName"
                      name="groupName"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="w-full p-2 border-2 border-gray-200 outline-none focus:outline-none text-gray-500 placeholder:text-sm text-sm rounded-md"
                      placeholder="Group Name"
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </div>
                  {/* GROUP AVATAR */}
                  <div className="w-full px-3 py-2">
                    {/* TEXT & ACTION */}
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-semibold">Group Avatar</h5>
                      <div
                        className="cursor-pointer"
                        onClick={
                          avatarPreview
                            ? () => {
                                setGroupAvatar("");
                                setAvatarPreview("");
                              }
                            : () => groupAvatarRef.current.click()
                        }
                        title={
                          avatarPreview ? "Remove Avatar" : "Choose Avatar"
                        }
                      >
                        {avatarPreview ? (
                          <Trash2 size={17} />
                        ) : (
                          <PlusSquare size={17} />
                        )}
                      </div>
                    </div>
                    {/* AVATAR INPUT */}
                    <input
                      ref={groupAvatarRef}
                      name="avatar"
                      id="avatar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={changeFileHandler}
                    />
                    {/* AVATAR PREVIEW */}
                    <div className="w-full flex items-center justify-center py-6">
                      <Avatar
                        className={`w-25 h-25 ${
                          avatarPreview ? "bg-none" : "bg-gray-200"
                        } flex items-center justify-center`}
                      >
                        <AvatarImage
                          src={avatarPreview}
                          alt="Group Avatar"
                          className="w-25 h-25"
                        />
                      </Avatar>
                    </div>
                  </div>
                </div>
                {/* FOOTER */}
                <div className="w-full flex items-center justify-evenly gap-3 px-5 py-3.5 border-t-2 border-gray-200">
                  {/* DISCARD GROUP */}
                  <Button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setGroupName("");
                      setGroupAvatar("");
                      setSelectedUsers([]);
                      setAvatarPreview(null);
                      dispatch(setChatUser(null));
                      setPanelState("NEW-MESSAGE");
                      dispatch(setCurrentConversation(null));
                    }}
                    className="bg-sky-400 hover:bg-sky-500 text-white text-[1rem] focus:outline-none rounded-md cursor-pointer font-semibold border-none outline-none"
                  >
                    <Trash2 />
                    <h5>Discard Group</h5>
                  </Button>
                  {/* CREATE GROUP */}
                  <GroupChatButton
                    groupName={groupName}
                    groupAvatar={groupAvatar}
                    selectedUsers={selectedUsers}
                    setPanelState={setPanelState}
                  />
                </div>
              </div>
            </>
          )}
          {/* CHAT MENU STATE */}
          {panelState === "MENU" && (
            <>
              <ChatMenu setPanelState={setPanelState} />
            </>
          )}
          {/* ACTIVE CHAT PANEL STATE */}
          {panelState === "CHAT" && (chatUser || chat) !== null && (
            <>
              {/* CHAT MAIN CONTAINER */}
              <div className="w-full h-full flex flex-col items-start justify-between relative">
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
                          chatUser?.profilePhoto || chat?.avatar === ""
                            ? "bg-gray-300"
                            : "bg-none"
                        } `}
                      >
                        <AvatarImage
                          src={
                            chat?.type === "GROUP"
                              ? chat?.avatar
                              : chatUser?.profilePhoto
                          }
                          className="w-12 h-12"
                        />
                        <AvatarFallback>
                          {chat?.type === "GROUP"
                            ? groupChatNameInitials
                            : fullNameInitialsChatUser}
                        </AvatarFallback>
                      </Avatar>
                      {/* USERNAME */}
                      <div className="flex flex-col">
                        <span
                          title={chatUser?.fullName}
                          onClick={() =>
                            chat?.type !== "GROUP" &&
                            navigate(`/home/profile/${chatUser._id}`)
                          }
                          className="font-semibold text-[1rem]"
                        >
                          {chat?.type === "GROUP"
                            ? chat?.name
                            : chatUser?.fullName}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {chat?.type === "GROUP"
                            ? `${chat?.participants?.length} Members`
                            : chatUser?.username}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* ACTIONS */}
                  <div className="flex items-center gap-2">
                    {/* CHAT MENU */}
                    <div
                      title="Menu"
                      onClick={() => {
                        setPanelState("MENU");
                      }}
                    >
                      <MoreVertical
                        size={20}
                        className="cursor-pointer hover:text-gray-500"
                      />
                    </div>
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
                  className="w-full flex-1 flex flex-col items-start justify-start overflow-y-auto py-4"
                  ref={scrollContainerRef}
                >
                  {/* MESSAGES */}
                  <Messages scrollContainerRef={scrollContainerRef} />
                </div>
                {/* SCROLL TO BOTTOM */}
                <ScrollToBottom scrollContainerRef={scrollContainerRef} />
                {/* MESSAGE INPUT */}
                <div className="w-full p-3 bg-white relative flex items-center justify-center rounded-b-lg">
                  <input
                    value={messageText}
                    id="messageText"
                    name="messageText"
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        messageText.trim()
                      ) {
                        e.preventDefault();
                        sendMessageHandler(chatUser?._id);
                      }
                    }}
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
