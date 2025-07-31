// <== IMPORTS ==>
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircleMore } from "lucide-react";

const MessageBadge = ({ count, onClick, offset = 5, scrollContainerRef }) => {
  // COMPONENT'S VISIBILITY STATE
  const [visible, setVisible] = useState(false);
  // SHOWING THE BADGE WHENEVER THERE IS NEW INCOMING MESSAGE
  useEffect(() => {
    setVisible(count > 0);
  }, [count]);
  // EFFECT TO DETECT SCROLL POSITION
  useEffect(() => {
    // REFERENCE CONTAINER
    const container = scrollContainerRef.current;
    // IF NO CONTAINER REFERENCE
    if (!container) return;
    // SCROLL HANDLER FUNCTION
    const onScroll = () => {
      // COMPUTING THE DISTANCE FROM BOTTOM
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      // IF DISTANCE IS LES THAN OFFSET AND THERE IS COUNT
      if (distanceFromBottom < offset && count > 0) {
        onClick();
      }
    };
    // LISTENER FOR MANUAL SCROLL INSIDE THE CONTAINER
    container.addEventListener("scroll", onScroll);
    // CLEANUP FUNCTION TO REMOVE LISTENER
    return () => container.removeEventListener("scroll", onScroll);
  }, [offset, count, onClick, scrollContainerRef]);
  // IF THERE IS NO COUNT
  if (count <= 0) return null;
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          title="See Messages"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          key="scrollToBottom"
          onClick={onClick}
          className="absolute flex items-center justify-center gap-1.5 px-2 py-1 bg-blue-300 bottom-20 left-2 rounded-full z-10 cursor-pointer shadow-lg font-semibold text-white"
        >
          <span>{count}</span>
          <MessageCircleMore size={20} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MessageBadge;
