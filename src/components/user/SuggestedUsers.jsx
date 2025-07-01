// <= IMPORTS =>
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";
import UserHoverCard from "../shared/UserHoverCard";
import { useDispatch, useSelector } from "react-redux";
import { setSuggestedUsers, setUser } from "@/redux/authSlice";
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const SuggestedUsers = () => {
  // DISPATCH
  const dispatch = useDispatch();
  // GETTING CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // USING GET SUGGESTED USERS HOOK
  const { loading } = useGetSuggestedUsers();
  // GETTING SUGGESTED USERS FROM AUTH SLICE
  const { suggestedUsers } = useSelector((store) => store.auth);
  // FOLLOWING STATE MANAGEMENT
  const [following, setFollowing] = useState({});
  // SYNCING THE FOLLOWING STATE WITH CURRENT USER FOLLOWING LIST
  useEffect(() => {
    // IF USER & SUGGESTED USER EXISTS
    if (user && suggestedUsers) {
      // CREATING A FOLLOWING MAP
      const followingMap = {};
      // DERIVING FOLLOWING STATE FOR EACH SUGGESTED USER
      suggestedUsers.forEach((user) => {
        followingMap[user._id] = user?.following.includes(user._id) || false;
      });
      // SETTING FOLLOWING STATE
      setFollowing(followingMap);
    }
  }, [user, suggestedUsers]);
  // FOLLOW OR UNFOLLOW HANDLER
  const followOrUnfollowHandler = async (userId) => {
    // SNAPSHOT OF THE ORIGINAL SUGGESTED USERS LIST
    const originalSuggestedList = suggestedUsers;
    // SNAPSHOT OF ORIGINAL FOLLOWING STATE & USER FOLLOWING
    const originalFollowingState = { ...following };
    const originalFollowingList = user?.following ? [...user.following] : [];
    // OPTIMISTICALLY UPDATING THE FOLLOWING STATE
    setFollowing((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
    // MAKING REQUEST
    // OPTIMISTICALLY UPDATING USER FOLLOWING
    let updatedFollowingList;
    // IF ALREADY FOLLOWING THEN REMOVING IT, OTHERWISE ADDING IT
    if (originalFollowingState[userId]) {
      updatedFollowingList = originalFollowingList.filter(
        (id) => id !== userId
      );
    } else {
      updatedFollowingList = [userId, ...originalFollowingList];
    }
    // DISPATCHING UPDATED USER IN THE AUTH SLICE
    dispatch(setUser({ ...user, following: updatedFollowingList }));
    // OPTIMISTICALLY REMOVING THE SUGGESTED USER FROM THE LIST
    dispatch(setSuggestedUsers(suggestedUsers.filter((u) => u._id !== userId)));
    try {
      const response = await axiosClient.get(
        `/user/followOrUnfollow/${userId}`
      );
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // TOASTING SUCCESS MESSAGE
        toast.success(response.data.message);
      }
    } catch (error) {
      // REVERTING CHANGES TO ORIGINAL ON ERROR
      setFollowing(originalFollowingState);
      dispatch(setSuggestedUsers(originalSuggestedList));
      dispatch(setUser({ ...user, following: originalFollowingList }));
      // LOGGING ERROR MESSAGE
      console.error("Failed to Perform Action!", error);
      // TOASTING ERROR MESSAGE
      toast.error(
        error?.response?.data?.message || "Failed to Perform Action!"
      );
    }
  };
  return (
    // SUGGESTED USERS MAIN WRAPPER
    <div className="w-full">
      {/* HEADING */}
      <div className="flex items-center justify-between w-full text-gray-500 font-semibold text-[0.9rem]">
        <h1>Suggested for you</h1>
        <span className="text-black text-sm font-semibold cursor-pointer">
          See All
        </span>
      </div>
      {/* SUGGESTED USERS SECTION */}
      <div className="w-full">
        {/* IF LOADING */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={30} className="animate-spin text-gray-500" />
          </div>
        )}
        {/* IF NOT LOADING */}
        <section className="w-full flex flex-col items-start justify-start gap-4 my-5">
          {!loading &&
            suggestedUsers.length > 0 &&
            suggestedUsers.map((suggestedUser) => {
              // AVATAR FALLBACK MANAGEMENT
              const fullNameInitials = getFullNameInitials(
                suggestedUser?.fullName
              );
              // CHECKING IF THE SUGGESTED USER FOLLOWS THE CURRENT USER
              const isFollowingMe = suggestedUser?.following?.includes(
                user?._id
              );
              // SETTING THE FOLLOW LABEL ACCORDINGLY
              let followLabel = "Follow";
              // IF IS FOLLOWED BY ME
              if (following[suggestedUser?._id]) {
                followLabel = "Unfollow";
              }
              // IF I AM BEING FOLLOWED
              else if (isFollowingMe) {
                followLabel = "Follow Back";
              }
              return (
                <div
                  className="flex items-center justify-between w-full"
                  key={suggestedUser?._id}
                >
                  {/* AVATAR & USERNAME */}
                  <div className="flex items-center gap-3">
                    {/* AVATAR */}
                    <UserHoverCard user={suggestedUser}>
                      <Avatar
                        className={`w-11 h-11 cursor-pointer ${
                          suggestedUser?.profilePhoto === ""
                            ? "bg-gray-300"
                            : "bg-none"
                        } `}
                      >
                        <AvatarImage
                          src={suggestedUser?.profilePhoto}
                          alt={suggestedUser?.fullName}
                        />
                        <AvatarFallback>{fullNameInitials}</AvatarFallback>
                      </Avatar>
                    </UserHoverCard>
                    {/* USERNAME */}
                    <div className="flex flex-col cursor-pointer">
                      <UserHoverCard user={suggestedUser}>
                        <span className="font-semibold text-[0.9rem]">
                          {suggestedUser?.username}
                        </span>
                      </UserHoverCard>
                      <span className="text-gray-500 text-sm">
                        {suggestedUser?.fullName}
                      </span>
                    </div>
                  </div>
                  {/* FOLLOW BUTTON */}
                  <span
                    onClick={() => followOrUnfollowHandler(suggestedUser?._id)}
                    className="cursor-pointer text-xs text-sky-400 hover:text-sky-500 font-semibold bg-gray-100 px-3 py-1 rounded-sm hover:bg-gray-200"
                  >
                    {followLabel}
                  </span>
                </div>
              );
            })}
        </section>
        {/* IF NO SUGGESTED USERS */}
        {!loading && suggestedUsers.length === 0 && (
          <div className="flex items-center justify-center">
            <h5 className="text-sm text-gray-500">No suggestions for you</h5>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestedUsers;
