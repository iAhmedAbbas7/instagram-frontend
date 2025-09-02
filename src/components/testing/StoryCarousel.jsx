// <== IMPORTS ==>
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import StoryModalTest from "./StoryModalTest";
import StoryUpload from "../story/StoryUpload";
import useEmblaCarousel from "embla-carousel-react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "@/redux/storySlice";
import useInfiniteStories from "@/hooks/useInfiniteStories";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  PrevButton,
  NextButton,
  usePrevNextButtons,
} from "./StoryCarouselControls";

const StoryCarousel = (props) => {
  // DISPATCH
  const dispatch = useDispatch();
  // GETTING SLIDES NUMBER AND OPTIONS FROM PROPS
  const { options } = props;
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
  // USING INFINITE STORIES HOOK
  const {
    isLoading,
    allStories,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteStories({ limit: 20 });
  // EMBLA API SELECT LISTENER TO TRIGGER FETCH NEXT PAGE WHEN NEAR THE END
  useEffect(() => {
    // IF NO EMBLA API
    if (!emblaApi) return;
    // ON SELECT HANDLER
    const onSelect = () => {
      try {
        // SELECTED SCROLL SNAP
        const selected = emblaApi.selectedScrollSnap();
        // TOTAL SNAP LIST
        const total = emblaApi.scrollSnapList().length;
        // WHEN USER REACHES THE LAST TWO SLIDES, TRIGGERING NEXT PAGE FETCH IF EXISTS
        if (
          selected >= Math.max(0, total - 2) &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          fetchNextPage();
        }
      } catch (err) {
        // LOGGING ERROR MESSAGE
        console.error("Failed to Fetch Next Page!", err);
      }
    };
    // ATTACHING THE SELECT HANDLER TO API
    emblaApi.on("select", onSelect);
    // CLEANUP
    return () => {
      // IF NO EMBLA API
      if (!emblaApi) return;
      // REMOVING THE EVENT
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, fetchNextPage, hasNextPage, isFetchingNextPage]);
  // UPLOAD DIALOG CLOSE HANDLER
  const closeUpload = () => {
    setUploadOpen(false);
  };
  // CLOSE STORY MODAL HANDLER
  const closeStoryModal = () => {
    // CLOSING THE MODAL
    dispatch(closeModal());
  };
  // OPEN STORY MODAL HANDLER
  const openStoryHandler = () => {
    // OPENING THE MODAL
    dispatch(openModal());
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
            {isLoading && (
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
            {!isLoading &&
              (allStories || []).map((g) => (
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
        <>
          <StoryModalTest open={false} onClose={closeStoryModal} />
        </>
        {/* STORY UPLOAD MODAL */}
        <>
          {uploadOpen && (
            <StoryUpload open={uploadOpen} onClose={closeUpload} />
          )}
        </>
      </section>
    </>
  );
};

export default StoryCarousel;
