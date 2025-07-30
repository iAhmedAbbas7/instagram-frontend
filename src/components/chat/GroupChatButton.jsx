// <= IMPORTS =>
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import axiosClient from "@/utils/axiosClient";
import { Loader2, Users2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { setCurrentConversation } from "@/redux/chatSlice";

const GroupChatButton = ({
  groupName,
  groupAvatar,
  selectedUsers,
  setPanelState,
}) => {
  // DISPATCH
  const dispatch = useDispatch();
  // QUERY CLIENT INSTANCE
  const queryClient = useQueryClient();
  // LOADING STATE
  const [loading, setLoading] = useState(false);
  // SETTING GROUP PARTICIPANTS
  const participants = selectedUsers.map((user) => user._id);
  // CREATE GROUP CHAT HANDLER
  const createGroupChat = async () => {
    // IF GROUP NAME NOT PROVIDED
    if (!groupName.trim()) {
      toast.error("Group Chat Name is Required!");
      return;
    }
    // IF GROUP MEMBERS ARE LESS THAN TWO
    if (selectedUsers.length < 2) {
      toast.error("A Group Chat must have at least 3 Participants!");
      return;
    }
    // LOADING STATE
    setLoading(true);
    // CREATING FORM DATA INSTANCE
    const formData = new FormData();
    // APPENDING DATA TO FORM DATA OBJECT
    formData.append("name", groupName);
    formData.append("participants", JSON.stringify(participants));
    // IF GROUP AVATAR WAS PROVIDED
    if (groupAvatar) formData.append("file", groupAvatar);
    // MAKING REQUEST
    try {
      const response = await axiosClient.post("/message/groupChat", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // GETTING THE CONVERSATION FROM RESPONSE
        const conversation = response.data.conversation;
        // TOASTING ERROR MESSAGE
        toast.success("Group Chat Created Successfully !");
        // DISPATCHING THE CONVERSATION AS CURRENT CONVERSATION
        dispatch(setCurrentConversation(response.data.conversation));
        // ADDING THE CONVERSATION THE CACHED CONVERSATIONS LIST
        queryClient.setQueryData(["conversations"], (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page, i) =>
              i === 0
                ? {
                    ...page,
                    conversations: [
                      conversation,
                      ...page.conversations.filter(
                        (c) => c._id !== conversation._id
                      ),
                    ],
                  }
                : page
            ),
          };
        });
        // SETTING THE PANEL STATE TO CHAT
        setPanelState("CHAT");
      }
    } catch (error) {
      // LOGGING ERROR MESSAGE
      console.error("Failed to Create Group Chat!", error);
      // TOASTING ERROR MESSAGE
      toast.error(
        error?.response?.data?.message || "Failed to Create Group Chat!"
      );
    } finally {
      // LOADING STATE
      setLoading(false);
    }
  };
  return (
    <Button
      type="button"
      disabled={selectedUsers.length < 2}
      onClick={createGroupChat}
      className="bg-sky-400 hover:bg-sky-500 text-white font-semibold text-[1rem] focus:outline-none rounded-md cursor-pointer border-none outline-none "
    >
      {loading ? <Loader2 className="text-white animate-spin" /> : <Users2 />}
      <h5>{loading ? "Creating Group" : "Create Group"}</h5>
    </Button>
  );
};

export default GroupChatButton;
