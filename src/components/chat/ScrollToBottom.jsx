// <== IMPORTS ==>
import { ChevronsDown } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ScrollToBottom = ({ scrollContainerRef, offset = 5 }) => {
  // COMPONENT'S VISIBILITY STATE
  const [visible, setVisible] = useState(false);
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
      // SETTING VISIBILITY STATE BASED ON DISTANCE
      setVisible(distanceFromBottom > offset);
    };
    // LISTENER FOR MANUAL SCROLL INSIDE THE CONTAINER
    container.addEventListener("scroll", onScroll);
    // INITIAL CHECK ON MOUNT
    onScroll();
    // CLEANUP FUNCTION TO REMOVE LISTENER
    return () => container.removeEventListener("scroll", onScroll);
  }, [offset, scrollContainerRef]);
  // CLICK HANDLER TO SCROLL TO BOTTOM
  const scrollToBottom = () => {
    // CONTAINER REFERENCE
    const container = scrollContainerRef.current;
    // IF NO CONTAINER REFERENCE
    if (!container) return;
    // SCROLLING SMOOTHLY TO BOTTOM
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  };
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          title="Go Down"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          key="scrollToBottom"
          onClick={scrollToBottom}
          className="absolute w-7 h-7 flex items-center justify-center p-1 bg-gray-300 bottom-20 right-5 rounded-full z-10 cursor-pointer shadow-lg"
        >
          <ChevronsDown />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToBottom;
