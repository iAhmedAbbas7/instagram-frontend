// <= IMPORTS =>
import { toast } from "sonner";
import { useState } from "react";
import { useSelector } from "react-redux";
import axiosClient from "@/utils/axiosClient";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";

const ChatMenu = ({ setPanelState }) => {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // CLEAR CHAT LOADING STATE
  const [clearChatLoading, setClearChatLoading] = useState(false);
  // GETTING CURRENT CONVERSATION & CHAT USER FROM CHAT SLICE
  const { currentConversation, chatUser } = useSelector((store) => store.chat);
  // CLEAR CHAT HANDLER
  const clearChatHandler = async () => {
    // LOADING STATE
    setClearChatLoading(true);
    // MAKING REQUEST
    try {
      // SETTING CHAT USER ID
      const chatUserId = chatUser?._id;
      // SETTING CONVERSATION ID
      const conversationId = currentConversation?._id;
      // AWAITING RESPONSE
      const response = await axiosClient.get(
        `/message/clearConversation/${currentConversation?._id}`
      );
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // INVALIDING MESSAGES CACHE FOR THE CHAT THROUGH CHAT ID
        queryClient.removeQueries(["messages", conversationId]);
        // INVALIDING MESSAGES CACHE FOR THE CHAT THROUGH CHAT USER ID
        queryClient.removeQueries(["messages", chatUserId]);
        // SETTING CHAT PANEL STATE
        setPanelState("CHAT");
      }
    } catch (error) {
      console.error("Failed to Clear Chat!", error);
      // TOASTING ERROR MESSAGE
      toast.error(error?.response?.data?.message || "Failed to Clear Chat!");
    } finally {
      // LOADING STATE
      setClearChatLoading(false);
    }
  };
  return (
    <>
      {/* CHAT MENU MAIN CONTAINER */}
      <section className="w-full h-full rounded-xl flex flex-col items-start justify-start">
        {/* HEADER */}
        <div className="w-full flex items-center justify-start gap-2 px-3 py-3.5 border-b-2 border-gray-200">
          {/* BACK BUTTON */}
          <div title="Go Back" onClick={() => setPanelState("CHAT")}>
            <ArrowLeft
              size={28}
              className="hover:text-gray-500 cursor-pointer"
            />
          </div>
          {/* TEXT */}
          <h6 className="text-[1.1rem] font-semibold">Chat Menu</h6>
        </div>
        {/* CONTENT SECTION */}
        <div className="w-full flex flex-col items-start justify-start p-2">
          {/* CLEAR CHAT */}
          <div
            className="w-full p-2 flex items-center justify-between rounded-md hover:bg-gray-100 cursor-pointer"
            onClick={clearChatHandler}
          >
            <span className="font-semibold">Clear Chat</span>
            {clearChatLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Trash2 size={22} />
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default ChatMenu;
