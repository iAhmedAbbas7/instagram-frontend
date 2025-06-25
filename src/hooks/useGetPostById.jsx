// <= IMPORTS =>
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";

const useGetPostById = (postId) => {
  // DISPATCH
  const dispatch = useDispatch();
  // LOADING STATE
  const [loading, setLoading] = useState(true);
  // POST STATE
  const [post, setPost] = useState(null);
  // EFFECT TO FETCH SUGGESTED USERS
  useEffect(() => {
    // FETCHING SUGGESTED USERS
    const fetchPostById = async () => {
      // LOADING STATE
      setLoading(true);
      // MAKING REQUEST
      try {
        const response = await axiosClient.get(`/post/${postId}/post`);
        // IF RESPONSE SUCCESS
        if (response.data.success) {
          // SETTING POST IN THE POST STATE
          setPost(response.data.post);
        }
      } catch (error) {
        // LOGGING ERROR MESSAGE
        console.error("Failed to Fetch Messages!", error);
      } finally {
        // LOADING STATE
        setLoading(false);
      }
    };
    fetchPostById();
  }, [dispatch, postId]);
  return { loading, post };
};

export default useGetPostById;
