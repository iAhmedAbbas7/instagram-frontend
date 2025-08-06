// <= IMPORTS =>
import { toast } from "sonner";
import useTitle from "@/hooks/useTitle";
import { useEffect, useState } from "react";
import { setUser } from "@/redux/authSlice";
import axiosClient from "@/utils/axiosClient";
import FollowDialog from "../shared/FollowDialog";
import CommentDialog from "../shared/CommentDialog";
import { FaHeart, FaMessage } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import {
  ChevronDown,
  Film,
  Grid,
  Loader2,
  MoreHorizontal,
  Settings,
  Tags,
  UserPlus,
} from "lucide-react";

const Profile = () => {
  // DISPATCH
  const dispatch = useDispatch();
  // USE TITLE HOOK
  useTitle("Instagram - Profile");
  // NAVIGATION
  const navigate = useNavigate();
  // PARAMS
  const params = useParams();
  // GETTING USER ID FROM URL PARAMS
  const userId = params.id;
  // USING USE GET USER PROFILE HOOK
  const { loading } = useGetUserProfile(userId);
  // ACTIVE POST STATE MANAGEMENT
  const [activePost, setActivePost] = useState(null);
  // CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // ACTIVE TAB STATE MANAGEMENT
  const [activeTab, setActiveTab] = useState("POSTS");
  // FOLLOWING LOADING STATE
  const [followLoading, setFollowLoading] = useState(false);
  // GETTING USER PROFILE FORM AUTH SLICE
  const { userProfile } = useSelector((store) => store.auth);
  // FOLLOW DIALOG VISIBILITY STATE
  const [followDialogOpen, setFollowDialogOpen] = useState(false);
  // COMMENT DIALOG STATE
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  // PROFILE DIALOG VISIBILITY STATE
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  // FOLLOWING STATE MANAGEMENT
  const [isFollowingOther, setIsFollowingOther] = useState(
    user?.following?.includes(userProfile?._id)
  );
  // SYNCING THE INITIAL FOLLOWING STATE
  useEffect(() => {
    if (user?.following) {
      setIsFollowingOther(user?.following?.includes(userProfile?._id));
    }
  }, [user, userProfile]);
  // OWNERS SETTINGS DIALOG ITEMS
  const ownersDialogItems = [
    { id: 1, label: "Apps and Websites" },
    { id: 2, label: "QR Code" },
    { id: 3, label: "Notifications" },
    { id: 4, label: "Settings and Privacy" },
    { id: 5, label: "Meta Verified" },
    { id: 6, label: "Supervision" },
    { id: 7, label: "Login Activity" },
    { id: 8, label: "Logout" },
    { id: 9, label: "Cancel" },
  ];
  // OTHERS PROFILE DIALOG ITEMS
  const otherDialogItems = [
    { id: 1, label: "Block" },
    { id: 2, label: "Restrict" },
    { id: 3, label: "Report" },
    { id: 4, label: "Share To" },
    { id: 5, label: "About this Account" },
    { id: 6, label: "Cancel" },
  ];
  // SETTING THE OWNER BASED ON CURRENT USER
  const isOwner = userProfile?._id === user?._id;
  // SETTING DIALOG ITEMS BASED ON CURRENT USER
  const dialogItems = isOwner ? ownersDialogItems : otherDialogItems;
  // FOLLOW USER HANDLER
  const followUserHandler = async () => {
    // LOADING STATE
    setFollowLoading(true);
    // MAKING REQUEST
    try {
      const response = await axiosClient.get(
        `/user/followOrUnfollow/${userProfile?._id}`
      );
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // UPDATING THE FOLLOWING STATE
        setIsFollowingOther(!isFollowingOther);
        // CURRENT USER ORIGINAL FOLLOWING LIST
        const originalFollowing = user?.following ? [...user.following] : [];
        // UPDATING THE CURRENT USER FOLLOWING
        const newFollowing = [userProfile?._id, ...originalFollowing];
        // DISPATCHING UPDATED CURRENT USER IN THE AUTH SLICE
        dispatch(setUser({ ...user, following: newFollowing }));
        // TOASTING SUCCESS MESSAGE
        toast.success(response?.data?.message);
      }
    } catch (error) {
      // LOGGING ERROR MESSAGE
      console.error("Failed to Perform Action!", error);
      // TOASTING ERROR MESSAGE
      toast.error(
        error?.response?.data?.message || "Failed to Perform Action!"
      );
    } finally {
      // LOADING STATE
      setFollowLoading(false);
    }
  };
  // ACTIVE TAB CHANGE HANDLER
  const changeActiveTabHandler = (tab) => {
    setActiveTab(tab);
  };
  // COMMENT DIALOG CLOSE STATE HANDLER
  const commentDialogCloseStateHandler = () => {
    setCommentDialogOpen(false);
    setActivePost(null);
  };
  // PROFILE DIALOG ITEM CLICK HANDLER
  const profileDialogItemClickHandler = (label) => {
    // IF NO LABEL
    if (!label) return;
    // IF CANCEL WAS CLICKED
    if (label === "Cancel") {
      setShowProfileDialog(false);
      return;
    }
  };
  // AVATAR FALLBACK MANAGEMENT
  const fullNameInitials = userProfile?.fullName
    ? getFullNameInitials(userProfile?.fullName)
    : "";
  // LOADING UI
  if (loading || !userProfile) {
    return (
      <div className="w-screen h-screen max-[1200px]:pl-[70px] max-[768px]:pl-0 px-3 max-[768px]:pt-[75px] max-[768px]:pb-[60px] pl-[250px] flex items-center justify-center g-white">
        <Loader2 size={40} className="animate-spin text-sky-400" />
      </div>
    );
  }
  return (
    // PROFILE MAIN WRAPPER
    <div className="w-full max-[1200px]:pl-[70px] max-[768px]:pl-0 px-3 max-[768px]:pt-[75px] max-[768px]:pb-[60px] pl-[250px] flex items-center justify-center">
      {/* PROFILE CONTENT WRAPPER */}
      {!loading && userProfile && (
        <div className="max-[1200px]:px-6 px-16 w-full flex flex-col items-center justify-center">
          {/* TOP SECTION */}
          <div className="w-full py-10 flex items-center justify-center max-[768px]:flex-col max-[768px]:items-start max-[768px]:justify-start gap-[5rem]">
            {/* AVATAR SECTION */}
            <div>
              <Avatar
                className={`w-45 h-45 cursor-pointer ${
                  userProfile?.profilePhoto === "" ? "bg-gray-300" : "bg-none"
                } `}
              >
                <AvatarImage
                  src={userProfile?.profilePhoto}
                  alt={userProfile?.fullName}
                />
                <AvatarFallback className="text-[3rem] font-bold text-gray-500">
                  {fullNameInitials}
                </AvatarFallback>
              </Avatar>
            </div>
            {/* TEXT SECTION */}
            <div className="flex flex-col items-start justify-start">
              {/* USERNAME & ACTIONS */}
              <div className="flex items-center gap-[1rem]">
                {/* USERNAME */}
                <span className="text-[1.2rem] font-semibold ">
                  {userProfile?.username}
                </span>
                {/* ACTIONS */}
                {userProfile?._id === user?._id ? (
                  <>
                    <button
                      onClick={() => navigate("/home/account/edit")}
                      className="border-none outline-none focus:outline-none bg-gray-200 font-semibold rounded-sm px-3 py-1 hover:bg-gray-300 cursor-pointer text-[0.9rem]"
                    >
                      Edit Profile
                    </button>
                    <button className="border-none outline-none focus:outline-none bg-gray-200 font-semibold rounded-sm px-3 py-1 hover:bg-gray-300 cursor-pointer text-[0.9rem]">
                      View Archive
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        isFollowingOther
                          ? setFollowDialogOpen(true)
                          : followUserHandler()
                      }
                      className="outline-none focus:outline-none bg-sky-400 text-white font-[600] rounded-sm px-3 py-1 hover:bg-sky-300 cursor-pointer text-[0.9rem] border-none flex items-center justify-center gap-1"
                    >
                      {followLoading ? (
                        <Loader2 size={21} className="animate-spin" />
                      ) : (
                        <>
                          <span>
                            {isFollowingOther ? "Following" : "Follow"}
                          </span>
                          <span>
                            {isFollowingOther && <ChevronDown size={20} />}
                          </span>
                        </>
                      )}
                    </button>
                    <button className="outline-none focus:outline-none bg-sky-400 text-white font-[600] rounded-sm px-3 py-1 hover:bg-sky-300 cursor-pointer text-[0.9rem] border-none">
                      Message
                    </button>
                    <button
                      title="Similar Accounts"
                      className="outline-none focus:outline-none bg-sky-400 text-white font-[600] rounded-sm px-2 py-1 hover:bg-sky-300 cursor-pointer text-[0.9rem] border-none"
                    >
                      <UserPlus size={18} />
                    </button>
                  </>
                )}
                {/* FOLLOW DIALOG */}
                <div>
                  <FollowDialog
                    open={followDialogOpen}
                    setOpen={setFollowDialogOpen}
                    user={userProfile}
                  />
                </div>
                {/* PROFILE DIALOG */}
                <Dialog
                  open={showProfileDialog}
                  onOpenChange={setShowProfileDialog}
                >
                  <DialogTrigger asChild>
                    {userProfile?._id === user?._id ? (
                      <div title="Settings" className="cursor-pointer">
                        <Settings size={28} className="hover:text-gray-500" />
                      </div>
                    ) : (
                      <div title="Options" className="cursor-pointer">
                        <MoreHorizontal
                          size={28}
                          className="hover:text-gray-500"
                        />
                      </div>
                    )}
                  </DialogTrigger>
                  <DialogContent
                    onInteractOutside={() => setShowProfileDialog(false)}
                    className="p-0 border-none outline-none focus:outline-none focus-visible:ring-0 rounded-sm"
                  >
                    {/* DIALOG CONTENT WRAPPER */}
                    <div className="w-full flex flex-col items-center justify-center">
                      {dialogItems.map((item) => (
                        <div
                          onClick={() =>
                            profileDialogItemClickHandler(item.label)
                          }
                          className={`flex items-center justify-center w-full py-3 px-3 border-gray-200 ${
                            item.label === "Cancel"
                              ? "border-b-0"
                              : "border-b-2"
                          } font-[600] cursor-pointer ${
                            item.label === "Block" ||
                            item.label === "Report" ||
                            item.label === "Restrict"
                              ? "text-red-500"
                              : "text-black"
                          } hover:bg-gray-100 overflow-hidden ${
                            (item.label === "Apps and Websites" ||
                              item.label === "Block") &&
                            "rounded-t-sm"
                          } ${item.label === "Cancel" && "rounded-b-sm"}`}
                          key={item.id}
                        >
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {/* PROFILE STATS */}
              <div className="flex items-center gap-8 mt-6">
                <span className="text-[1.1rem] font-semibold">
                  {userProfile?.posts?.length}{" "}
                  <span className="text-gray-500 font-normal">
                    {userProfile?.posts?.length === 0
                      ? "posts"
                      : userProfile?.posts?.length === 1
                      ? "post"
                      : "posts"}
                  </span>
                </span>
                <span className="text-[1.1rem] font-semibold">
                  {userProfile?.followers?.length}{" "}
                  <span className="text-gray-500 font-normal">
                    {userProfile?.followers?.length === 0
                      ? "followers"
                      : userProfile?.followers?.length === 1
                      ? "follower"
                      : "followers"}
                  </span>
                </span>
                <span className="text-[1.1rem] font-semibold">
                  {userProfile?.following?.length}{" "}
                  <span className="text-gray-500 font-normal">following</span>
                </span>
              </div>
              {/* FULLNAME */}
              <div className="text-[1.2rem] font-semibold mt-3">
                <h1>{userProfile?.fullName}</h1>
              </div>
              {/* BIO */}
              <div className="text-[1rem] font-normal mt-2">
                <p className="whitespace-pre-wrap">{userProfile?.bio}</p>
              </div>
            </div>
          </div>
          {/* TABS SECTION */}
          <div className="w-full mt-10 border-b-2 border-gray-500">
            {/* TABS ICONS */}
            <div className="grid grid-cols-3 pb-1">
              <div
                title="Posts"
                onClick={() => changeActiveTabHandler("POSTS")}
                className={`flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "POSTS" ? "text-black" : "text-gray-500"
                }`}
              >
                <Grid size={30} className="" />
                {activeTab === "POSTS" && (
                  <div className="w-[4rem] h-[2.5px] bg-black"></div>
                )}
              </div>
              <div
                title="Reels"
                onClick={() => changeActiveTabHandler("REELS")}
                className={`flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "REELS" ? "text-black" : "text-gray-500"
                }`}
              >
                <Film size={30} className="" />
                {activeTab === "REELS" && (
                  <div className="w-[4rem] h-[2.5px] bg-black"></div>
                )}
              </div>
              <div
                title="Tagged"
                onClick={() => changeActiveTabHandler("TAGGED")}
                className={`flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "TAGGED" ? "text-black" : "text-gray-500"
                }`}
              >
                <Tags size={30} className="" />
                {activeTab === "TAGGED" && (
                  <div className="w-[4rem] h-[2.5px] bg-black"></div>
                )}
              </div>
            </div>
          </div>
          {/* TABS CONTENT SECTION */}
          <div className="w-full grid grid-cols-3 max-[768px]:grid-cols-2 max-[600px]:grid-cols-1 gap-2 pt-1 pb-6">
            {userProfile?.posts.map((post) => (
              <div key={post._id} className="relative group cursor-pointer">
                {/* POST IMAGE */}
                <img
                  src={post?.image}
                  alt="Post Image"
                  className="w-full aspect-square object-cover rounded-sm"
                />
                {/* IMAGE OVERLAY */}
                <div
                  onClick={() => {
                    setActivePost(post);
                    setCommentDialogOpen(true);
                  }}
                  className="absolute inset-0 bg-black/70 opacity-0 rounded-sm flex items-center justify-center group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-white flex items-center gap-2">
                      <FaHeart size={"22px"} />
                      <span className="text-[1.1rem] font-semibold">
                        {post?.likes?.length}
                      </span>
                    </div>
                    <div className="text-white flex items-center gap-2">
                      <FaMessage size={"22px"} />
                      <span className="text-[1.1rem] font-semibold">
                        {post?.comments?.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* COMMENT DIALOG */}
          {activePost && (
            <div>
              <CommentDialog
                post={activePost}
                open={commentDialogOpen}
                setOpen={(v) =>
                  v
                    ? setCommentDialogOpen(true)
                    : commentDialogCloseStateHandler()
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
