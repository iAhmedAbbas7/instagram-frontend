// <= IMPORTS =>
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useCallback, useEffect, useRef } from "react";
import useInfiniteMessages from "@/hooks/useInfiniteMessages";

const Messages = ({ scrollContainerRef }) => {
  // USING USE INFINITE MESSAGES HOOK
  const {
    allMessages,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: initialLoading,
  } = useInfiniteMessages();
  // CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // INTERSECTION OBSERVER AT THE TOP MESSAGE OF THE EACH PAGE
  const topMessageRef = useRef();
  // INTERSECTION OBSERVER TO FETCH MESSAGES TRIGGERED ON SCROLL
  const handleIntersect = useCallback(
    ([entry]) => {
      if (entry.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, fetchNextPage]
  );
  // SETTING INTERSECTION OBSERVER
  useEffect(() => {
    if (!topMessageRef.current) return;
    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      threshold: 0.1,
    });
    observer.observe(topMessageRef.current);
    // CLEANUP FUNCTION
    return () => {
      observer.disconnect();
    };
  }, [handleIntersect]);
  // SCROLL ALWAYS AT THE BOTTOM WHEN CHAT IS OPENED
  useEffect(() => {
    if (!initialLoading && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [initialLoading, allMessages.length, scrollContainerRef]);
  // IF THE INITIAL LOADING CALL IS ONGOING
  if (initialLoading) {
    return null;
  }
  return (
    // MESSAGES MAIN WRAPPER
    <section className="w-full pt-[3rem] px-4">
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
  );
};

export default Messages;
