// <== IMPORTS ==>
import { Plus } from "lucide-react";
import StoryModal from "./StoryModal";
import StoryUpload from "./StoryUpload";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const StoryTray = () => {
  // TRAY STATE FOR STORIES
  const [tray, setTray] = useState([]);
  // LOADING STATE
  const [loading, setLoading] = useState(false);
  // UPLOAD DIALOG OPEN STATE
  const [uploadOpen, setUploadOpen] = useState(false);
  // OPEN STORY STATE
  const [openStoryId, setOpenStoryId] = useState(null);
  // CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
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
  // OPEN GROUP HANDLER
  const openGroup = (group) => {
    // GETTING THE LATEST STORY FROM THE GROUP
    const latestId = (group && group.storyIds && group.storyIds[0]) || null;
    // SETTING THE OPEN STORY ID
    if (latestId) setOpenStoryId(latestId);
  };
  // UPLOAD DIALOG OPEN HANDLER
  const openUpload = () => setUploadOpen(true);
  // CLOSE STORY MODAL HANDLER
  const closeStoryModal = () => {
    // REMOVING OPEN STORY ID
    setOpenStoryId(null);
    // REFRESHING STORIES TRAY
    loadStoriesTray();
  };
  // AVATAR FALLBACK MANAGEMENT
  const fullNameInitials = user?.fullName
    ? getFullNameInitials(user?.fullName)
    : "";
  // COMPONENT'S RETURN
  return (
    <>
      {/* STROY TRAY MAIN WRAPPER */}
      <section className="w-full mb-6 bg-white">
        {/* STORY TRAY CONTENT WRAPPER */}
        <section className="w-full px-4 flex gap-4 items-center p-2 overflow-x-auto">
          {/* ADD STORY BUBBLE */}
          <div className="flex flex-col items-center gap-2">
            {/* AVATAR SECTION */}
            <div
              onClick={openUpload}
              className="w-18 h-18 rounded-full relative"
            >
              {/* AVATAR */}
              <Avatar
                className={`w-18 h-18 rounded-full cursor-pointer ${
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
          {/* OTHER'S STORIES BUBBLES */}
          {loading ? (
            <div className="flex items-center gap-4 p-2">
              {/* STORIES LOADING UI */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2.5">
                  {/* AVATAR OVERLAY */}
                  <div className="w-18 h-18 bg-gray-200 rounded-full animate-pulse" />
                  {/* TEXT OVERLAY */}
                  <span className="w-16 h-2 bg-gray-200 rounded-lg animate-pulse"></span>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* MAPPING OVER OTHER'S STORIES */}
              {tray.map((g) => (
                <>
                  {/* STORY BUBBLE & USERNAME */}
                  <div
                    onClick={() => openGroup(g)}
                    key={g?.owner?._id}
                    className="flex flex-col items-center gap-2"
                  >
                    {/* AVATAR SECTION */}
                    <div
                      onClick={openUpload}
                      className="w-18 h-18 rounded-full"
                    >
                      {/* AVATAR */}
                      <Avatar
                        className={`w-18 h-18 rounded-full cursor-pointer ${
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
            </>
          )}
        </section>
        {/* STORY VIEW MODAL */}
        {openStoryId && (
          <StoryModal storyId={openStoryId} onClose={closeStoryModal} />
        )}
        {/* STORY UPLOAD MODAL */}
        {uploadOpen && <StoryUpload open={uploadOpen} onClose={closeUpload} />}
      </section>
    </>
  );
};

export default StoryTray;
