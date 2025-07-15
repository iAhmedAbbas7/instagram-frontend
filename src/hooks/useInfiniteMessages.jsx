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
  // SETTING QUERY KEY
  const queryKey = conversationID || chatUserID;
  // USING INFINITE QUERY FROM REACT QUERY
  const infiniteQuery = useInfiniteQuery({
    queryKey: ["messages", queryKey],
    queryFn: async ({ pageParam = null }) => {
      // SETTING URL BASED ON WHICH ID IS PRESENT
      const URL = conversationID
        ? `/message/conversation/${conversationID}/messages`
        : `/message/all/${chatUserID}`;
      // RETURNING RESPONSE
      return await axiosClient
        .get(URL, { params: { limit: 15, cursor: pageParam } })
        .then((res) => res.data);
    },
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 10,
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
