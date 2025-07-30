// <= IMPORTS =>
import { useSelector } from "react-redux";
import axiosClient from "@/utils/axiosClient";
import { useInfiniteQuery } from "@tanstack/react-query";

const useInfiniteMessages = () => {
  // GETTING CURRENT CONVERSATION FROM CHAT SLICE
  const { currentConversation } = useSelector((store) => store.chat);
  // SETTING CONVERSATION ID BASED ON IF PRESENT
  const conversationID = currentConversation?._id;
  // SETTING QUERY KEY
  const queryKey = conversationID;
  // USING INFINITE QUERY FROM REACT QUERY
  const infiniteQuery = useInfiniteQuery({
    queryKey: ["messages", queryKey],
    queryFn: async ({ pageParam = null }) => {
      // SETTING URL BASED ON WHICH ID IS PRESENT
      const URL = `/message/conversation/${conversationID}/messages`;
      // RETURNING RESPONSE
      return await axiosClient
        .get(URL, { params: { limit: 15, cursor: pageParam } })
        .then((res) => res.data);
    },
    enabled: !!queryKey,
    initialPageParam: null,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 10,
    placeholderData: (previousData) => previousData,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
  });
  // FLATTENING PAGES INTO SINGLE ARRAY & REVERSING ORDER (OLDEST => NEWEST)
  const allMessages =
    infiniteQuery.data?.pages.flatMap((p) => p.messages).reverse() ?? [];
  // RETURNING RESPONSE
  return {
    ...infiniteQuery,
    allMessages,
  };
};

export default useInfiniteMessages;
