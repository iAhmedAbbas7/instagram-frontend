// <== IMPORTS ==>
import { X } from "lucide-react";
import { closeModal } from "@/redux/storySlice";
import StoryViewCarousel from "./StoryViewCarousel";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import INSTAGRAM from "../../assets/images/INSTAGRAM.png";

const StoryModalTest = ({ open, onClose }) => {
  // DISPATCH
  const dispatch = useDispatch();
  // GETTING MODAL OPEN STATE FROM REDUX
  const modalOpenRedux = useSelector((store) => store.stories?.modalOpen);
  // DECIDING IF THE MODAL IS OPEN (PROP OR REDUX)
  const isOpen = !!open || !!modalOpenRedux;
  // CLOSE MODAL HANDLER
  const handleClose = () => {
    // DISPATCHING CLOSE MODAL ACTION
    dispatch(closeModal());
    // CLOSING THROUGH PROP FUNCTION AS WELL
    if (typeof onClose === "function") onClose();
  };
  // COMPONENT'S RETURN
  return (
    <AnimatePresence>
      {isOpen && (
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
                onClick={() => handleClose()}
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
