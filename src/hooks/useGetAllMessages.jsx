// <= IMPORTS =>
import { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";
import { setMessages } from "@/redux/chatSlice";
import { useDispatch, useSelector } from "react-redux";

const useGetAllMessages = () => {
  // DISPATCH
  const dispatch = useDispatch();
  // LOADING STATE
  const [loading, setLoading] = useState(true);
  // GETTING CHAT USER FROM CHAT SLICE
  const { chatUser } = useSelector((store) => store.chat);
  // EFFECT TO FETCH SUGGESTED USERS
  useEffect(() => {
    // FETCHING SUGGESTED USERS
    const fetchAllMessages = async () => {
      // LOADING STATE
      setLoading(true);
      // MAKING REQUEST
      try {
        const response = await axiosClient.get(`/message/all/${chatUser?._id}`);
        // IF RESPONSE SUCCESS
        if (response.data.success) {
          //SETTING SUGGESTED USERS IN THE AUTH SLICE
          dispatch(setMessages(response.data.messages));
        }
      } catch (error) {
        // LOGGING ERROR MESSAGE
        console.error("Failed to Fetch Messages!", error);
      } finally {
        // LOADING STATE
        setLoading(false);
      }
    };
    fetchAllMessages();
  }, [dispatch, chatUser]);
  return { loading };
};

export default useGetAllMessages;
