// <= IMPORTS =>
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
  const allConversations =
    infiniteQuery.data?.pages.flatMap((p) => p.conversations) ?? [];
  return {
    ...infiniteQuery,
    allConversations,
  };
};

export default useConversations;
