// <= IMPORTS =>
import { useSelector } from "react-redux";
import axiosClient from "@/utils/axiosClient";
import { useInfiniteQuery } from "@tanstack/react-query";

const useInfiniteMessages = () => {
  // GETTING CHAT USER & CURRENT CONVERSATION FROM CHAT SLICE
  const { chatUser, currentConversation } = useSelector((store) => store.chat);
  // SETTING CHAT USER ID BASED ON IF PRESENT
  const chatUserID = chatUser?._id;
  // SETTING CONVERSATION ID BASED ON IF PRESENT
  const conversationID = currentConversation?._id;
  // USING INFINITE QUERY FROM REACT QUERY
  const infiniteQuery = useInfiniteQuery({
    queryKey: ["messages", conversationID, chatUserID],
    queryFn: ({ pageParam = null }) => {
      // SETTING URL BASED ON WHICH ID IS PRESENT
      const URL = conversationID
        ? `/message/conversation/${conversationID}/messages`
        : `/message/all/${chatUserID}`;
      // RETURNING RESPONSE
      return axiosClient
        .get(URL, { params: { limit: 15, cursor: pageParam } })
        .then((res) => res.data);
    },
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
    cacheTime: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 2,
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
