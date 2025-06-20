// <= IMPORTS =>
import { useSelector } from "react-redux";
import SuggestedUsers from "../user/SuggestedUsers";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const RightSidebar = () => {
  // CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // AVATAR FALLBACK MANAGEMENT
  const fullNameInitials = getFullNameInitials(user?.fullName);
  return (
    // RIGHT SIDEBAR MAIN WRAPPER
    <div className="flex flex-col gap-6 items-start justify-start max-[1160px]:hidden min-w-[270px]">
      {/* AVATAR & USERNAME */}
      <div className="flex items-center gap-3 w-full">
        {/* AVATAR */}
        <Avatar
          className={`w-11 h-11 cursor-pointer ${
            user.profilePhoto === "" ? "bg-gray-300" : "bg-none"
          } `}
        >
          <AvatarImage src={user.profilePhoto} alt={user.fullName} />
          <AvatarFallback>{fullNameInitials}</AvatarFallback>
        </Avatar>
        {/* USERNAME */}
        <div className="flex flex-col">
          <span className="font-semibold text-[0.9rem]">{user?.username}</span>
          <span className="text-gray-500 text-sm">{user?.fullName}</span>
        </div>
      </div>
      {/* SUGGESTED USERS */}
      <SuggestedUsers />
    </div>
  );
};

export default RightSidebar;
