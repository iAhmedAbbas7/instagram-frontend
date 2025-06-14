// <= IMPORTS =>
import { useDispatch } from "react-redux";
import axiosClient from "@/utils/axiosClient";
import { useCallback, useEffect, useState } from "react";
import { appendPosts, setPosts } from "@/redux/postSlice";

const useGetInfinitePosts = (pageSize = 10) => {
  // DISPATCH
  const dispatch = useDispatch();
  // STATE MANAGEMENT
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  // SETTING LIMIT NUMBER
  const limitNumber = pageSize;
  // SETTING SKIP NUMBER
  const skipNumber = page * pageSize;
  // FETCHING POSTS
  const fetchPosts = useCallback(async () => {
    // LOADING STATE
    setLoading(true);
    try {
      // MAKING REQUEST
      const response = await axiosClient.get(
        `/post/getAllPosts?skip=${skipNumber}&limit=${limitNumber}`
      );
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        if (page === 0) {
          dispatch(setPosts(response.data.posts));
        } else {
          dispatch(appendPosts(response.data.posts));
        }
        setHasMore(response.data.length === pageSize);
      }
    } catch (error) {
      console.error("Failed to Fetch Posts!", error);
    } finally {
      // LOADING STATE
      setLoading(false);
    }
  }, [dispatch, limitNumber, skipNumber, pageSize, page]);
  // EFFECT TO FETCH POSTS
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  return { loading, hasMore, loadNext: () => setPage((p) => p + 1) };
};

export default useGetInfinitePosts;
