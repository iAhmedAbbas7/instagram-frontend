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
  const { chatUser, currentConversation } = useSelector((store) => store.chat);
  // EFFECT TO FETCH SUGGESTED USERS
  useEffect(() => {
    // GETTING CONVERSATION ID FROM CURRENT CONVERSATION
    const conversationId = currentConversation?._id;
    // GETTING CHAT USER ID IF CONVERSATION ID IS NOT AVAILABLE
    const chatUserId = !currentConversation && chatUser ? chatUser._id : null;
    // IF SOMEHOW BOTH ARE NOT AVAILABLE, THEN RETURNING
    if (!conversationId && chatUserId) return;
    // FETCHING SUGGESTED USERS
    const fetchAllMessages = async () => {
      // LOADING STATE
      setLoading(true);
      // MAKING REQUEST
      try {
        // SETTING URL BASED ON WHICH ID IS PRESENT
        const URL = conversationId
          ? `/message/conversation/${conversationId}/messages`
          : `/message/all/${chatUserId}`;
        const response = await axiosClient.get(URL);
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
  }, [dispatch, chatUser, currentConversation]);
  return { loading };
};

export default useGetAllMessages;
