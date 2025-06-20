// <= IMPORTS =>
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";
import { setSuggestedUsers } from "@/redux/authSlice";

const useGetSuggestedUsers = () => {
  // DISPATCH
  const dispatch = useDispatch();
  // LOADING STATE
  const [loading, setLoading] = useState(true);
  // EFFECT TO FETCH SUGGESTED USERS
  useEffect(() => {
    // FETCHING SUGGESTED USERS
    const fetchSuggestedUsers = async () => {
      // LOADING STATE
      setLoading(true);
      // MAKING REQUEST
      try {
        const response = await axiosClient.get("/user/suggestedUsers");
        // IF RESPONSE SUCCESS
        if (response.data.success) {
          //SETTING SUGGESTED USERS IN THE AUTH SLICE
          dispatch(setSuggestedUsers(response.data.users));
        }
      } catch (error) {
        // LOGGING ERROR MESSAGE
        console.error("Failed to Fetch Suggested Users", error);
      } finally {
        // LOADING STATE
        setLoading(false);
      }
    };
    fetchSuggestedUsers();
  }, [dispatch]);
  return { loading };
};

export default useGetSuggestedUsers;
