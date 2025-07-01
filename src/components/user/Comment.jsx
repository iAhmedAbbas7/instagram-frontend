// <= IMPORTS =>
import { Heart } from "lucide-react";
import UserHoverCard from "../shared/UserHoverCard";
import { getShortRelativeTime } from "@/utils/time";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const Comment = ({ comment }) => {
  // POST CREATION TIME STRING # 1
  const shortTime = getShortRelativeTime(comment.createdAt);
  // AVATAR FALLBACK MANAGEMENT
  const fullNameInitials = comment?.author?.fullName
    ? getFullNameInitials(comment?.author?.fullName)
    : "";
  return (
    <div className="flex items-start gap-3">
      {/* AVATAR */}
      <UserHoverCard user={comment?.author}>
        <Avatar
          className={`w-10 h-10 cursor-pointer ${
            comment?.author?.profilePhoto === "" ? "bg-gray-300" : "bg-none"
          } `}
        >
          <AvatarImage
            src={comment?.author?.profilePhoto}
            alt={comment?.author?.fullName}
          />
          <AvatarFallback>{fullNameInitials}</AvatarFallback>
        </Avatar>
      </UserHoverCard>
      {/* COMMENT TEXT SECTION */}
      <div>
        {/* AUTHOR USERNAME & TEXT */}
        <div className="font-[600] text-[0.9rem]">
          <UserHoverCard user={comment?.author}>
            <span className="hover:text-gray-500 cursor-pointer">
              {comment?.author?.username}
            </span>
          </UserHoverCard>
          <span className="font-normal ml-3">{comment?.text}</span>
        </div>
        {/* COMMENT ACTIONS */}
        <div className="flex items-center gap-3 text-gray-500 text-xs mt-0.5">
          <span className="">{shortTime}</span>
          <span className="cursor-pointer font-semibold">0 likes</span>
          <span className="cursor-pointer font-semibold">Reply</span>
          <span className="flex items-center justify-center">
            <Heart size={"12px"} className="cursor-pointer" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default Comment;
