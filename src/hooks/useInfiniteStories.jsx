// <== IMPORTS  ==>
import { useMemo } from "react";
import axiosClient from "@/utils/axiosClient";
import { useInfiniteQuery } from "@tanstack/react-query";

const useInfiniteStories = ({ limit = 20 } = {}) => {
  // USING INFINITE QUERY FROM REACT QUERY
  const infiniteQuery = useInfiniteQuery({
    queryKey: ["stories", "tray"],
    queryFn: async ({ pageParam = null }) => {
      // AWAITING RESPONSE
      const response = await axiosClient.get(`/story/tray`, {
        params: { limit, cursor: pageParam },
      });
      // RETURNING RESPONSE
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage?.nextCursor ?? null;
    },
    cacheTime: 1000 * 60 * 10,
    staleTime: 1000 * 60 * 2,
  });
  // FLATTENED ARRAY OF ALL OWNER STORIES
  const allStories = useMemo(() => {
    return (
      infiniteQuery?.data?.pages.flatMap((p) => {
        return p?.tray || [];
      }) ?? []
    );
  }, [infiniteQuery?.data]);
  // RETURNING DATA
  return {
    allStories,
    ...infiniteQuery,
  };
};
export default useInfiniteStories;
