// <== IMPORTS ==>
import { useMemo } from "react";
import { X } from "lucide-react";
import "./StoryViewCarousel.css";
import { storyGroups } from "./testingData";
import StoryViewCarousel from "./StoryViewCarousel";
import { AnimatePresence, motion } from "framer-motion";
import INSTAGRAM from "../../assets/images/INSTAGRAM.png";

const StoryModalTest = ({ open, onClose, storyId }) => {
  // FINDING THE INDEX OF THE GROUP WHOSE STORY ID MATCHES THE PROVIDED STORY ID
  const { groups, startIndex } = useMemo(() => {
    // MAKING SURE THE GROUPS IS AN ARRAY
    const groupsArray = Array.isArray(storyGroups) ? storyGroups : [];
    // FINDING THE INDEX OF GROUP WHICH MATCHES THE STORY ID
    const index = groupsArray.findIndex((group) =>
      (group.storyIds || []).includes(storyId)
    );
    // RETURNING THE GROUP ARRAY AND THE START INDEX
    return { groups: groupsArray, startIndex: index >= 0 ? index : 0 };
  }, [storyId]);
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
            <StoryViewCarousel groups={groups} startIndex={startIndex} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default StoryModalTest;
