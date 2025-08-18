// <== IMPORTS ==>
import { X } from "lucide-react";
import StoryViewCarousel from "./StoryViewCarousel";
import { AnimatePresence, motion } from "framer-motion";
import INSTAGRAM from "../../assets/images/INSTAGRAM.png";

const StoryModalTest = ({ open, onClose }) => {
  // COMPONENT'S RETURN
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="Story-Modal-Overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
          aria-label="Story Viewer"
          className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black"
        >
          {/* CONTENT SECTION */}
          <motion.div
            key="Story-Modal-Panel"
            initial={{ scale: 0.98, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 12, opacity: 0 }}
            className="w-full h-full overflow-hidden"
            role="document"
          >
            {/* HEADER */}
            <header className="w-full px-4 py-3 flex items-center justify-between">
              {/* LOGO */}
              <div>
                <img src={INSTAGRAM} alt="Logo" className="h-15" />
              </div>
              {/* CLOSE BUTTON */}
              <div
                className="cursor-pointer"
                title="Close"
                onClick={() => onClose()}
              >
                <X size={40} className="text-white" />
              </div>
            </header>
            {/* STORIES SECTION */}
            <StoryViewCarousel />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default StoryModalTest;
