// <= IMPORTS =>
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";

const useGetOtherPosts = (excludedPostId, authorId) => {
  // DISPATCH
  const dispatch = useDispatch();
  // LOADING STATE
  const [loading, setLoading] = useState(true);
  // POSTS STATE
  const [posts, setPosts] = useState([]);
  // EFFECT TO FETCH SUGGESTED USERS
  useEffect(() => {
    // FETCHING SUGGESTED USERS
    const fetchOtherPosts = async () => {
      // LOADING STATE
      setLoading(true);
      // MAKING REQUEST
      try {
        const response = await axiosClient.get(
          `/post/author/${authorId}/others/${excludedPostId}`
        );
        // IF RESPONSE SUCCESS
        if (response.data.success) {
          // SETTING POST IN THE POST STATE
          setPosts(response.data.posts);
        }
      } catch (error) {
        // LOGGING ERROR MESSAGE
        console.error("Failed to Fetch Messages!", error);
      } finally {
        // LOADING STATE
        setLoading(false);
      }
    };
    fetchOtherPosts();
  }, [dispatch, excludedPostId, authorId]);
  return { loading, posts };
};

export default useGetOtherPosts;
