// <= IMPORTS =>
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import React, { useCallback, useEffect, useRef } from "react";
import useInfiniteMessages from "@/hooks/useInfiniteMessages";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const Messages = React.memo(({ scrollContainerRef }) => {
  // USING USE INFINITE MESSAGES HOOK
  const {
    allMessages,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: initialLoading,
  } = useInfiniteMessages();
  // NAVIGATION
  const navigate = useNavigate();
  // BOTTOM POSITION TRACKING REF
  const isAtBottomRef = useRef(true);
  // SNAPSHOT FOR PREVIOUS SCROLL HEIGHT
  const previousHeight = useRef(0);
  // SNAPSHOT FOR PREVIOUS MESSAGES COUNT
  const previousMessages = useRef(0);
  // INTERSECTION OBSERVER AT THE TOP
  const topMessageRef = useRef();
  // INITIAL SCROLL TRACKING REF ON CHAT OPEN
  const didInitialScroll = useRef(false);
  // CURRENT USER CREDENTIALS FROM AUTH SLICE
  const { user } = useSelector((store) => store.auth);
  // GETTING CHAT USER FROM CHAT SLICE
  const { chatUser, currentConversation } = useSelector((store) => store.chat);
  // INTERSECTION OBSERVER HANDLER TO FETCH MESSAGES ON SCROLL
  const handleIntersect = useCallback(
    ([entry]) => {
      // CONTAINER REFERENCE
      const container = scrollContainerRef.current;
      if (
        !entry.isIntersecting ||
        !hasNextPage ||
        initialLoading ||
        isFetchingNextPage ||
        !container
      ) {
        return;
      }
      previousHeight.current = container.scrollHeight;
      previousMessages.current = allMessages.length;
      fetchNextPage();
    },
    [
      hasNextPage,
      fetchNextPage,
      initialLoading,
      allMessages.length,
      scrollContainerRef,
      isFetchingNextPage,
    ]
  );
  // TRACKING WHETHER USER IS AT THE BOTTOM OF THE CONTAINER
  useEffect(() => {
    // CONTAINER REFERENCE
    const container = scrollContainerRef.current;
    // IF NO CONTAINER REFERENCE
    if (!container) return;
    // SCROLL OBSERVER HANDLER
    const onScroll = () => {
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        5;
      isAtBottomRef.current = isAtBottom;
    };
    // ADDING EVENT LISTENER ON CONTAINER
    container.addEventListener("scroll", onScroll);
    // STARTING ON SCROLL OBSERVER HANDLER
    onScroll();
    // CLEANUP FUNCTION
    return () => container.removeEventListener("scroll", onScroll);
  }, [scrollContainerRef]);
  // INITIAL SCROLL TO BOTTOM OF THE CONTAINER ON CHAT OPENED
  useEffect(() => {
    // CONTAINER REFERENCE
    const container = scrollContainerRef.current;
    // SETTING INITIAL SCROLL REFERENCE CURRENT VALUE
    if (container && !initialLoading && !didInitialScroll.current) {
      // PLACING THE SCROLL AT THE BOTTOM
      container.scrollTop = container.scrollHeight;
      // SETTING INITIAL SCROLL VALUE
      didInitialScroll.current = true;
    }
  }, [scrollContainerRef, initialLoading, allMessages.length]);
  // SETTING INTERSECTION OBSERVER FOR TRIGGERING FETCH ON SCROLL
  useEffect(() => {
    // CONTAINER REFERENCE
    const container = scrollContainerRef.current;
    // SENTINEL
    const sentinel = topMessageRef.current;
    if (!container || !sentinel) return;
    // SETTING INTERSECTION OBSERVER
    const observer = new IntersectionObserver(handleIntersect, {
      root: container,
      threshold: 0.1,
    });
    // SETTING OBSERVER
    observer.observe(sentinel);
    // CLEANUP FUNCTION
    return () => {
      observer.disconnect();
    };
  }, [handleIntersect, scrollContainerRef]);
  // AFTER FETCHING PREVIOUS MESSAGES, PRESERVING THE ORIGINAL SCROLL
  useEffect(() => {
    // IF FETCHING NEXT PAGE
    if (isFetchingNextPage) return;
    // CONTAINER REFERENCE
    const container = scrollContainerRef.current;
    // IF NO CONTAINER REFERENCE
    if (!container) return;
    // NEW MESSAGES COUNT
    const newMessagesCount = allMessages.length;
    // OLD MESSAGES COUNT
    const oldMessagesCount = previousMessages.current;
    //
    if (oldMessagesCount > 0 && newMessagesCount > oldMessagesCount) {
      const heightDifference = container.scrollHeight - previousHeight.current;
      container.scrollTop = heightDifference;
    }
    previousHeight.current = 0;
    previousMessages.current = 0;
  }, [allMessages, isFetchingNextPage, scrollContainerRef]);
  // AUTO SCROLLING TO THE BOTTOM IS NEAR THE BOTTOM OF CONTAINER
  useEffect(() => {
    // CONTAINER REFERENCE
    const container = scrollContainerRef.current;
    // IF NO CONTAINER REFERENCE
    if (!container) return;
    // SETTING LAST MESSAGE ID
    const lastMessageId = allMessages[allMessages.length - 1]?._id;
    // SCROLLING ON CONDITIONS
    if (
      didInitialScroll.current &&
      isAtBottomRef.current &&
      lastMessageId &&
      lastMessageId !== previousMessages.current
    ) {
      // SCROLLING TO BOTTOM
      container.scrollTop = container.scrollHeight;
    }
    // SETTING PREVIOUS MESSAGES REF FOR NEXT TIME
    previousMessages.current = lastMessageId;
  }, [allMessages, scrollContainerRef]);
  // AVATAR FALLBACK MANAGEMENT FOR CHAT USER
  const fullNameInitialsChatUser = chatUser?.fullName
    ? getFullNameInitials(chatUser?.fullName)
    : "";
  // AVATAR FALLBACK MANAGEMENT FOR CHAT USER
  const currentConversationName = currentConversation?.name
    ? getFullNameInitials(currentConversation?.name)
    : "";
  // IF THE INITIAL LOADING CALL IS ONGOING
  if (initialLoading) {
    return null;
  }
  return (
    <>
      {/* CHAT USER INFO SECTION */}
      {!isFetchingNextPage && (
        <div className="w-full py-4 flex flex-col items-center justify-center">
          {/* AVATAR */}
          <Avatar
            className={`w-20 h-20 cursor-pointer ${
              chatUser?.profilePhoto === "" ? "bg-gray-300" : "bg-none"
            } `}
          >
            <AvatarImage
              src={
                currentConversation.type === "GROUP"
                  ? currentConversation?.avatar
                  : chatUser?.profilePhoto
              }
              className="w-20 h-20"
            />
            <AvatarFallback>
              {currentConversation.type === "GROUP"
                ? currentConversationName
                : fullNameInitialsChatUser}
            </AvatarFallback>
          </Avatar>
          {/* FULLNAME */}
          <h1 className="font-semibold text-[1.3rem] mt-1">
            {currentConversation.type === "GROUP"
              ? currentConversation.name
              : chatUser?.fullName}
          </h1>
          {/* USERNAME */}
          <span className="text-[1rem] text-gray-500">
            {currentConversation.type === "GROUP"
              ? `${currentConversation.participants.length} Members`
              : chatUser?.username}
          </span>
          {/* VIEW PROFILE */}
          {currentConversation.type !== "GROUP" && (
            <Button
              onClick={() => navigate(`/home/profile/${chatUser._id}`)}
              type="button"
              className="bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer mt-2"
            >
              View Profile
            </Button>
          )}
          {/* VIEW SETTINGS */}
          {currentConversation.type === "GROUP" && (
            <Button
              type="button"
              className="bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer mt-2"
            >
              View Settings
            </Button>
          )}
        </div>
      )}
      {/* MESSAGES SECTION */}
      <section className="w-full px-2">
        {/* IF FETCHING PREVIOUS MESSAGES */}
        <div
          ref={topMessageRef}
          className="w-full my-8 flex items-center justify-center"
        >
          {isFetchingNextPage && (
            <Loader2 size={30} className="text-gray-500 animate-spin" />
          )}
        </div>
        {/* MESSAGES SECTION */}
        <section className={`w-full flex flex-col gap-1`}>
          {allMessages?.map((msg) => {
            return (
              <div
                className={`flex ${
                  msg?.senderId?._id === user?._id
                    ? "justify-end"
                    : "justify-start"
                }`}
                key={msg._id}
              >
                {/* MESSAGE TEXT */}
                <div
                  className={`${
                    msg?.senderId?._id === user?._id
                      ? "text-white bg-sky-400"
                      : "text-black bg-gray-200"
                  } px-3 py-1.5 rounded-2xl text-[1rem] max-w-[70%]`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })}
        </section>
      </section>
    </>
  );
});

// COMPONENTS DISPLAY NAME
Messages.displayName = "Messages";

export default Messages;
