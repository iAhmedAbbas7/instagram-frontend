// <= IMPORTS =>
import { Heart } from "lucide-react";
import { getShortRelativeTime } from "@/utils/time";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const Comment = ({ comment }) => {
  // POST CREATION TIME STRING # 1
  const shortTime = getShortRelativeTime(comment.createdAt);
  // AVATAR FALLBACK MANAGEMENT
  const fullName = comment?.author?.fullName || "";
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
    <div className="flex items-start gap-3">
      {/* AVATAR */}
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
      {/* COMMENT TEXT SECTION */}
      <div>
        {/* AUTHOR USERNAME & TEXT */}
        <div className="font-[600] text-[0.9rem]">
          {comment?.author?.username}
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
