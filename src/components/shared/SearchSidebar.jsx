// <= IMPORTS =>
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SearchSidebar = ({ isOpen, onClose, offset, justOpened }) => {
  // SEARCH SIDEBAR CONTAINER REF
  const searchSidebarRef = useRef();
  // SETTING THE IGNORE CLICK REF
  const ignoreClick = useRef(false);
  // CLICK OUTSIDE HANDLER
  useEffect(() => {
    // JUST OPENED STATE PASSED THROUGH THE LEFT SIDEBAR ON SEARCH ICON CLICK
    ignoreClick.current = !!justOpened;
    // IF CLICKED OUTSIDE THE CONTAINER
    const handleClick = (e) => {
      // IF CLICKED FOR THE FIRST TIME THEN
      if (ignoreClick.current) {
        ignoreClick.current = false;
        return;
      }
      if (
        searchSidebarRef.current &&
        !searchSidebarRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    // ON OPEN STATE
    if (isOpen) {
      // ADDING EVENT LISTENER
      document.addEventListener("mousedown", handleClick);
    }
    // CLEANUP FUNCTION
    return () => {
      // REMOVING EVENT LISTENER
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen, onClose, justOpened]);
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          style={{ left: offset }}
          className="fixed top-0 h-full w-[300px] bg-white rounded-r-lg shadow-xl z-[10] overflow-hidden"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "tween", duration: 0.5 }}
          ref={searchSidebarRef}
        ></motion.aside>
      )}
    </AnimatePresence>
  );
};

export default SearchSidebar;
