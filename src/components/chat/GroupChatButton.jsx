// <= IMPORTS =>
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "../ui/button";
import axiosClient from "@/utils/axiosClient";
import { Loader2, Users2 } from "lucide-react";

const GroupChatButton = ({ groupName, groupAvatar, selectedUsers }) => {
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
        // TOASTING ERROR MESSAGE
        toast.success("Group Chat Created Successfully !");
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
