// <= IMPORTS =>
import { useSelector } from "react-redux";
import SuggestedUsers from "../user/SuggestedUsers";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const RightSidebar = () => {
  // CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // AVATAR FALLBACK MANAGEMENT
  const fullName = user?.fullName || "";
  // DERIVING PARTS OF THE FULLNAME
  const fullNameParts = fullName.split(" ").filter(Boolean);
  // GETTING INITIALS OF THE FULLNAME
  const fullNameInitials =
    fullNameParts.length > 1
      ? (
          fullNameParts[0][0] + fullNameParts[fullNameParts.length - 1][0]
        ).toUpperCase()
      : fullName.slice(0, 2).toUpperCase();
  return (
    // RIGHT SIDEBAR MAIN WRAPPER
    <div className="flex flex-col gap-6 items-start justify-start pr-36">
      {/* AVATAR & USERNAME */}
      <div className="flex items-center gap-3">
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
