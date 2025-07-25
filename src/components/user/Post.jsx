// <= IMPORTS =>
import { toast } from "sonner";
import { Button } from "../ui/button";
import { setUser } from "@/redux/authSlice";
import { setPosts } from "@/redux/postSlice";
import axiosClient from "@/utils/axiosClient";
import { useNavigate } from "react-router-dom";
import { getShortRelativeTime } from "@/utils/time";
import CommentDialog from "../shared/CommentDialog";
import UserHoverCard from "../shared/UserHoverCard";
import { useDispatch, useSelector } from "react-redux";
import { forwardRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaBookmark, FaHeart, FaRegHeart } from "react-icons/fa6";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
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

const Post = forwardRef(({ post }, ref) => {
  // DISPATCH
  const dispatch = useDispatch();
  // NAVIGATION
  const navigate = useNavigate();
  // GETTING CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // GETTING POSTS FROM THE POST SLICE
  const { posts } = useSelector((store) => store.post);
  // LIKES STATE FOR EACH POST
  const [likes, setLikes] = useState([]);
  // COMMENT STATE
  const [comment, setComment] = useState("");
  // LIKES LOADING STATE
  const [likesLoading, setLikesLoading] = useState(false);
  // COMMENT POSTING LOADING STATE
  const [postCommentLoading, setPostCommentLoading] = useState(false);
  // LIKE ANIMATION STATE
  const [showAnimation, setShowAnimation] = useState(false);
  // LIKED POST STATE
  const [liked, setLiked] = useState(post?.likes?.includes(user?._id) || false);
  // POST LIKES STATE
  const [postLikes, setPostLikes] = useState(post?.likes?.length);
  // POST COMMENTS STATE
  const [postComments, setPostComments] = useState(post?.comments);
  // POST COMMENTS COUNT STATE
  const [commentsLength, setCommentsLength] = useState(post?.comments?.length);
  // POST DIALOG STATE
  const [showPostDialog, setShowPostDialog] = useState(false);
  // COMMENT DIALOG STATE
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  // DELETE POST DIALOG STATE
  const [deletePostDialogOpen, setShowDeletePostDialogOpen] = useState(false);
  // LIKES DIALOG STATE
  const [likesDialogOpen, setLikesDialogOpen] = useState(false);
  // DELETE POST LOADING STATE
  const [deleteLoading, setDeleteLoading] = useState(false);
  // BOOKMARK STATE
  const [bookmarked, setBookmarked] = useState(
    user?.bookmarks?.includes(post?._id) || false
  );
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
  }, [post?._id, commentDialogOpen, post.likes]);
  // SYNCHRONIZING THE POST LIKES, COMMENTS, LIKED STATE & COMMENTS LENGTH
  useEffect(() => {
    setPostComments(post?.comments);
    setPostLikes(post?.likes?.length);
    setLiked(post?.likes?.includes(user._id));
    setCommentsLength(post?.comments?.length);
    setBookmarked(user?.bookmarks?.includes(post?._id));
  }, [
    user._id,
    post.likes,
    post?.comments?.length,
    post?.comments,
    posts,
    post?._id,
    user?.bookmarks,
  ]);
  // SETTING THE POST OWNER
  const isOwner = post?.author?._id === user._id;
  // SETTING MENU ITEMS ACCORDING TO THE LOGGED IN USER
  const postDialogItems = isOwner ? ownersPostItems : othersPostItems;
  // POST CREATION TIME STRING
  const shortTime = getShortRelativeTime(post.createdAt);
  // AVATAR FALLBACK MANAGEMENT
  const fullNameInitials = post?.author?.fullName
    ? getFullNameInitials(post?.author?.fullName)
    : "";
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
  // LIKE OR UNLIKE POST HANDLER
  const likeOrUnlikePostHandler = async () => {
    // SNAPSHOT OF ORIGINAL POSTS
    const originalPosts = [...posts];
    // SNAPSHOT OF LIKED STATE
    const originalLiked = liked;
    // SNAPSHOT OF ORIGINAL LIKES COUNT
    const originalLikes = postLikes;
    // OPTIMISTICALLY UPDATING LIKE STATE
    const newLiked = !originalLiked;
    // OPTIMISTICALLY UPDATING LIKES COUNT
    newLiked ? originalLikes + 1 : originalLikes - 1;
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
    // SETTING UPDATED POSTS
    dispatch(setPosts(updatedPosts));
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
          // RESTORING ORIGINAL STATE ON ERROR
          setPosts(originalPosts);
          setLiked(originalLiked);
          setLikes(originalLikes);
          // LOGGING ERROR MESSAGE
          console.log(error);
        } finally {
          // LIKES LOADING STATE
          setLikesLoading(false);
        }
      }
    } catch (error) {
      // REVERTING CHANGES TO ORIGINAL ON ERROR
      dispatch(setPosts(originalPosts));
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
    } // IF DELETE WAS CLICKED
    else if (label === "Delete") {
      setShowDeletePostDialogOpen(true);
    }
    // IF EDIT WAS CLICKED
    else if (label === "Edit") {
      navigate(`post/${post?._id}/edit`);
    }
    // IF GO TO POST WAS CLICKED
    else if (label === "Go to Post") {
      navigate(`/home/post/${post?._id}`);
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
  // POST BOOKMARK HANDLER
  const postBookmarkHandler = async () => {
    // SNAPSHOT OF ORIGINAL BOOKMARK STATE
    const originalBookmarked = bookmarked;
    // SNAPSHOT OF THE ORIGINAL USER BOOKMARKS
    const originalBookmarks = user?.bookmarks ? [...user.bookmarks] : [];
    // OPTIMISTICALLY UPDATING THE BOOKMARK STATE
    setBookmarked(!originalBookmarked);
    // OPTIMISTICALLY UPDATING THE USER BOOKMARKS
    let updatedBookmarks;
    // IF ALREADY BOOKMARKED THEN REMOVING IT, OTHERWISE ADDING IT
    if (originalBookmarked) {
      updatedBookmarks = user?.bookmarks.filter((id) => id !== post?._id);
    } else {
      updatedBookmarks = [...originalBookmarks, post?._id];
    }
    // SAVING THE UPDATED USER IN THE AUTH SLICE
    dispatch(setUser({ ...user, bookmarks: updatedBookmarks }));
    // MAKING REQUEST
    try {
      const response = await axiosClient.get(
        `/post/${post?._id}/bookOrUnBookmarkPost`
      );
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // TOASTING SUCCESS MESSAGE
        toast.success(response.data.message);
      }
    } catch (error) {
      // REVERTING TO ORIGINAL STATE ON ERROR
      setBookmarked(originalBookmarked);
      dispatch(setUser({ ...user, bookmarks: originalBookmarks }));
      // LOGGING ERROR MESSAGE
      console.error("Failed to Bookmark Post!", error);
      // TOASTING ERROR MESSAGE
      toast.error(error?.response?.data?.message || "Failed to Bookmark Post!");
    }
  };
  return (
    <div ref={ref} className="mb-6 mx-auto max-w-xl">
      {/* POST HEADER */}
      <div className="w-full flex items-center justify-between">
        {/* AVATAR & USERNAME */}
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <UserHoverCard user={post?.author}>
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
          </UserHoverCard>
          {/* USERNAME */}
          <div className="flex flex-col items-start justify-center">
            <span className="flex items-center gap-2 font-[600] text-[0.9rem]">
              <UserHoverCard user={post?.author}>
                <span className="hover:text-gray-500 cursor-pointer">
                  {post?.author?.username}
                </span>
              </UserHoverCard>
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
                      (item.label === "Report" || item.label === "Delete") &&
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
      {/* POST IMAGE */}
      <div
        onDoubleClick={() => {
          if (!liked) onLikeAnimationHandler();
        }}
        className="w-full h-full mt-1 cursor-pointer relative"
      >
        <img
          src={post?.image}
          alt="Post Image"
          className="w-full h-full object-cover rounded-sm"
        />
        <AnimatePresence>
          {showAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.4, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <FaHeart size={80} className="text-white drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* POST ACTIONS */}
      <div className="w-full flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {/* LIKE */}
          <span
            title={liked ? "Unlike" : "Like"}
            onClick={onLikeAnimationHandler}
          >
            {liked ? (
              <FaHeart size={"28px"} className="text-red-500 cursor-pointer" />
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
        <div
          onClick={postBookmarkHandler}
          title={bookmarked ? "Unsave" : "Save"}
        >
          {bookmarked ? (
            <FaBookmark
              size={"25px"}
              className="hover:text-gray-500 cursor-pointer"
            />
          ) : (
            <Bookmark
              size={"28px"}
              className="hover:text-gray-500 cursor-pointer"
            />
          )}
        </div>
      </div>
      {/* POST LIKES */}
      <span
        title="View Likes"
        onClick={() => setLikesDialogOpen(true)}
        className="w-full font-[600] mt-3 cursor-pointer"
      >
        {post?.likes?.length} {post?.likes?.length === 1 ? "like" : "likes"}
      </span>
      {/* POST AUTHOR & DESCRIPTION */}
      <div className="w-full flex items-center gap-2">
        <span className="font-[600]">
          {post?.author?.fullName}{" "}
          <span className="font-normal ml-2">{post?.caption}</span>
        </span>
      </div>
      {/* VIEW COMMENTS */}
      <span
        onClick={() => setCommentDialogOpen(true)}
        className="text-[0.975rem] text-gray-500 hover:text-gray-600 cursor-pointer"
      >
        {commentsLength === 0 && "No comments yet"}
        {commentsLength === 1 && "View comment"}
        {commentsLength > 1 && `View all ${commentsLength} comments`}
      </span>
      {/* COMMENT DIALOG */}
      <div>
        <CommentDialog
          post={post}
          open={commentDialogOpen}
          setOpen={setCommentDialogOpen}
        />
      </div>
      {/* ADD COMMENT */}
      <div className="w-full flex items-center justify-between mt-1 relative">
        <input
          type="text"
          value={comment}
          onChange={emptyCommentHandler}
          name="comment"
          id="comment"
          placeholder="Add a comment..."
          spellCheck="false"
          autoComplete="off"
          className="w-full border-b border-gray-300 focus:outline-none outline-none pr-10 text-gray-700 pb-3 text-sm placeholder:text-gray-700"
        />
        {comment && (
          <span
            onClick={postCommentHandler}
            className="absolute right-0 text-sky-500 font-[600] pb-3 text-sm cursor-pointer"
          >
            {postCommentLoading ? (
              <Loader2 size={"20px"} className="animate-spin" />
            ) : (
              "Post"
            )}
          </span>
        )}
      </div>
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
              <h1 className="text-center text-[1.2rem] font-[600]">Likes</h1>
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
                      <UserHoverCard user={user}>
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
                      </UserHoverCard>
                      {/* USERNAME */}
                      <div className="flex flex-col items-start justify-center">
                        <div className="flex items-center gap-2 font-[600] text-[0.9rem]">
                          <UserHoverCard user={user}>
                            <div className="flex flex-col">
                              <span className="hover:text-gray-500 cursor-pointer">
                                {user?.username}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {user?.fullName}
                              </span>
                            </div>
                          </UserHoverCard>
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
    </div>
  );
});

// DISPLAY NAME FOR THE COMPONENT
Post.displayName = "Post";

export default Post;
