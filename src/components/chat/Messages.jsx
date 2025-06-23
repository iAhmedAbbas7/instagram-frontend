// <= IMPORTS =>
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import useGetAllMessages from "@/hooks/useGetAllMessages";

const Messages = () => {
  // USING GET ALL MESSAGES HOOK
  const { loading } = useGetAllMessages();
  // CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // GETTING MESSAGE FROM CHAT SLICE
  const { messages } = useSelector((store) => store.chat);
  return (
    // MESSAGES MAIN WRAPPER
    <section className="w-full pt-[3rem] px-4">
      {/* IF LOADING */}
      {loading && (
        <div className="w-full my-8 flex items-center justify-center">
          <Loader2 size={40} className="text-gray-500 animate-spin" />
        </div>
      )}
      {/* MESSAGES SECTION */}
      <section className={`w-full flex flex-col gap-1`}>
        {!loading &&
          messages?.map((msg) => {
            return (
              <div
                className={`flex ${
                  msg?.senderId?._id === user?._id
                    ? "justify-end"
                    : "justify-start"
                }`}
                key={msg._id}
              >
                {/* MESSAGE TEXT */}
                <div
                  className={`${
                    msg?.senderId?._id === user?._id
                      ? "text-white bg-sky-400"
                      : "text-black bg-gray-200"
                  } px-3 py-1.5 rounded-2xl text-[1rem] max-w-[70%]`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })}
      </section>
    </section>
  );
};

export default Messages;
