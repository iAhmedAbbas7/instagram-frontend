// <= IMPORTS =>
import { useSelector } from "react-redux";
import axiosClient from "@/utils/axiosClient";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

const useInfiniteComments = (postId) => {
  // GETTING CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // CREATING QUERY CLIENT
  const queryClient = useQueryClient();
  // USING INFINITE QUERY FROM REACT QUERY
  const infiniteQuery = useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam = null }) =>
      axiosClient
        .get(`/post/${postId}/comments`, {
          params: { limit: 10, cursor: pageParam },
        })
        .then((res) => res.data),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    cacheTime: 1000 * 60 * 10,
    staleTime: 1000 * 60 * 2,
  });
  // TOTAL COMMENTS
  const totalComments = infiniteQuery.data?.pages[0].totalComments ?? 0;
  // ALL COMMENTS
  const allComments =
    infiniteQuery.data?.pages.flatMap((p) => p.comments) ?? [];
  // POST COMMENT MUTATION
  const postComment = useMutation({
    mutationFn: (text) =>
      axiosClient.post(`/post/${postId}/postComment`, { text }),
    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      const previous = queryClient.getQueryData(["comments", postId]);
      const fakeComment = {
        _id: `temp-` + Date.now(),
        text,
        author: user,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData(["comments", postId], (old) => ({
        pageParams: old.pageParams,
        pages: [
          {
            comments: [fakeComment, ...old.pages[0].comments],
            nextCursor: old.pages[0].nextCursor,
            totalComments: old.pages[0].totalComments + 1,
          },
          ...old.pages.slice(1),
        ],
      }));
      return { previous };
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData(["comments", postId], ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
  return {
    ...infiniteQuery,
    allComments,
    postComment,
    totalComments,
  };
};

export default useInfiniteComments;
