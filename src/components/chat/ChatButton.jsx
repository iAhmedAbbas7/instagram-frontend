// <= IMPORTS =>
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { MessageCircleMore } from "lucide-react";
import useConversations from "@/hooks/useConversations";
import { setChatUser, setCurrentConversation } from "@/redux/chatSlice";

const ChatButton = ({ selectedUsers, setPanelState }) => {
  // DISPATCH
  const dispatch = useDispatch();
  // USING USE CONVERSATIONS HOOK
  const { allConversations } = useConversations();
  // CHAT CREATION HANDLER
  const handleChatCreation = async () => {
    // DISPATCHING THE CHAT USER IN THE CHAT SLICE
    dispatch(setChatUser(selectedUsers[0]));
    // CHECKING FOR EXISTING CONVERSATION IN THE CONVERSATIONS
    const existingConversation = allConversations.find(
      (c) =>
        c?.type === "ONE-TO-ONE" &&
        c.participants.some((p) => p._id === selectedUsers[0]._id)
    );
    // IF THERE IS AN EXISTING CONVERSATION THEN DISPATCHING IT IN CHAT SLICE
    if (existingConversation) {
      dispatch(setCurrentConversation(existingConversation));
    }
    // SETTING PANEL STATE TO CHAT
    setPanelState("CHAT");
  };
  // RETURNING THE BUTTON
  return (
    <Button
      type="button"
      disabled={selectedUsers.length === 0}
      onClick={
        selectedUsers.length === 1
          ? handleChatCreation
          : () => setPanelState("GROUP-CHAT")
      }
      className="w-full bg-sky-400 hover:bg-sky-500 text-white font-semibold text-[1rem] border-none outline-none focus:outline-none rounded-md cursor-pointer"
    >
      <MessageCircleMore size={20} />
      <h5>Chat</h5>
    </Button>
  );
};

export default ChatButton;
