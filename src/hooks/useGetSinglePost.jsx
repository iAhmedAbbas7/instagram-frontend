// <= IMPORTS =>
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";
import { setSinglePost } from "@/redux/postSlice";

const useGetSinglePost = (postId) => {
  // DISPATCH
  const dispatch = useDispatch();
  // LOADING STATE
  const [loading, setLoading] = useState(true);
  // EFFECT TO FETCH SUGGESTED USERS
  useEffect(() => {
    // FETCHING SUGGESTED USERS
    const fetchSinglePost = async () => {
      // LOADING STATE
      setLoading(true);
      // MAKING REQUEST
      try {
        const response = await axiosClient.get(`/post/${postId}/post`);
        // IF RESPONSE SUCCESS
        if (response.data.success) {
          // SETTING POST IN THE POST STATE
          dispatch(setSinglePost(response.data.post));
        }
      } catch (error) {
        // LOGGING ERROR MESSAGE
        console.error("Failed to Fetch Messages!", error);
      } finally {
        // LOADING STATE
        setLoading(false);
      }
    };
    fetchSinglePost();
  }, [dispatch, postId]);
  return { loading };
};

export default useGetSinglePost;
