// <= IMPORTS =>
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import axiosClient from "@/utils/axiosClient";
import { Loader2, MessageCircleMore } from "lucide-react";
import { setChatUser, setCurrentConversation } from "@/redux/chatSlice";

const ChatButton = ({ selectedUsers, setPanelState }) => {
  // DISPATCH
  const dispatch = useDispatch();
  // LOADING STATE
  const [loading, setLoading] = useState(false);
  // CHAT CREATION HANDLER
  const handleChatCreation = async () => {
    // SETTING PARTICIPANTS OF THE CHAT
    const participants = selectedUsers.map((u) => u._id);
    // LOADING STATE
    setLoading(true);
    // MAKING REQUEST
    try {
      const response = await axiosClient.post(`/message/newConversation`, {
        participants,
      });
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // DISPATCHING THE CONVERSATION IN THE CHAT SLICE
        dispatch(setCurrentConversation(response.data.conversation));
        // DISPATCHING THE CHAT USER IN THE CHAT SLICE
        dispatch(setChatUser(selectedUsers[0]));
        // SWITCHING THE PANEL STATE TO CHAT
        setPanelState("CHAT");
      }
    } catch (error) {
      // LOGGING ERROR MESSAGE
      console.error("Failed to Create Conversation!", error);
      // TOASTING ERROR MESSAGE
      toast.error(
        error?.response?.data?.message || "Failed to Create Conversation!"
      );
    } finally {
      // LOADING STATE
      setLoading(false);
    }
  };
  // RETURNING THE BUTTON
  return (
    <Button
      type="button"
      disabled={selectedUsers.length === 0}
      onClick={handleChatCreation}
      className="w-full bg-sky-400 hover:bg-sky-500 text-white font-semibold text-[1rem] border-none outline-none focus:outline-none rounded-md cursor-pointer"
    >
      {loading ? (
        <Loader2 className="animate-spin text-white" />
      ) : (
        <MessageCircleMore size={20} />
      )}
      {loading ? <h5>Creating Chat</h5> : <h5>Chat</h5>}
    </Button>
  );
};

export default ChatButton;
