// <= IMPORTS =>
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import axiosClient from "@/utils/axiosClient";

const useGetAllPosts = () => {
  // DISPATCH
  const dispatch = useDispatch();
  // EFFECT TO FETCH ALL POSTS
  useEffect(() => {
    // FETCHING ALL POSTS
    const fetchAllPosts = async () => {
      try {
        const response = await axiosClient.get(`/post/getAllPosts`);
        // IF RESPONSE SUCCESS
        if (response.data.success) {
          // SETTING POSTS IN THE POSTS SLICE
          dispatch(setPosts(response.data.posts));
        }
      } catch (error) {
        // LOGGING ERROR MESSAGE
        console.error(error);
      }
    };
    fetchAllPosts();
  }, [dispatch]);
};

export default useGetAllPosts;
