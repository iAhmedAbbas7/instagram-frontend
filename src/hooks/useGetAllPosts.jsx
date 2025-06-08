// <= IMPORTS =>
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import { POST_API_ENDPOINT } from "@/utils/constants";

const useGetAllPosts = () => {
  // DISPATCH
  const dispatch = useDispatch();
  // EFFECT TO FETCH ALL POSTS
  useEffect(() => {
    // FETCHING ALL POSTS
    const fetchAllPosts = async () => {
      try {
        const response = await axios.get(`${POST_API_ENDPOINT}/getAllPosts`, {
          withCredentials: true,
        });
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
