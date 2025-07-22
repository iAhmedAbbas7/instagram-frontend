// <= IMPORTS =>
import { useMemo } from "react";
import axiosClient from "@/utils/axiosClient";
import { useInfiniteQuery } from "@tanstack/react-query";

const useConversations = () => {
  // USING INFINITE QUERY FROM REACT QUERY
  const infiniteQuery = useInfiniteQuery({
    queryKey: ["conversations"],
    queryFn: ({ pageParam = null }) =>
      axiosClient
        .get(`/message/conversations`, {
          params: { limit: 10, cursor: pageParam },
        })
        .then((res) => res.data),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    cacheTime: 1000 * 60 * 10,
    staleTime: 1000 * 60 * 2,
  });
  // FLATTENING CONVERSATIONS IN TO ONE ARRAY FOR RENDERING
  const allConversations = useMemo(() => {
    return infiniteQuery.data?.pages.flatMap((p) => p.conversations) ?? [];
  }, [infiniteQuery.data]);
  // UNREAD CONVERSATION COUNT
  const unreadConversationCount = useMemo(() => {
    return allConversations.filter((c) => c?.unreadMessages > 0).length;
  }, [allConversations]);
  // FLATTENING ALL CHAT USER IDS IN TO ONE ARRAY FOR RENDERING
  const chatUsers = useMemo(() => {
    // GETTING IDS FROM THE CHAT USERS ARRAY
    const userIds = infiniteQuery.data
      ? infiniteQuery.data.pages.flatMap((p) => p.chatUsers || [])
      : [];
    return Array.from(new Set(userIds));
  }, [infiniteQuery.data]);
  return {
    chatUsers,
    ...infiniteQuery,
    allConversations,
    unreadConversationCount,
  };
};

export default useConversations;
