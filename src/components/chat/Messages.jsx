// <= IMPORTS =>
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import axiosClient from "@/utils/axiosClient";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useRef } from "react";
import useInfiniteMessages from "@/hooks/useInfiniteMessages";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

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
  // SNAPSHOT FOR PREVIOUS SCROLL HEIGHT
  const previousHeight = useRef(0);
  // SNAPSHOT FOR PREVIOUS MESSAGES COUNT
  const previousMessages = useRef(0);
  // INTERSECTION OBSERVER AT THE TOP
  const topMessageRef = useRef();
  // INITIAL SCROLL TRACKING REF ON CHAT OPEN
  const didInitialScroll = useRef(false);
  // QUERY CLIENT INSTANCE
  const queryClient = useQueryClient();
  // CURRENT USER CREDENTIALS FROM AUTH SLICE
  const { user } = useSelector((store) => store.auth);
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
  // RESETTING THE DID JUMP TO UNREAD FLAG
  useEffect(() => {
    didJumpToUnread.current = false;
  }, [currentConversation?._id]);
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
      (msg) => new Date(msg.createdAt) > new Date(lastRead)
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
        <div className="w-full py-4 flex flex-col items-center justify-center">
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
          {allMessages?.map((msg, idx) => {
            // CURRENT USER
            const isMe = msg?.senderId?._id === user?._id;
            // LATEST MESSAGE
            const lastMessage = allMessages[idx - 1];
            // CHECKING THE SENDER OF THE NEW MESSAGE
            const isNewGroup =
              !lastMessage || lastMessage.senderId._id !== msg?.senderId?._id;
            // CALCULATING THE GAP
            const marginTop = isNewGroup ? "mt-2" : "mt-1";
            // REF FOR EACH INDIVIDUAL MESSAGE
            const refForThis = (el) => {
              messageRefs.current[idx] = el;
            };
            return (
              <div
                ref={refForThis}
                className={`flex ${
                  isMe ? "justify-end" : "justify-start"
                } ${marginTop}`}
                key={msg._id}
              >
                {/* MESSAGE TEXT */}
                <div
                  className={`${
                    isMe ? "text-white bg-sky-400" : "text-black bg-gray-200"
                  } px-3 py-1.5 rounded-2xl text-[0.9rem] max-w-[70%] break-words whitespace-pre-line leading-snug`}
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
