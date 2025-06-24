// <= IMPORTS =>
import { toast } from "sonner";
import { Button } from "../ui/button";
import Comment from "../user/Comment";
import { useEffect, useState } from "react";
import I1 from "../../assets/images/I1.jpg";
import I2 from "../../assets/images/I2.jpg";
import I3 from "../../assets/images/I3.jpg";
import { setPosts } from "@/redux/postSlice";
import axiosClient from "@/utils/axiosClient";
import { formatDistanceStrict } from "date-fns";
import { setUserProfile } from "@/redux/authSlice";
import { getShortRelativeTime } from "@/utils/time";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import {
  Bookmark,
  Heart,
  Loader2,
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
  // GETTING USER PROFILE FORM AUTH SLICE
  const { userProfile } = useSelector((store) => store.auth);
  // DISPATCH
  const dispatch = useDispatch();
  // LIKES STATE FOR EACH POST
  const [likes, setLikes] = useState([]);
  // COMMENT STATE
  const [comment, setComment] = useState("");
  // LIKE ANIMATION STATE
  const [showAnimation, setShowAnimation] = useState(false);
  // LIKES LOADING STATE
  const [likesLoading, setLikesLoading] = useState(false);
  // COMMENT POSTING LOADING STATE
  const [postCommentLoading, setPostCommentLoading] = useState(false);
  // DELETE POST LOADING STATE
  const [deleteLoading, setDeleteLoading] = useState(false);
  // POST DIALOG STATE
  const [showPostDialog, setShowPostDialog] = useState(false);
  // LIKED POST STATE
  const [liked, setLiked] = useState(post?.likes?.includes(user?._id) || false);
  // POST LIKES STATE
  const [postLikes, setPostLikes] = useState(post?.likes?.length);
  // POST COMMENTS STATE
  const [postComments, setPostComments] = useState(post?.comments);
  // POST COMMENTS COUNT STATE
  const [commentsLength, setCommentsLength] = useState(post?.comments?.length);
  // DELETE POST DIALOG STATE
  const [deletePostDialogOpen, setShowDeletePostDialogOpen] = useState(false);
  // LIKES DIALOG STATE
  const [likesDialogOpen, setLikesDialogOpen] = useState(false);
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
  // SETTING USER PROFILE POST LIKES LENGTH
  const postLikesLength = userProfile?.posts?.find((p) => p._id === post._id)
    ?.likes?.length;
  // FETCHING LIKES FOR THE POST ON RENDER
  useEffect(() => {
    const fetchPostLikes = async () => {
      // LIKES LOADING STATE
      setLikesLoading(true);
      try {
        const response = await axiosClient.get(`/post/${post?._id}/likes`);
        // IF RESPONSE SUCCESS
        if (response.data.success) {
          // SETTING POST LIKES
          setLikes(response.data.likes);
        }
      } catch (error) {
        // LOGGING ERROR MESSAGE
        console.log(error);
      } finally {
        // LIKES LOADING STATE
        setLikesLoading(false);
      }
    };
    fetchPostLikes();
  }, [post?._id, open, post.likes]);
  // FETCHING LIKES FOR THE USER PROFILE POST ON RENDER
  useEffect(() => {
    // IF USER PROFILE & USER PROFILE POSTS EXISTS
    if (userProfile && userProfile.posts && post?._id) {
      // FINDING THE UPDATED POST IN THE USER PROFILE POSTS
      const updatedPost = userProfile.posts.find((p) => p._id === post._id);
      // IF UPDATED POST FOUND
      if (updatedPost) {
        const fetchPostLikes = async () => {
          setLikesLoading(true);
          try {
            const response = await axiosClient.get(`/post/${post._id}/likes`);
            // IF RESPONSE SUCCESS
            if (response.data.success) {
              // SETTING POST LIKES
              setLikes(response.data.likes);
            }
          } catch (error) {
            // LOGGING ERROR MESSAGE
            console.log(error);
          } finally {
            // LIKES LOADING STATE
            setLikesLoading(false);
          }
        };
        fetchPostLikes();
      }
    }
  }, [userProfile, postLikesLength, post._id]);
  // SYNCHRONIZING THE POST LIKES, COMMENTS, LIKED STATE & COMMENTS LENGTH
  useEffect(() => {
    setPostComments(post?.comments);
    setPostLikes(post?.likes?.length);
    setLiked(post?.likes?.includes(user._id));
    setCommentsLength(post?.comments?.length);
  }, [user._id, post.likes, post?.comments?.length, post?.comments]);
  // SYNCHRONIZING THE USER PROFILE POST LIKES, COMMENTS, LIKED STATE & COMMENTS LENGTH
  useEffect(() => {
    // IF USER PROFILE & USER PROFILE POSTS EXISTS
    if (userProfile && userProfile?.posts && post?._id) {
      // FINDING THE UPDATED POST IN THE USER PROFILE POSTS
      const updatedPost = userProfile.posts.find((p) => p?._id === post?._id);
      // IF UPDATED POST FOUND
      if (updatedPost) {
        setPostComments(updatedPost?.comments);
        setPostLikes(updatedPost?.likes?.length);
        setLiked(updatedPost?.likes.includes(user?._id));
        setCommentsLength(updatedPost?.comments?.length);
      }
    }
  }, [userProfile, userProfile?.posts, post?._id, user?._id]);
  // SETTING THE POST OWNER
  const isOwner = post?.author?._id === user._id;
  // SETTING MENU ITEMS ACCORDING TO THE LOGGED IN USER
  const postDialogItems = isOwner ? ownersPostItems : othersPostItems;
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
  // LIKE OR UNLIKE POST HANDLER
  const likeOrUnlikePostHandler = async () => {
    // SNAPSHOT OF ORIGINAL POSTS
    const originalPosts = [...posts];
    const originalUserProfile = { ...userProfile };
    // SNAPSHOT OF LIKED STATE
    const originalLiked = liked;
    // SNAPSHOT OF ORIGINAL LIKES COUNT
    const originalLikes = postLikes;
    // OPTIMISTICALLY UPDATING LIKE STATE
    const newLiked = !originalLiked;
    // OPTIMISTICALLY UPDATING LIKES COUNT
    const newLikesCount = newLiked ? originalLikes + 1 : originalLikes - 1;
    // UPDATING THE POST LIKES
    const updatedPosts = posts.map((p) =>
      p._id === post._id
        ? {
            ...p,
            likes: newLiked
              ? [...p.likes, user._id]
              : p.likes.filter((id) => id !== user?._id),
          }
        : p
    );
    // UPDATING THE USER POST LIKES
    const updatedUserPosts = userProfile.posts.map((p) =>
      p._id === post._id
        ? {
            ...p,
            likes: newLiked
              ? [...p.likes, user._id]
              : p.likes.filter((id) => id !== user._id),
          }
        : p
    );
    // UPDATING LIKED STATE
    setLiked(newLiked);
    // UPDATING LIKES COUNT
    setPostLikes(newLikesCount);
    // SETTING UPDATED POSTS
    dispatch(setPosts(updatedPosts));
    // DISPATCHING UPDATED USER POSTS
    dispatch(
      setUserProfile({
        ...userProfile,
        posts: updatedUserPosts,
      })
    );

    try {
      // LIKES LOADING STATE
      setLikesLoading(true);
      // MAKING REQUEST
      const response = await axiosClient.get(`/post/likeOrUnlike/${post._id}`, {
        withCredentials: true,
      });
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // REFETCHING THE LIKES FOR THE POST
        try {
          const response = await axiosClient.get(`/post/${post?._id}/likes`);
          // IF RESPONSE SUCCESS
          if (response.data.success) {
            // SETTING POST LIKES
            setLikes(response.data.likes);
          }
        } catch (error) {
          // LOGGING ERROR MESSAGE
          console.log(error);
        } finally {
          // LIKES LOADING STATE
          setLikesLoading(false);
        }
      }
    } catch (error) {
      // REVERTING CHANGES TO ORIGINAL DATA ON ERROR
      setLiked(originalLiked);
      setLikes(originalLikes);
      dispatch(setPosts(originalPosts));
      dispatch(setUserProfile(originalUserProfile));
      // LOGGING ERROR MESSAGE
      console.error("Failed to Perform Action!", error);
      // TOASTING ERROR MESSAGE
      toast.error(
        error?.response?.data?.message || "Failed to Perform Action!"
      );
    }
  };
  // ON LIKE ANIMATION HANDLER
  const onLikeAnimationHandler = () => {
    // IF POST IS NOT ALREADY LIKED
    if (!liked) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 800);
    }
    // LIKE OR UNLIKE POST HANDLER FUNCTION
    likeOrUnlikePostHandler();
  };
  // DELETE POST HANDLER
  const deletePostHandler = async () => {
    // LOADING STATE
    setDeleteLoading(true);
    try {
      const response = await axiosClient.delete(
        `/post/${post._id}/deletePost`,
        { withCredentials: true }
      );
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // UPDATING POSTS IN THE POST SLICE
        const updatedPosts = posts.filter(
          (postItem) => postItem?._id !== post?._id
        );
        // SETTING UPDATED POSTS IN THE POST SLICE
        dispatch(setPosts(updatedPosts));
        // CLOSING THE DELETE POST DIALOG
        setShowDeletePostDialogOpen(false);
        // TOASTING SUCCESS MESSAGE
        toast.success(response.data.message);
      }
    } catch (error) {
      // LOGGING ERROR MESSAGE
      console.error("Failed to Delete Post!", error);
      // TOASTING ERROR MESSAGE
      toast.error(error?.response?.data?.message || "Failed to Delete Post!");
    } finally {
      // LOADING STATE
      setDeleteLoading(false);
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
    } // IF DELETE WAS CLICKED
    else if (label === "Delete") {
      setShowDeletePostDialogOpen(true);
    }
  };
  // POST COMMENT HANDLER
  const postCommentHandler = async () => {
    // POST COMMENT LOADING STATE
    setPostCommentLoading(true);
    // MAKING REQUEST
    try {
      const response = await axiosClient.post(
        `/post/${post._id}/postComment`,
        { text: comment },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // CREATING UPDATED COMMENTS DATA
        const updatedCommentsData = [response.data.comment, ...postComments];
        // SETTING THE UPDATED COMMENTS DATA
        setPostComments(updatedCommentsData);
        // UPDATING THE COMMENTS LENGTH
        setCommentsLength(updatedCommentsData.length);
        // CREATING UPDATED POST DATA
        const updatedPostData = posts.map((p) =>
          p._id === post?._id
            ? {
                ...p,
                comments: updatedCommentsData,
              }
            : p
        );
        // SETTING THE UPDATED POST DATA
        dispatch(setPosts(updatedPostData));
        // DISPATCHING THE UPDATED USER PROFILE POSTS DATA
        dispatch(
          setUserProfile({
            ...userProfile,
            posts: userProfile.posts.map((p) =>
              p._id === post._id ? { ...p, comments: updatedCommentsData } : p
            ),
          })
        );
        // TOASTING SUCCESS MESSAGE
        toast.success(response?.data?.message);
        // CLEARING THE COMMENT INPUT
        setComment("");
      }
    } catch (error) {
      // LOGGING ERROR MESSAGE
      console.error("Failed to Post Comment!", error);
      // TOASTING ERROR MESSAGE
      toast.error(error?.response?.data?.message || "Failed to Post Comment!");
    } finally {
      // POST COMMENT LOADING STATE
      setPostCommentLoading(false);
    }
  };
  return (
    <>
      <Dialog open={open}>
        {/* MAIN DIALOG CONTENT BOX */}
        <DialogContent
          className="p-0 border-none outline-none focus-visible:ring-0 focus:outline-none rounded-sm flex items-center justify-center sm:max-w-[80vw]"
          onInteractOutside={() => setOpen(false)}
        >
          {/* COMMENT DIALOG CONTENT WRAPPER */}
          <section className="flex h-[90vh] w-full">
            {/* POST IMAGE SECTION */}
            <div
              onDoubleClick={() => {
                if (!liked) onLikeAnimationHandler();
              }}
              className="w-1/2 flex items-center justify-center relative"
            >
              <img
                src={post?.image}
                alt="Post Image"
                className="w-full h-full rounded-l-sm object-cover"
              />
              <AnimatePresence>
                {showAnimation && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.4, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute inset-0 flex items-center justify-center z-[9999999]"
                  >
                    <FaHeart size={80} className="text-white drop-shadow-lg" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* POST COMMENTS SECTION */}
            <div className="w-1/2 flex flex-col items-center justify-between rounded-r-sm">
              {/* SECTION HEADER */}
              <div className="w-full py-4 bg-white flex items-center justify-between border-b-2 border-gray-200 px-4 rounded-tr-sm">
                {/* AVATAR & USERNAME */}
                <div className="flex items-center gap-3">
                  {/* AVATAR */}
                  <HoverCard>
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
                    <HoverCardContent className="border-none outline-none focus:outline-none focus-visible:ring-0 rounded-sm p-0 w-[400px] shadow-2xl bg-white">
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
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <span className="hover:text-gray-500 cursor-pointer">
                            {post?.author?.username}
                          </span>
                        </HoverCardTrigger>
                        <HoverCardContent className="border-none outline-none focus:outline-none focus-visible:ring-0 rounded-sm p-0 w-[400px] shadow-2xl bg-white">
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
                            onClick={() =>
                              postDialogItemClickHandler(item.label)
                            }
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
              <div className="flex-1 w-full h-full py-4 px-4 flex flex-col gap-5 items-start justify-start overflow-y-auto">
                {/* POST AUTHOR AVATAR & CAPTION */}
                <div className="w-full flex items-center gap-3">
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
                  <span className="font-[600] text-[0.9rem]">
                    {post?.author?.username}
                    <span className="font-normal ml-3">{post?.caption}</span>
                  </span>
                </div>
                {/* IF NO COMMENTS */}
                {postComments.length <= 0 && (
                  <div className="flex items-center justify-center h-full w-full">
                    <span className="text-gray-500 text-sm">
                      No comments yet. Be the first to comment!
                    </span>
                  </div>
                )}
                {/* IF COMMENTS AVAILABLE */}
                {postComments.map((comment) => (
                  <Comment key={comment._id} comment={comment} />
                ))}
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
                        onClick={onLikeAnimationHandler}
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
                  <span
                    title="View Likes"
                    onClick={() => setLikesDialogOpen(true)}
                    className="w-full font-[600] mt-1 cursor-pointer"
                  >
                    {postLikes} {postLikes === 1 ? "like" : "likes"}
                  </span>
                  {/* LIKES DIALOG */}
                  <Dialog open={likesDialogOpen}>
                    <DialogContent
                      className="p-0 border-none outline-none focus-visible:ring-0 focus:outline-none rounded-sm"
                      onInteractOutside={() => setLikesDialogOpen(false)}
                    >
                      {/* DIALOG CONTENT WRAPPER */}
                      <div className="w-full flex items-center justify-start flex-col min-h-[70vh]">
                        {/* HEADER */}
                        <div className="w-full px-3 py-3 border-b-2 border-gray-200 rounded-t-sm">
                          <h1 className="text-center text-[1.2rem] font-[600]">
                            Likes
                          </h1>
                        </div>
                        {/* LIKES SECTION */}
                        <div className="w-full flex flex-1 flex-col gap-3 px-5 py-4 overflow-y-auto">
                          {/* LOADING STATE */}
                          {likesLoading && (
                            <div className="w-full h-full flex items-center justify-center">
                              <Loader2
                                size={"40px"}
                                className="text-gray-500 animate-spin"
                              />
                            </div>
                          )}
                          {/* IF NO LIKES */}
                          {!likesLoading && likes.length === 0 && (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                              <Heart size={"40px"} className="text-red-500" />
                              <span className="text-[1rem] text-gray-500">
                                No likes yet
                              </span>
                            </div>
                          )}
                          {/* IF LIKES AVAILABLE */}
                          {!likesLoading &&
                            likes.map((user) => (
                              <div
                                key={user._id}
                                className="w-full flex items-center justify-between"
                              >
                                {/* AVATAR & USERNAME */}
                                <div className="flex items-center gap-3">
                                  {/* AVATAR */}
                                  <HoverCard className="relative">
                                    <HoverCardTrigger asChild>
                                      <Avatar
                                        className={`w-10 h-10 cursor-pointer ${
                                          user?.profilePhoto === ""
                                            ? "bg-gray-300"
                                            : "bg-none"
                                        } `}
                                      >
                                        <AvatarImage
                                          src={user?.profilePhoto}
                                          alt={user?.fullName}
                                        />
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
                                                user?.profilePhoto === ""
                                                  ? "bg-gray-300"
                                                  : "bg-none"
                                              } `}
                                            >
                                              <AvatarImage
                                                src={user?.profilePhoto}
                                                alt={user?.fullName}
                                              />
                                            </Avatar>
                                          </div>
                                          {/* USER INFO */}
                                          <div className="flex flex-col items-start justify-center">
                                            <span className="flex items-center gap-2 font-[600] text-[1rem]">
                                              {user?.username}
                                            </span>
                                            <span className="text-gray-500 text-xs">
                                              {user?.fullName}
                                            </span>
                                          </div>
                                        </div>
                                        {/* PROFILE INFO */}
                                        <div className="w-full flex items-center justify-evenly pb-4">
                                          <div className="flex flex-col items-center justify-center">
                                            <span className="text-[1.1rem] font-[600]">
                                              {user?.posts?.length}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                              posts
                                            </span>
                                          </div>
                                          <div className="flex flex-col items-center justify-center">
                                            <span className="text-[1.1rem] font-[600]">
                                              {user?.followers?.length}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                              followers
                                            </span>
                                          </div>
                                          <div className="flex flex-col items-center justify-center">
                                            <span className="text-[1.1rem] font-[600]">
                                              {user?.following?.length}
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
                                    <div className="flex items-center gap-2 font-[600] text-[0.9rem]">
                                      <HoverCard className="relative">
                                        <HoverCardTrigger asChild>
                                          <div className="flex flex-col">
                                            <span className="hover:text-gray-500 cursor-pointer">
                                              {user?.username}
                                            </span>
                                            <span className="text-gray-500 text-xs">
                                              {user?.fullName}
                                            </span>
                                          </div>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="absolute -left-9.5 border-none outline-none focus:outline-none focus-visible:ring-0 rounded-sm p-0 w-[400px] shadow-2xl bg-white">
                                          {/* HOVER CONTENT MAIN WRAPPER */}
                                          <div className="w-full flex flex-col items-center justify-center">
                                            {/* HEADER */}
                                            <div className="px-6 py-6 w-full flex items-center gap-3">
                                              {/* AVATAR */}
                                              <div>
                                                <Avatar
                                                  className={`w-10 h-10 cursor-pointer ${
                                                    user?.profilePhoto === ""
                                                      ? "bg-gray-300"
                                                      : "bg-none"
                                                  } `}
                                                >
                                                  <AvatarImage
                                                    src={user?.profilePhoto}
                                                    alt={user?.fullName}
                                                  />
                                                </Avatar>
                                              </div>
                                              {/* USER INFO */}
                                              <div className="flex flex-col items-start justify-center">
                                                <span className="flex items-center gap-2 font-[600] text-[1rem]">
                                                  {user?.username}
                                                </span>
                                                <span className="text-gray-500 text-xs">
                                                  {user?.fullName}
                                                </span>
                                              </div>
                                            </div>
                                            {/* PROFILE INFO */}
                                            <div className="w-full flex items-center justify-evenly pb-4">
                                              <div className="flex flex-col items-center justify-center">
                                                <span className="text-[1.1rem] font-[600]">
                                                  {user?.posts?.length}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                  posts
                                                </span>
                                              </div>
                                              <div className="flex flex-col items-center justify-center">
                                                <span className="text-[1.1rem] font-[600]">
                                                  {user?.followers?.length}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                  followers
                                                </span>
                                              </div>
                                              <div className="flex flex-col items-center justify-center">
                                                <span className="text-[1.1rem] font-[600]">
                                                  {user?.following?.length}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                  following
                                                </span>
                                              </div>
                                            </div>
                                            {/* POSTS SECTION */}
                                            <div className="w-full flex items-center justify-center gap-[0.2rem] my-4">
                                              {hoverCardImages.map(
                                                (img, index) => (
                                                  <img
                                                    key={index}
                                                    src={img}
                                                    alt="Hover Image"
                                                    className="h-[8.19rem] object-cover aspect-square"
                                                  />
                                                )
                                              )}
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
                                    </div>
                                  </div>
                                </div>
                                {/* FOLLOW BUTTON */}
                                <Button
                                  type="button"
                                  className="bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer focus-visible:ring-0"
                                >
                                  <UserPlus size={50} />
                                  Follow
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {/* POST COMMENTS */}
                  <span className="w-full text-sm text-gray-500">
                    {commentsLength === 0 && "No comments yet"}
                    {commentsLength === 1 && "1 comment"}
                    {commentsLength > 1 && `${commentsLength} comments`}
                  </span>
                  {/* POST TIME */}
                  <span className="w-full text-sm text-gray-500">
                    {postTime}
                  </span>
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
                    spellCheck="false"
                    autoComplete="off"
                    className="w-full border-none outline-none focus:outline-none text-sm placeholder:text-gray-700 text-gray-700 pr-10"
                  />
                  {comment && (
                    <span
                      onClick={postCommentHandler}
                      className="absolute right-4 text-sky-500 font-[600] bottom-3 text-sm cursor-pointer"
                    >
                      {postCommentLoading ? (
                        <Loader2 size={"20px"} className="animate-spin" />
                      ) : (
                        "Post"
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </DialogContent>
      </Dialog>
      {/* DELETE POST DIALOG */}
      <Dialog open={deletePostDialogOpen}>
        <DialogContent className="p-0 border-none outline-none focus-visible:ring-0 focus:outline-none rounded-sm">
          {/* DIALOG CONTENT WRAPPER */}
          <div className="w-full flex flex-col items-center justify-center py-4">
            {/* HEADING */}
            <h1 className="w-full text-[1.4rem] px-2 text-center">
              Delete Post?
            </h1>
            {/* SUBTEXT */}
            <span className="w-full text-sm text-gray-500 px-2 text-center">
              Are you sure you want to delete this post?
            </span>
            {/* ACTION BUTTONS */}
            <div className="w-full flex flex-col items-center justify-center gap-3 mt-6">
              {/* DELETE */}
              <button
                onClick={deletePostHandler}
                disabled={deleteLoading}
                className="w-full py-3 px-2 border-y-2 border-gray-200 text-red-500 cursor-pointer font-[600] text-center outline-none focus:outline-none focus-visible:outline-none flex items-center justify-center gap-2"
              >
                {deleteLoading ? <Loader2 className="animate-spin" /> : ""}
                {deleteLoading ? "Deleting Post" : "Delete"}
              </button>
              {/* CANCEL */}
              <button
                onClick={() => setShowDeletePostDialogOpen(false)}
                className="text-center px-2 cursor-pointer outline-none focus:outline-none focus-visible:outline-none"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommentDialog;
