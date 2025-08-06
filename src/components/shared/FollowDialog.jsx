// <== IMPORTS ==>
import { toast } from "sonner";
import { useState } from "react";
import { setUser } from "@/redux/authSlice";
import axiosClient from "@/utils/axiosClient";
import { Dialog, DialogContent } from "../ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ChevronRight, Loader2, Star, Stars, UserMinus, X } from "lucide-react";

const FollowDialog = ({ open, setOpen, user }) => {
  // DISPATCH
  const dispatch = useDispatch();
  // CURRENT USER CREDENTIALS
  const { user: currentUser } = useSelector((store) => store.auth);
  // UNFOLLOW LOADING STATE
  const [unfollowLoading, setUnfollowLoading] = useState(false);
  // UNFOLLOW USER HANDLER
  const unfollowUserHandler = async () => {
    // LOADING STATE
    setUnfollowLoading(true);
    // MAKING REQUEST
    try {
      const response = await axiosClient.get(
        `/user/followOrUnfollow/${user?._id}`
      );
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // CURRENT USER ORIGINAL FOLLOWING LIST
        const originalFollowing = currentUser?.following
          ? [...currentUser.following]
          : [];
        // UPDATING THE CURRENT USER FOLLOWING
        const newFollowing = originalFollowing.filter((id) => id !== user?._id);
        // DISPATCHING UPDATED CURRENT USER IN THE AUTH SLICE
        dispatch(setUser({ ...currentUser, following: newFollowing }));
        // CLOSING THE DIALOG
        setOpen(false);
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
      setUnfollowLoading(false);
    }
  };
  // AVATAR FALLBACK MANAGEMENT
  const fullNameInitials = user?.fullName
    ? getFullNameInitials(user?.fullName)
    : "";
  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="p-0 border-none outline-none focus:outline-none focus-visible:ring-0 rounded-xl"
      >
        {/* DIALOG CONTENT WRAPPER */}
        <div className="w-full flex flex-col items-start justify-start">
          {/* HEADER */}
          <div className="w-full p-4 flex flex-col items-center justify-center gap-2 relative">
            {/* AVATAR */}
            <Avatar
              className={`w-18 h-18 cursor-pointer ${
                user?.profilePhoto === "" ? "bg-gray-300" : "bg-none"
              } `}
            >
              <AvatarImage
                className="w-18 h-18"
                src={user?.profilePhoto}
                alt={user?.fullName}
              />
              <AvatarFallback>{fullNameInitials}</AvatarFallback>
            </Avatar>
            {/* USERNAME */}
            <span className="text-[1rem] font-semibold">{user?.username}</span>
            {/* CLOSE BUTTON */}
            <span
              className="absolute top-3 right-3 cursor-pointer"
              title="Close"
              onClick={() => setOpen(false)}
            >
              <X size={30} className="hover:text-gray-500" />
            </span>
          </div>
          {/* ACTIONS */}
          <div className="w-full flex flex-col items-start justify-start">
            {/* CLOSE FRIENDS LIST */}
            <div className="w-full flex items-center justify-between p-3 hover:bg-gray-200 cursor-pointer border-t-2 border-gray-200 ">
              <span className="text-[0.9rem] font-semibold">
                Add to Close Friends
              </span>
              <Stars size={25} />
            </div>
            {/* FAVORITES */}
            <div className="w-full flex items-center justify-between p-3 hover:bg-gray-200 cursor-pointer">
              <span className="text-[0.9rem] font-semibold">
                Add to Favorites
              </span>
              <Star size={25} />
            </div>
            {/* MUTE */}
            <div className="w-full flex items-center justify-between p-3 hover:bg-gray-200 cursor-pointer">
              <span className="text-[0.9rem] font-semibold">Mute</span>
              <ChevronRight size={25} />
            </div>
            {/* RESTRICT */}
            <div className="w-full flex items-center justify-between p-3 hover:bg-gray-200 cursor-pointer">
              <span className="text-[0.9rem] font-semibold">Restrict</span>
              <ChevronRight size={25} />
            </div>
            {/* UNFOLLOW */}
            <div
              onClick={unfollowUserHandler}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-200 rounded-b-xl cursor-pointer"
            >
              <span className="text-[0.9rem] font-semibold">Unfollow</span>
              {unfollowLoading ? (
                <Loader2 size={25} className="animate-spin" />
              ) : (
                <UserMinus size={25} />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowDialog;
