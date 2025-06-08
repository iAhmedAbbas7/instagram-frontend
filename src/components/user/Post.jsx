// <= IMPORTS =>
import { useState } from "react";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import I1 from "../../assets/images/I1.jpg";
import I2 from "../../assets/images/I2.jpg";
import I3 from "../../assets/images/I3.jpg";
import { FaRegHeart } from "react-icons/fa6";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getShortRelativeTime } from "@/utils/time";
import CommentDialog from "../shared/CommentDialog";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import {
  Bookmark,
  MessageCircle,
  MoreHorizontal,
  Send,
  UserPlus,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

// <= HOVER CARD IMAGES =>
const hoverCardImages = [I1, I2, I3];

const Post = ({ post }) => {
  // GETTING CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // POST DIALOG STATE
  const [showPostDialog, setShowPostDialog] = useState(false);
  // COMMENT STATE
  const [comment, setComment] = useState("");
  // COMMENT DIALOG STATE
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  // OWNER'S POST DIALOG ITEMS
  const ownersPostItems = [
    { id: 1, label: "Delete" },
    { id: 2, label: "Edit" },
    { id: 3, label: "Hide Like count to others" },
    { id: 4, label: "Turn off commenting" },
    { id: 5, label: "Go to Post" },
    { id: 6, label: "Share to..." },
    { id: 7, label: "Copy Link" },
    { id: 8, label: "Embed" },
    { id: 9, label: "About this Account" },
    { id: 10, label: "Cancel" },
  ];
  // OTHER'S POST DIALOG ITEMS
  const othersPostItems = [
    { id: 1, label: "Report" },
    { id: 2, label: "Follow" },
    { id: 3, label: "Add to Favorites" },
    { id: 4, label: "Go to Post" },
    { id: 5, label: "Share to..." },
    { id: 6, label: "Copy Link" },
    { id: 7, label: "Embed" },
    { id: 8, label: "About this Account" },
    { id: 9, label: "Cancel" },
  ];
  // SETTING THE POST OWNER
  const isOwner = post?.author?._id === user._id;
  // SETTING MENU ITEMS ACCORDING TO THE LOGGED IN USER
  const postDialogItems = isOwner ? ownersPostItems : othersPostItems;
  // POST CREATION TIME STRING
  const shortTime = getShortRelativeTime(post.createdAt);
  // AVATAR FALLBACK MANAGEMENT
  const fullName = post?.author?.fullName || "";
  // DERIVING PARTS OF THE FULLNAME
  const fullNameParts = fullName.split(" ").filter(Boolean);
  // GETTING INITIALS OF THE FULLNAME
  const fullNameInitials =
    fullNameParts.length > 1
      ? (
          fullNameParts[0][0] + fullNameParts[fullNameParts.length - 1][0]
        ).toUpperCase()
      : fullName.slice(0, 2).toUpperCase();
  // CHANGE EVENT HANDLER
  const emptyCommentHandler = (e) => {
    // INPUT TEXT
    const inputText = e.target.value;
    // AVOIDING EMPTY COMMENT
    if (inputText.trim()) {
      setComment(inputText);
    } else {
      setComment("");
    }
  };
  // POST DIALOG ITEM CLICK HANDLER
  const postDialogItemClickHandler = (label) => {
    // IF NO LABEL
    if (!label) return;
    // IF CANCEL IS CLICKED
    if (label === "Cancel") {
      setShowPostDialog(false);
      return;
    }
  };
  return (
    <div className="mb-6 mx-auto max-w-xl">
      {/* POST HEADER */}
      <div className="w-full flex items-center justify-between">
        {/* AVATAR & USERNAME */}
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <HoverCard className="relative">
            <HoverCardTrigger asChild>
              <Avatar
                className={`w-10 h-10 cursor-pointer ${
                  post?.author?.profilePhoto === "" ? "bg-gray-300" : "bg-none"
                } `}
              >
                <AvatarImage
                  src={post?.author?.profilePhoto}
                  alt={post?.author?.fullName}
                />
                <AvatarFallback>{fullNameInitials}</AvatarFallback>
              </Avatar>
            </HoverCardTrigger>
            <HoverCardContent className="absolute -left-4 border-none outline-none focus:outline-none focus-visible:ring-0 rounded-sm p-0 w-[400px] shadow-2xl bg-white">
              {/* HOVER CONTENT MAIN WRAPPER */}
              <div className="w-full flex flex-col items-center justify-center">
                {/* HEADER */}
                <div className="px-6 py-6 w-full flex items-center gap-3">
                  {/* AVATAR */}
                  <div>
                    <Avatar
                      className={`w-10 h-10 cursor-pointer ${
                        post?.author?.profilePhoto === ""
                          ? "bg-gray-300"
                          : "bg-none"
                      } `}
                    >
                      <AvatarImage
                        src={post?.author?.profilePhoto}
                        alt={post?.author?.fullName}
                      />
                      <AvatarFallback>{fullNameInitials}</AvatarFallback>
                    </Avatar>
                  </div>
                  {/* USER INFO */}
                  <div className="flex flex-col items-start justify-center">
                    <span className="flex items-center gap-2 font-[600] text-[1rem]">
                      {post?.author?.username}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {post?.author?.fullName}
                    </span>
                  </div>
                </div>
                {/* PROFILE INFO */}
                <div className="w-full flex items-center justify-evenly pb-4">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[1.1rem] font-[600]">
                      {post?.author?.posts?.length}
                    </span>
                    <span className="text-sm text-gray-500">posts</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[1.1rem] font-[600]">
                      {post?.author?.followers?.length}
                    </span>
                    <span className="text-sm text-gray-500">followers</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[1.1rem] font-[600]">
                      {post?.author?.following?.length}
                    </span>
                    <span className="text-sm text-gray-500">following</span>
                  </div>
                </div>
                {/* POSTS SECTION */}
                <div className="w-full flex items-center justify-center gap-[0.2rem] my-4">
                  {hoverCardImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt="Hover Image"
                      className="h-[8.19rem] object-cover aspect-square"
                    />
                  ))}
                </div>
                {/* FOLLOW & MESSAGE BUTTON */}
                <div className="w-full pt-2 pb-4 flex items-center justify-center gap-3 px-5">
                  <Button
                    type="button"
                    className="bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer w-1/2"
                  >
                    <UserPlus size={50} />
                    Follow
                  </Button>
                  <Button
                    type="button"
                    className="bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer w-1/2"
                  >
                    <MessageCircle size={50} />
                    Message
                  </Button>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          {/* USERNAME */}
          <div className="flex flex-col items-start justify-center">
            <span className="flex items-center gap-2 font-[600] text-[0.9rem]">
              <HoverCard className="relative">
                <HoverCardTrigger asChild>
                  <span className="hover:text-gray-500 cursor-pointer">
                    {post?.author?.username}
                  </span>
                </HoverCardTrigger>
                <HoverCardContent className="absolute -left-8 border-none outline-none focus:outline-none focus-visible:ring-0 rounded-sm p-0 w-[400px] shadow-2xl bg-white">
                  {/* HOVER CONTENT MAIN WRAPPER */}
                  <div className="w-full flex flex-col items-center justify-center">
                    {/* HEADER */}
                    <div className="px-6 py-6 w-full flex items-center gap-3">
                      {/* AVATAR */}
                      <div>
                        <Avatar
                          className={`w-10 h-10 cursor-pointer ${
                            post?.author?.profilePhoto === ""
                              ? "bg-gray-300"
                              : "bg-none"
                          } `}
                        >
                          <AvatarImage
                            src={post?.author?.profilePhoto}
                            alt={post?.author?.fullName}
                          />
                          <AvatarFallback>{fullNameInitials}</AvatarFallback>
                        </Avatar>
                      </div>
                      {/* USER INFO */}
                      <div className="flex flex-col items-start justify-center">
                        <span className="flex items-center gap-2 font-[600] text-[1rem]">
                          {post?.author?.username}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {post?.author?.fullName}
                        </span>
                      </div>
                    </div>
                    {/* PROFILE INFO */}
                    <div className="w-full flex items-center justify-evenly pb-4">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[1.1rem] font-[600]">
                          {post?.author?.posts?.length}
                        </span>
                        <span className="text-sm text-gray-500">posts</span>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[1.1rem] font-[600]">
                          {post?.author?.followers?.length}
                        </span>
                        <span className="text-sm text-gray-500">followers</span>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[1.1rem] font-[600]">
                          {post?.author?.following?.length}
                        </span>
                        <span className="text-sm text-gray-500">following</span>
                      </div>
                    </div>
                    {/* POSTS SECTION */}
                    <div className="w-full flex items-center justify-center gap-[0.2rem] my-4">
                      {hoverCardImages.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt="Hover Image"
                          className="h-[8.19rem] object-cover aspect-square"
                        />
                      ))}
                    </div>
                    {/* FOLLOW & MESSAGE BUTTON */}
                    <div className="w-full pt-2 pb-4 flex items-center justify-center gap-3 px-5">
                      <Button
                        type="button"
                        className="bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer w-1/2"
                      >
                        <UserPlus size={50} />
                        Follow
                      </Button>
                      <Button
                        type="button"
                        className="bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer w-1/2"
                      >
                        <MessageCircle size={50} />
                        Message
                      </Button>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
              <span className="text-sm font-[600] text-gray-500">
                • {shortTime}
              </span>
            </span>
            <span className="text-gray-500 text-xs">Location</span>
          </div>
        </div>
        {/* POST DIALOG */}
        <div className="cursor-pointer">
          <Dialog
            open={showPostDialog}
            onOpenChange={setShowPostDialog}
            className="z-[99999]"
          >
            <DialogTrigger asChild>
              <MoreHorizontal />
            </DialogTrigger>
            <DialogContent
              onInteractOutside={() => setShowPostDialog(false)}
              className="p-0 border-none outline-none focus:outline-none focus-visible:ring-0 rounded-sm"
            >
              {/* DIALOG CONTENT WRAPPER */}
              <div className="w-full flex flex-col items-center justify-center">
                {postDialogItems.map((item) => (
                  <div
                    onClick={() => postDialogItemClickHandler(item.label)}
                    className={`flex items-center justify-center w-full py-3 px-3 border-gray-200 ${
                      item.label === "Cancel" ? "border-b-0" : "border-b-2"
                    } font-[600] cursor-pointer ${
                      item.label === "Unfollow" ||
                      item.label === "Report" ||
                      item.label === "Delete"
                        ? "text-red-500"
                        : "text-black"
                    } hover:bg-gray-100 overflow-hidden ${
                      item.label === "Report" ||
                      (item.label === "Delete" && "rounded-t-sm")
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
      </div>
      {/* POST IMAGE */}
      <div className="w-full h-full mt-1">
        <img
          src={post?.image}
          alt="Post Image"
          className="w-full h-full object-cover rounded-sm"
        />
      </div>
      {/* POST ACTIONS */}
      <div className="w-full flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {/* LIKE */}
          <span title="Like">
            <FaRegHeart
              size={"28px"}
              className="hover:text-gray-500 cursor-pointer"
            />
          </span>
          {/* COMMENT */}
          <span title="Comment">
            <MessageCircle
              onClick={() => setCommentDialogOpen(true)}
              size={"28px"}
              className="hover:text-gray-500 cursor-pointer"
            />
          </span>
          {/* SHARE */}
          <span title="Share">
            <Send
              size={"28px"}
              className="hover:text-gray-500 cursor-pointer"
            />
          </span>
        </div>
        {/* BOOKMARK */}
        <div title="Save">
          <Bookmark
            size={"28px"}
            className="hover:text-gray-500 cursor-pointer"
          />
        </div>
      </div>
      {/* POST LIKES */}
      <span className="font-[600] mt-1">{post?.likes?.length} likes</span>
      {/* POST AUTHOR & DESCRIPTION */}
      <div className="w-full  flex items-center gap-3">
        <span className="font-[600]">{post?.author?.fullName}</span>
        <span>{post?.caption}</span>
      </div>
      {/* VIEW COMMENTS */}
      <span
        onClick={() => setCommentDialogOpen(true)}
        className="text-[0.975rem] text-gray-500 hover:text-gray-600 cursor-pointer"
      >
        {post?.comments.length > 0
          ? `View all ${post?.comments?.length} comments`
          : "No comments yet"}
      </span>
      {/* COMMENT DIALOG */}
      <CommentDialog
        post={post}
        open={commentDialogOpen}
        setOpen={setCommentDialogOpen}
      />
      {/* ADD COMMENT */}
      <div className="w-full flex items-center justify-between mt-1 relative">
        <input
          type="text"
          value={comment}
          onChange={emptyCommentHandler}
          name="comment"
          id="comment"
          placeholder="Add a comment..."
          className="w-full border-b border-gray-300 focus:outline-none outline-none pr-4 text-gray-500 pb-3 text-sm placeholder:text-gray-600"
        />
        {comment && (
          <span className="absolute right-0 text-sky-500 font-[600] pb-3 text-sm cursor-pointer">
            Post
          </span>
        )}
      </div>
    </div>
  );
};

export default Post;
