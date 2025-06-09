// <= IMPORTS =>
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import I1 from "../../assets/images/I1.jpg";
import I2 from "../../assets/images/I2.jpg";
import I3 from "../../assets/images/I3.jpg";
import { setPosts } from "@/redux/postSlice";
import { formatDistanceStrict } from "date-fns";
import { getShortRelativeTime } from "@/utils/time";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { POST_API_ENDPOINT } from "@/utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
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

const CommentDialog = ({ post, open, setOpen }) => {
  // GETTING CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // GETTING POSTS FROM THE POST SLICE
  const { posts } = useSelector((store) => store.post);
  // DISPATCH
  const dispatch = useDispatch();
  // POST DIALOG STATE
  const [showPostDialog, setShowPostDialog] = useState(false);
  // COMMENT STATE
  const [comment, setComment] = useState("");
  // LIKED POST STATE
  const [liked, setLiked] = useState(post?.likes?.includes(user?._id) || false);
  // POST LIKES STATE
  const [postLikes, setPostLikes] = useState(post?.likes?.length);
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
  // SYNCHRONIZING THE POST LIKES
  useEffect(() => {
    setLiked(post?.likes?.includes(user._id));
    setPostLikes(post?.likes?.length);
  }, [user._id, post.likes]);
  // SETTING THE POST OWNER
  const isOwner = post?.author?._id === user._id;
  // SETTING MENU ITEMS ACCORDING TO THE LOGGED IN USER
  const postDialogItems = isOwner ? ownersPostItems : othersPostItems;
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
  // POST CREATION TIME STRING # 1
  const shortTime = getShortRelativeTime(post.createdAt);
  // POST CREATION TIME STRING # 2
  const postTime = formatDistanceStrict(post.createdAt, new Date(), {
    roundingMethod: "floor",
    addSuffix: true,
  });
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
  // LIKE OR UNLIKE POST HANDLER
  const likeOrUnlikePostHandler = async () => {
    try {
      // MAKING REQUEST
      const response = await axios.get(
        `${POST_API_ENDPOINT}/likeOrUnlike/${post._id}`,
        { withCredentials: true }
      );
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // CREATING UPDATED POST LIKES BASED ON ACTION
        const updatedLikes = liked ? postLikes + 1 : postLikes - 1;
        // SETTING UPDATED LIKES
        setPostLikes(updatedLikes);
        // UPDATING LIKE STATE BASED ON PREVIOUS VALUE
        setLiked(!liked);
        // UPDATING THE POST LIKES IN THE POSTS STATE
        const updatedPosts = posts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id !== user?._id)
                  : [...p.likes, user._id],
              }
            : p
        );
        // SETTING UPDATED POSTS
        dispatch(setPosts(updatedPosts));
        // TOASTING SUCCESS MESSAGE
        toast.success(response.data.message);
      }
    } catch (error) {
      // LOGGING ERROR MESSAGE
      console.error("Failed to Perform Action!", error);
      // TOASTING ERROR MESSAGE
      toast.error(
        error?.response?.data?.message || "Failed to Perform Action!"
      );
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
    <Dialog open={open}>
      {/* MAIN DIALOG CONTENT BOX */}
      <DialogContent
        className="p-0 border-none outline-none focus-visible:ring-0 focus:outline-none rounded-sm flex items-center justify-center sm:max-w-[80vw]"
        onInteractOutside={() => setOpen(false)}
      >
        {/* COMMENT DIALOG CONTENT WRAPPER */}
        <section className="flex h-[90vh] w-full">
          {/* POST IMAGE SECTION */}
          <div className="w-1/2 flex items-center justify-center">
            <img
              src={post?.image}
              alt="Post Image"
              className="w-full h-full rounded-l-sm object-cover"
            />
          </div>
          {/* POST COMMENTS SECTION */}
          <div className="w-1/2 flex flex-col items-center justify-between rounded-r-sm">
            {/* SECTION HEADER */}
            <div className="w-full py-4 bg-white flex items-center justify-between border-b-2 border-gray-200 px-4 rounded-tr-sm">
              {/* AVATAR & USERNAME */}
              <div className="flex items-center gap-3">
                {/* AVATAR */}
                <HoverCard className="relative">
                  <HoverCardTrigger asChild>
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
                          <span className="text-sm text-gray-500">
                            followers
                          </span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-[1.1rem] font-[600]">
                            {post?.author?.following?.length}
                          </span>
                          <span className="text-sm text-gray-500">
                            following
                          </span>
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
                                <AvatarFallback>
                                  {fullNameInitials}
                                </AvatarFallback>
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
                              <span className="text-sm text-gray-500">
                                posts
                              </span>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                              <span className="text-[1.1rem] font-[600]">
                                {post?.author?.followers?.length}
                              </span>
                              <span className="text-sm text-gray-500">
                                followers
                              </span>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                              <span className="text-[1.1rem] font-[600]">
                                {post?.author?.following?.length}
                              </span>
                              <span className="text-sm text-gray-500">
                                following
                              </span>
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
                            item.label === "Cancel"
                              ? "border-b-0"
                              : "border-b-2"
                          } font-[600] cursor-pointer ${
                            item.label === "Unfollow" ||
                            item.label === "Report" ||
                            item.label === "Delete"
                              ? "text-red-500"
                              : "text-black"
                          } hover:bg-gray-100 overflow-hidden ${
                            (item.label === "Report" ||
                              item.label === "Delete") &&
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
            </div>
            {/* COMMENTS AREA */}
            <div className="w-full py-5 px-4">
              {post?.comments?.length <= 0 && (
                <div className="flex items-center justify-center h-full w-full">
                  <span className="text-gray-500 text-sm">
                    No comments yet. Be the first to comment!
                  </span>
                </div>
              )}
            </div>
            {/* SECTION FOOTERS */}
            <div className="w-full flex flex-col items-center justify-center">
              {/* FOOTER -1  */}
              <div className="flex flex-col items-center justify-center w-full px-4 py-3 border-t-2 border-gray-200">
                {/* TOP SECTION */}
                <div className="w-full flex items-center justify-between">
                  {/* POST ACTIONS */}
                  <div className="flex items-center gap-2">
                    {/* LIKE */}
                    <span
                      title={liked ? "Unlike" : "Like"}
                      onClick={likeOrUnlikePostHandler}
                    >
                      {liked ? (
                        <FaHeart
                          size={"28px"}
                          className="text-red-500 cursor-pointer"
                        />
                      ) : (
                        <FaRegHeart
                          size={"28px"}
                          className="hover:text-gray-500 cursor-pointer"
                        />
                      )}
                    </span>
                    {/* COMMENT */}
                    <span title="Comment">
                      <MessageCircle
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
                <span className="w-full font-[600] mt-3">
                  {post?.likes?.length}{" "}
                  {post?.likes?.length === 1 ? "like" : "likes"}
                </span>
                {/* POST TIME */}
                <span className="w-full text-sm text-gray-500">{postTime}</span>
              </div>
              {/* FOOTER - 2 */}
              <div className="w-full py-3 px-4 border-t-2 border-gray-200">
                <input
                  type="text"
                  name="comment"
                  id="comment"
                  value={comment}
                  onChange={emptyCommentHandler}
                  placeholder="Add a comment..."
                  className="border-none outline-none focus:outline-none text-sm placeholder:text-gray-600 text-gray-500"
                />
                {comment && (
                  <span className="absolute right-4 text-sky-500 font-[600] pb-3 text-sm cursor-pointer">
                    Post
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
