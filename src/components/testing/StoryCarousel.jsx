// <== IMPORTS ==>
import { Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";
import StoryModalTest from "./StoryModalTest";
import StoryUpload from "../story/StoryUpload";
import useEmblaCarousel from "embla-carousel-react";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  PrevButton,
  NextButton,
  usePrevNextButtons,
} from "./StoryCarouselControls";

const StoryCarousel = (props) => {
  // GETTING SLIDES NUMBER AND OPTIONS FROM PROPS
  const { options } = props;
  // TRAY STATE FOR STORIES
  const [tray, setTray] = useState([]);
  // LOADING STATE
  const [loading, setLoading] = useState(false);
  // STORY MODAL OPEN STATE FOR TESTING
  const [modalOpen, setModalOpen] = useState(false);
  // GETTING CURRENT USER CREDENTIALS FROM AUTH SLICE
  const { user } = useSelector((store) => store.auth);
  // UPLOAD DIALOG OPEN STATE
  const [uploadOpen, setUploadOpen] = useState(false);
  // INITIALIZE STORY CAROUSEL AND GET API & REF
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  // HOOK PROVIDING PREVIOUS & NEXT BUTTONS AND THEIR STATES
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);
  // LOADING STORIES TRAY
  const loadStoriesTray = async () => {
    // LOADING STATE
    setLoading(true);
    try {
      // MAKING REQUEST
      const response = await axiosClient.get(`/story/tray`);
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // SETTING STORIES IN THE TRAY
        setTray(response.data.tray || []);
      } else {
        // SETTING EMPTY STORIES TRAY
        setTray([]);
      }
    } catch (error) {
      // LOGGING ERROR MESSAGE
      console.error("Failed to Fetch Stories", error);
      // SETTING EMPTY STORIES TRAY
      setTray([]);
    } finally {
      // LOADING STATE
      setLoading(false);
    }
  };
  // FETCHING STORIES ON MOUNT
  useEffect(() => {
    loadStoriesTray();
  }, []);
  // UPLOAD DIALOG CLOSE HANDLER
  const closeUpload = () => {
    setUploadOpen(false);
  };
  // OPEN STORY MODAL HANDLER
  const openStoryHandler = () => {
    // OPENING THE STORY MODAL
    setModalOpen(true);
  };
  // CLOSE STORY MODAL HANDLER
  const closeStoryModal = () => {
    // CLOSING THE STORY MODAL
    setModalOpen(false);
  };
  // UPLOAD DIALOG OPEN HANDLER
  const openUpload = () => setUploadOpen(true);
  // AVATAR FALLBACK MANAGEMENT
  const fullNameInitials = user?.fullName
    ? getFullNameInitials(user?.fullName)
    : "";
  return (
    <>
      {/* STORY CAROUSEL MAIN WRAPPER */}
      <section className="min-[768px]:max-w-[620px] w-[96vw] flex items-center justify-center">
        {/* STORY CAROUSEL CONTENT WRAPPER */}
        <div
          className="w-full overflow-hidden relative flex items-center justify-center"
          ref={emblaRef}
        >
          {/* CONTENT SECTION */}
          <div className="w-full flex items-center gap-2 py-3">
            {/* CURRENT USER STORY BUBBLE */}
            <div className="flex flex-col items-center gap-2">
              {/* AVATAR SECTION */}
              <div
                onClick={openUpload}
                className="rounded-full flex items-center justify-center relative border-2 border-gray-200 p-1.5"
              >
                {/* AVATAR */}
                <Avatar
                  className={`w-22 h-22 rounded-full cursor-pointer ${
                    user.profilePhoto === "" ? "bg-gray-300" : "bg-none"
                  } border border-gray-200`}
                >
                  <AvatarImage src={user.profilePhoto} alt={user.fullName} />
                  <AvatarFallback>{fullNameInitials}</AvatarFallback>
                </Avatar>
                {/* PLUS SIGN */}
                <span
                  title="Add Story"
                  className="absolute bottom-[-0.2rem] right-[-0.2rem] rounded-full w-5 h-5 flex items-center justify-center bg-black cursor-pointer"
                >
                  <Plus size={50} className="text-white" />
                </span>
              </div>
              {/* TEXT */}
              <span className="text-xs font-semibold">Your Story</span>
            </div>
            {/* STORIES LOADING UI */}
            {loading && (
              <div className="flex items-center gap-4 p-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2.5 ">
                    {/* AVATAR OVERLAY */}
                    <div className="rounded-full flex items-center justify-center relative border-2 border-gray-200 p-1.5">
                      <div className="w-22 h-22 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                    {/* TEXT OVERLAY */}
                    <span className="w-16 h-2 bg-gray-200 rounded-lg animate-pulse"></span>
                  </div>
                ))}
              </div>
            )}
            {/* OTHER USER'S STORIES */}
            {!loading &&
              tray.map((g) => (
                <>
                  {/* STORY BUBBLE & USERNAME */}
                  <div
                    onClick={() => openStoryHandler()}
                    key={g?.owner?._id}
                    className="flex flex-col items-center gap-2 rounded-full"
                  >
                    {/* AVATAR SECTION */}
                    <div className="rounded-full flex items-center justify-center relative border-2 border-gray-200 p-1.5">
                      {/* AVATAR */}
                      <Avatar
                        className={`w-22 h-22 rounded-full cursor-pointer ${
                          g?.owner?.profilePhoto === ""
                            ? "bg-gray-300"
                            : "bg-none"
                        } border border-gray-200`}
                      >
                        <AvatarImage
                          src={g?.owner?.profilePhoto}
                          alt={g?.owner?.fullName}
                        />
                        <AvatarFallback>
                          {g?.owner?.fullName
                            ? getFullNameInitials(g?.owner?.fullName)
                            : ""}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    {/* TEXT */}
                    <span className="text-xs font-semibold">
                      {g?.owner?.username}
                    </span>
                  </div>
                </>
              ))}
          </div>
          {/* PREVIOUS BUTTON */}
          {!prevBtnDisabled && (
            <div className="absolute left-1 bottom-[4.6rem] rounded-full bg-gray-500 flex items-center justify-center">
              <PrevButton
                onClick={onPrevButtonClick}
                disabled={prevBtnDisabled}
              />
            </div>
          )}
          {/* NEXT BUTTON */}
          {!nextBtnDisabled && (
            <div className="absolute right-1 bottom-[4.6rem] rounded-full bg-gray-500 flex items-center justify-center">
              <NextButton
                onClick={onNextButtonClick}
                disabled={nextBtnDisabled}
              />
            </div>
          )}
        </div>
        {/* STORY VIEW MODAL */}
        <StoryModalTest open={modalOpen} onClose={closeStoryModal} />
        {/* STORY UPLOAD MODAL */}
        {uploadOpen && <StoryUpload open={uploadOpen} onClose={closeUpload} />}
      </section>
    </>
  );
};

export default StoryCarousel;
