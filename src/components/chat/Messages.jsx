// <= IMPORTS =>
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import axiosClient from "@/utils/axiosClient";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import useInfiniteMessages from "@/hooks/useInfiniteMessages";
import { processMessagesWithDividers } from "@/utils/dateUtils";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import React, { useCallback, useEffect, useRef, useState } from "react";

const Messages = React.memo(({ scrollContainerRef }) => {
  // NAVIGATION
  const navigate = useNavigate();
  // REFS FOR EACH INDIVIDUAL MESSAGE
  const messageRefs = useRef([]);
  // CLEANING UP REFS ON EACH RENDER
  messageRefs.current = [];
  // JUMP TO UNREAD SCROLL FLAG
  const didJumpToUnread = useRef(false);
  // BOTTOM POSITION TRACKING REF
  const isAtBottomRef = useRef(true);
  // INTERSECTION OBSERVER AT THE TOP
  const topMessageRef = useRef();
  // LAST MESSAGE IF REF
  const lastMessageIdRef = useRef(null);
  // INITIAL SCROLL TRACKING REF ON CHAT OPEN
  const didInitialScroll = useRef(false);
  // QUERY CLIENT INSTANCE
  const queryClient = useQueryClient();
  // CURRENT USER CREDENTIALS FROM AUTH SLICE
  const { user } = useSelector((store) => store.auth);
  // FIRST UNREAD MESSAGE INDEX STATE
  const [firstUnreadIdx, setFirstUnreadIdx] = useState(null);
  // FIRST UNREAD MESSAGE REF
  const firstUnreadIdxRef = useRef(firstUnreadIdx);
  // REFERENCE MESSAGE REF
  const referenceMessage = useRef({ id: null, topOffset: 0, index: 0 });
  // GETTING CHAT USER FROM CHAT SLICE
  const { chatUser, currentConversation } = useSelector((store) => store.chat);
  // USING USE INFINITE MESSAGES HOOK
  const {
    allMessages,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: initialLoading,
  } = useInfiniteMessages();
  // PROCESSING MESSAGES WITH DAY DIVIDERS USING UTILITY FUNCTION
  const processedItems = processMessagesWithDividers(allMessages);
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
      // FINDING FIRST VISIBLE MESSAGE IN VIEWPORT
      const firstVisibleIndex = messageRefs.current.findIndex((ref) => {
        if (!ref) return false;
        const rect = ref.getBoundingClientRect();
        return rect.top >= container.getBoundingClientRect().top;
      });
      if (firstVisibleIndex >= 0) {
        const refMessage = messageRefs.current[firstVisibleIndex];
        referenceMessage.current = {
          id: allMessages[firstVisibleIndex]._id,
          topOffset:
            refMessage.getBoundingClientRect().top -
            container.getBoundingClientRect().top,
          index: firstVisibleIndex,
        };
      }
      fetchNextPage();
    },
    [
      allMessages,
      hasNextPage,
      fetchNextPage,
      initialLoading,
      scrollContainerRef,
      isFetchingNextPage,
    ]
  );
  // PREVIOUS MESSAGES COUNT REF
  const previousMessagesCount = useRef(allMessages.length);
  // SETTING THE VAlUE OF FIRST UNREAD IDX REF
  useEffect(() => {
    firstUnreadIdxRef.current = firstUnreadIdx;
  }, [firstUnreadIdx]);
  // BUMPING UNREAD ON MESSAGE PREPENDING
  useEffect(() => {
    // OLD MESSAGES LENGTH
    const oldMessagesLength = previousMessagesCount.current;
    const newMessagesLength = allMessages.length;
    // AVOIDING MESSAGE PREPENDING TO THE UNREAD DIVIDER LINE
    if (
      didJumpToUnread.current &&
      oldMessagesLength > 0 &&
      newMessagesLength > oldMessagesLength
    ) {
      // BUMPING THE UNREAD INDEX ON MESSAGE PREPEND
      setFirstUnreadIdx((idx) =>
        idx !== null ? idx + (newMessagesLength - oldMessagesLength) : null
      );
    }
    // SETTING THE REF FOR NEXT MESSAGE PREPEND ACTION
    previousMessagesCount.current = newMessagesLength;
  }, [allMessages.length]);
  // RESETTING THE DID JUMP TO UNREAD FLAG
  useEffect(() => {
    didJumpToUnread.current = false;
  }, [currentConversation?._id]);
  // EFFECT TO RENDER THE UNREAD LINE IN THE MESSAGES
  useEffect(() => {
    // CONDITIONS FOR EARLY RETURN
    if (
      !currentConversation ||
      currentConversation.unreadMessages === 0 ||
      allMessages.length === 0
    ) {
      return;
    }
    // IF WE HAVEN'T JUMPED TO UNREAD MESSAGE YET
    if (!didJumpToUnread.current) {
      // FINDING THE CURRENT USER PARTICIPANT RECORD
      const userConversationPart = currentConversation?.participants?.find(
        (p) => p.userId._id === user?._id
      );
      // EXTRACTING THE LAST READ
      const lastRead = userConversationPart?.lastRead;
      // IF WE HAVE LAST READ TIMESTAMP, COMPUTING THE UNREAD
      if (lastRead) {
        // FINDING THE FIRST AFTER LAST READ WITH UNREAD DATE
        const messageIndex = allMessages.findIndex(
          (msg) =>
            msg.senderId._id !== user?._id &&
            !msg.seenBy?.some((sb) => String(sb?.userId) === user?._id) &&
            new Date(msg.createdAt) > new Date(lastRead)
        );
        // SETTING THE INDEX OF THE FIRST UNREAD INDEX
        setFirstUnreadIdx(messageIndex >= 0 ? messageIndex : null);
      }
      // SETTING THE JUMP FLAG
      didJumpToUnread.current = true;
    }
  }, [allMessages, currentConversation, user?._id]);
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
      if (isAtBottom && firstUnreadIdxRef.current !== null) {
        setFirstUnreadIdx(null);
      }
    };
    // ADDING EVENT LISTENER ON CONTAINER
    container.addEventListener("scroll", onScroll);
    // CLEANUP FUNCTION
    return () => container.removeEventListener("scroll", onScroll);
  }, [scrollContainerRef]);
  // AUTOMATICALLY HIDING THE UNREAD BAR WHEN THERE IS NO SCROLL
  useEffect(() => {
    // CONTAINER
    const container = scrollContainerRef.current;
    // IF CONTAINER HAS NO SCROLL YET
    if (
      firstUnreadIdx !== null &&
      container &&
      container.scrollHeight <= container.clientHeight
    ) {
      // TIMEOUT FUNCTION TO HIDE AFTER 5 SECONDS
      const timer = setTimeout(() => {
        setFirstUnreadIdx(null);
      }, 5000);
      // CLEARING TIMEOUT
      return () => clearTimeout(timer);
    }
  }, [firstUnreadIdx, scrollContainerRef]);
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
    // IF THE REFERENCE MESSAGE EXISTS
    if (referenceMessage.current.id) {
      // FINDING THE INDEX OF REFERENCE MESSAGE IN NEW MESSAGES LIST
      const newIndex = allMessages.findIndex(
        (msg) => msg._id === referenceMessage.current.id
      );
      // POSITIONING THE REFERENCE MESSAGE IN THE VIEWPORT TO ITS ORIGINAL POSITION
      if (newIndex >= 0 && messageRefs.current[newIndex]) {
        const refMessage = messageRefs.current[newIndex];
        const containerRect = container.getBoundingClientRect();
        const currentOffset =
          refMessage.getBoundingClientRect().top - containerRect.top;
        const offsetDifference =
          currentOffset - referenceMessage.current.topOffset;
        container.scrollTop += offsetDifference;
      }
    }
    // RESETTING REFERENCE MESSAGE
    referenceMessage.current = { id: null, topOffset: 0, index: 0 };
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
      lastMessageId !== lastMessageIdRef.current
    ) {
      // SCROLLING TO BOTTOM
      container.scrollTop = container.scrollHeight;
    }
    // SETTING PREVIOUS MESSAGES REF FOR NEXT TIME
    lastMessageIdRef.current = lastMessageId;
  }, [allMessages, scrollContainerRef]);
  // MARKING THE CONVERSATION AS READ AFTER FETCHING MESSAGES
  useEffect(() => {
    // IF LOADING OR NO CONVERSATION YET
    if (
      initialLoading ||
      !currentConversation?._id ||
      currentConversation?.unreadMessages === 0
    )
      return;
    // MARKING ROOM READ
    const markChatRead = async () => {
      // MAKING REQUEST
      try {
        await axiosClient.get(`/message/markRead/${currentConversation?._id}`);
        // CLEARING THE UNREAD BADGE & UPDATING LAST READ FOR THE CONVERSATION
        queryClient.setQueryData(["conversations"], (old) => {
          if (!old) return old;
          const newPages = old.pages.map((page) => ({
            ...page,
            conversations: page.conversations.map((c) => {
              if (c._id !== currentConversation?._id) return c;
              const updatedParticipants = c.participants.map((p) =>
                p.userId._id === user?._id
                  ? { ...p, lastRead: new Date().toISOString() }
                  : p
              );
              return {
                ...c,
                unreadMessages: 0,
                participants: updatedParticipants,
              };
            }),
          }));
          return { ...old, pages: newPages };
        });
      } catch (error) {
        // LOGGING ERROR TO CONSOLE
        console.error("Error marking Chat Read!", error);
      }
    };
    markChatRead();
  }, [initialLoading, queryClient, currentConversation, user?._id]);
  // MAKING TO SCROLL POSITIONED AT FIRST UNREAD MESSAGE ON LOAD
  useEffect(() => {
    // IF INITIAL LOADING
    if (
      initialLoading ||
      !currentConversation ||
      didJumpToUnread.current ||
      currentConversation?.unreadMessages === 0
    )
      return;
    // FINDING THE CURRENT USER PARTICIPANT RECORD
    const userConversationPart = currentConversation?.participants?.find(
      (p) => p.userId._id === user?._id
    );
    // EXTRACTING THE LAST READ
    const lastRead = userConversationPart?.lastRead;
    // IF NO LAST READ SET YET
    if (!lastRead) {
      // JUMP TO UNREAD SCROLL FLAG
      didJumpToUnread.current = true;
      return;
    }
    // FINDING THE FIRST AFTER LAST READ WITH UNREAD DATE
    const messageIndex = allMessages.findIndex(
      (msg) =>
        msg.senderId._id !== user?._id &&
        !msg.seenBy?.some((sb) => String(sb?.userId) === user?._id) &&
        new Date(msg.createdAt) > new Date(lastRead)
    );
    // APPLYING THE SCROLL ONLY WHEN UNREAD AVAILABLE
    if (messageIndex >= 0) {
      // SETTING NODE ON THE THAT REF
      const node = messageRefs.current[messageIndex];
      // SETTING SCROLL
      node?.scrollIntoView({ block: "start" });
    } else {
      scrollContainerRef.current?.scrollTo(
        0,
        scrollContainerRef.current.scrollHeight
      );
    }
    // JUMP TO UNREAD SCROLL FLAG
    didJumpToUnread.current = true;
  }, [
    user?._id,
    allMessages,
    initialLoading,
    currentConversation,
    scrollContainerRef,
  ]);
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
        <div className="w-full pt-4 flex flex-col items-center justify-center">
          {/* AVATAR */}
          <Avatar
            className={`w-20 h-20 cursor-pointer ${
              chatUser?.profilePhoto === "" ? "bg-gray-300" : "bg-none"
            } `}
          >
            <AvatarImage
              src={
                currentConversation?.type === "GROUP"
                  ? currentConversation?.avatar
                  : chatUser?.profilePhoto
              }
              className="w-20 h-20"
            />
            <AvatarFallback>
              {currentConversation?.type === "GROUP"
                ? currentConversationName
                : fullNameInitialsChatUser}
            </AvatarFallback>
          </Avatar>
          {/* FULLNAME */}
          <h1 className="font-semibold text-[1.3rem] mt-1">
            {currentConversation?.type === "GROUP"
              ? currentConversation?.name
              : chatUser?.fullName}
          </h1>
          {/* USERNAME */}
          <span className="text-[1rem] text-gray-500">
            {currentConversation?.type === "GROUP"
              ? `${currentConversation?.participants.length} Members`
              : chatUser?.username}
          </span>
          {/* VIEW PROFILE */}
          {currentConversation?.type !== "GROUP" && (
            <Button
              onClick={() => navigate(`/home/profile/${chatUser._id}`)}
              type="button"
              className="bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer mt-2"
            >
              View Profile
            </Button>
          )}
          {/* VIEW SETTINGS */}
          {currentConversation?.type === "GROUP" && (
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
        <section className={`w-full flex flex-col`}>
          {processedItems?.map((item, idx) => {
            // RENDERING DAY DIVIDER
            if (item.type === "DIVIDER") {
              return (
                <div
                  key={item.id}
                  className="w-full  flex items-center justify-center my-4"
                >
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-500 font-bold">
                    <span>{item.label}</span>
                  </div>
                </div>
              );
            }
            // FINDING THE ORIGINAL MESSAGE INDEX IF IT IS A MESSAGE
            const originalMessageIndex = allMessages.findIndex(
              (msg) => msg._id === item._id
            );
            // CURRENT USER
            const isMe = item?.senderId?._id === user?._id;
            // GETTING ACTUAL PREVIOUS MESSAGE & NOT DIVIDER
            const prevMessageItem = processedItems
              .slice(0, idx)
              .reverse()
              .find((prevItem) => prevItem.type === "MESSAGE");
            // CHECKING THE SENDER OF THE NEW MESSAGE
            const isNewGroup =
              !prevMessageItem ||
              prevMessageItem.senderId._id !== item?.senderId?._id;
            // CALCULATING THE GAP
            const marginTop = isNewGroup ? "mt-2" : "mt-1";
            // REF FOR EACH INDIVIDUAL MESSAGE
            const refForThis = (el) => {
              messageRefs.current[originalMessageIndex] = el;
            };
            return (
              <React.Fragment key={item._id}>
                {/* UNREAD LINE SEPARATOR */}
                {originalMessageIndex === firstUnreadIdx && (
                  <div className="w-full bg-gray-200 h-0.5 rounded-full flex items-center justify-center relative my-6 text-center">
                    <span className="rounded-full absolute text-xs text-gray-500 bg-white px-6 py-2 w-fit">
                      <span className="font-semibold">
                        {allMessages.length - originalMessageIndex}
                      </span>{" "}
                      unread{" "}
                      {`${
                        allMessages.length - originalMessageIndex === 1
                          ? "message"
                          : "messages"
                      }`}
                    </span>
                  </div>
                )}
                {/* MESSAGE BUBBLE */}
                <div
                  ref={refForThis}
                  className={`flex ${
                    isMe ? "justify-end" : "justify-start"
                  } ${marginTop}`}
                >
                  {/* MESSAGE TEXT */}
                  <div
                    className={`${
                      isMe ? "text-white bg-sky-400" : "text-black bg-gray-200"
                    } px-3 py-1.5 rounded-2xl text-[0.9rem] max-w-[70%] break-words whitespace-pre-line leading-snug`}
                  >
                    {item.message}
                  </div>
                </div>
              </React.Fragment>
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
