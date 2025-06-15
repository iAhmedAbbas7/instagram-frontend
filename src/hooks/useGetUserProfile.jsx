// <= IMPORTS =>
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";
import { setUserProfile } from "@/redux/authSlice";

const useGetUserProfile = (userId) => {
  // DISPATCH
  const dispatch = useDispatch();
  // LOADING STATE
  const [loading, setLoading] = useState(true);
  // FETCHING USER PROFILE
  useEffect(() => {
    const fetchUserProfile = async () => {
      // LOADING STATE
      setLoading(true);
      try {
        // MAKING REQUEST
        const response = await axiosClient.get(`/user/${userId}/profile`);
        // IF RESPONSE SUCCESS
        if (response.data.success) {
          // SETTING USER PROFILE
          dispatch(setUserProfile(response.data.user));
        }
      } catch (error) {
        console.error("Error Fetching User Profile!", error);
      } finally {
        // LOADING STATE
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [dispatch, userId]);
  return { loading };
};

export default useGetUserProfile;
