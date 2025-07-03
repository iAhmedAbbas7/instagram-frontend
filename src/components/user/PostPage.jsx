// <= IMPORTS =>
import { toast } from "sonner";
import Comment from "./Comment";
import { Button } from "../ui/button";
import OtherPosts from "./OtherPosts";
import useTitle from "@/hooks/useTitle";
import { setUser } from "@/redux/authSlice";
import { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";
import { formatDistanceStrict } from "date-fns";
import { setSinglePost } from "@/redux/postSlice";
import UserHoverCard from "../shared/UserHoverCard";
import { getShortRelativeTime } from "@/utils/time";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import useGetSinglePost from "@/hooks/useGetSinglePost";
import { useNavigate, useParams } from "react-router-dom";
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
  UserMinus,
  UserPlus,
} from "lucide-react";

const PostPage = () => {
  // NAVIGATION
  const navigate = useNavigate();
  // DISPATCH
  const dispatch = useDispatch();
  // USE TITLE HOOK
  useTitle("Instagram - Post");
  // PARAMS
  const params = useParams();
  // GETTING POST ID FROM URL PARAMS
  const postId = params.id;
  // USING USE GET SINGLE POST HOOK
  const { loading } = useGetSinglePost(postId);
  // GETTING SINGLE POST FORM POST SLICE
  const { singlePost: post } = useSelector((store) => store.post);
  // GETTING CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // LIKES STATE FOR EACH POST
  const [likes, setLikes] = useState([]);
  // COMMENT STATE
  const [comment, setComment] = useState("");
  // FOLLOWING STATE MANAGEMENT FOR LIKE USERS
  const [followingMap, setFollowingMap] = useState({});
  // LIKES LOADING STATE
  const [likesLoading, setLikesLoading] = useState(false);
  // LIKE ANIMATION STATE
  const [showAnimation, setShowAnimation] = useState(false);
  // DELETE POST LOADING STATE
  const [deleteLoading, setDeleteLoading] = useState(false);
  // POST DIALOG STATE
  const [showPostDialog, setShowPostDialog] = useState(false);
  // FOLLOW LOADING MAP
  const [followLoadingMap, setFollowLoadingMap] = useState({});
  // LIKES DIALOG STATE
  const [likesDialogOpen, setLikesDialogOpen] = useState(false);
  // POST LIKES STATE
  const [postLikes, setPostLikes] = useState(post?.likes?.length);
  // POST COMMENTS STATE
  const [postComments, setPostComments] = useState(post?.comments);
  // COMMENT POSTING LOADING STATE
  const [postCommentLoading, setPostCommentLoading] = useState(false);
  // DELETE POST DIALOG STATE
  const [deletePostDialogOpen, setShowDeletePostDialogOpen] = useState(false);
  // POST COMMENTS COUNT STATE
  const [commentsLength, setCommentsLength] = useState(post?.comments?.length);
  // LIKED POST STATE
  const [liked, setLiked] = useState(post?.likes?.includes(user?._id) || false);
  // BOOKMARK STATE
  const [bookmarked, setBookmarked] = useState(
    user?.bookmarks?.includes(post?._id) || false
  );
  // USER FOLLOWING STATE
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(
    user?.following?.includes(post?.author?._id) || false
  );
  // AUTHOR FOLLOWING STATE
  const [isAuthorFollowing, setIsAuthorFollowing] = useState(
    post?.author?.following.includes(user?._id) || false
  );
  // AVATAR FALLBACK MANAGEMENT
  const fullNameInitials = post?.author?.fullName
    ? getFullNameInitials(post?.author?.fullName)
    : "";
  // AUTHOR FOLLOW LABEL
  const authorFollowLabel = isFollowingAuthor
    ? "Unfollow"
    : isAuthorFollowing
    ? "Follow Back"
    : "Follow";
  // OWNER'S POST DIALOG ITEMS
  const ownersPostItems = [
    { id: 1, label: "Delete" },
    { id: 2, label: "Edit" },
    { id: 3, label: "Hide Like count to others" },
    { id: 4, label: "Turn off commenting" },
    { id: 5, label: "Share to..." },
    { id: 6, label: "Copy Link" },
    { id: 7, label: "Embed" },
    { id: 8, label: "About this Account" },
    { id: 9, label: "Cancel" },
  ];
  // OTHER'S POST DIALOG ITEMS
  const othersPostItems = [
    { id: 1, label: "Report" },
    { id: 2, label: authorFollowLabel },
    { id: 3, label: "Add to Favorites" },
    { id: 4, label: "Share to..." },
    { id: 5, label: "Copy Link" },
    { id: 6, label: "Embed" },
    { id: 7, label: "About this Account" },
    { id: 8, label: "Cancel" },
  ];
  // SCROLL TO TOP EFFECT ON OST ID CHANGE
  useEffect(() => {
    if (post?._id) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [post?._id]);
  // FETCHING LIKES FOR THE POST ON RENDER
  useEffect(() => {
    if (!post?._id) return;
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
  }, [post?._id]);
  // SYNCHRONIZING THE POST LIKES, COMMENTS, LIKED STATE, COMMENTS LENGTH & OTHERS
  useEffect(() => {
    if (!post || !user) return;
    setPostComments(post?.comments);
    setPostLikes(post?.likes?.length);
    setLiked(post?.likes?.includes(user._id));
    setCommentsLength(post?.comments?.length);
    setBookmarked(user?.bookmarks?.includes(post?._id));
    setIsAuthorFollowing(post?.author?.following.includes(user?._id));
    setIsFollowingAuthor(user?.following?.includes(post?.author?._id));
  }, [user, post]);
  // TRACKING THE FOLLOWING STATS FOR THE LIKE USERS
  useEffect(() => {
    if (!post || !likes.length) return;
    // INITIATING THE FOLLOWING MAP
    const map = {};
    // CHECKING WHO IS IS FOLLOWED BY THE CURRENT USER
    likes.forEach((u) => {
      map[u._id] = user?.following?.includes(u._id);
    });
    // SETTING FOLLOWING MAP
    setFollowingMap(map);
  }, [post, likes, user?.following]);
  // SETTING THE POST OWNER
  const isOwner = post?.author?._id === user._id;
  // SETTING MENU ITEMS ACCORDING TO THE LOGGED IN USER
  const postDialogItems = isOwner ? ownersPostItems : othersPostItems;
  // POST CREATION TIME STRING # 1
  const shortTime = post?.createdAt && getShortRelativeTime(post?.createdAt);
  // POST CREATION TIME STRING
  const postTime =
    post?.createdAt &&
    formatDistanceStrict(post?.createdAt, new Date(), {
      roundingMethod: "floor",
      addSuffix: true,
    });
  // EMPTY COMMENT HANDLER
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
  // LIKE OR UNLIKE POST HANDLER
  const likeOrUnlikePostHandler = async () => {
    // SNAPSHOT OF LIKED STATE
    const originalLiked = liked;
    // SNAPSHOT OF ORIGINAL LIKES COUNT
    const originalLikes = postLikes;
    // OPTIMISTICALLY UPDATING LIKE STATE
    const newLiked = !originalLiked;
    // OPTIMISTICALLY UPDATING LIKES COUNT
    const newLikesCount = newLiked ? originalLikes + 1 : originalLikes - 1;
    // UPDATING LIKED STATE
    setLiked(newLiked);
    // UPDATING LIKES COUNT
    setPostLikes(newLikesCount);
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
        // NAVIGATING TO THE HOMEPAGE
        navigate("/home");
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
  const postDialogItemClickHandler = (label, id) => {
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
    // IF LABEL IS FOLLOW LABEL
    else if (id === 2) {
      followOrUnfollowHandler(post?.author?._id);
    }
    // IF EDIT WAS CLICKED
    else if (label === "Edit") {
      navigate(`/home/post/${post?._id}/edit`);
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
  // FOLLOW OR UNFOLLOW HANDLER
  const followOrUnfollowHandler = async (userId) => {
    // SNAPSHOT OF ORIGINAL FOLLOWING STATE & USER FOLLOWING & LIKES ARRAY
    const originalPost = post;
    const originalLikes = [...likes];
    const originalFollowingState = { ...followingMap };
    const originalFollowingList = user?.following ? [...user.following] : [];
    // CHECKING IF THE PASSED ID IS POST AUTHOR ID
    const isAuthorAction = userId === post?.author?._id;
    // CREATING A NEW FOLLOWING FLAG BASED ON ID PASSED
    const nowFollowing = isAuthorAction
      ? !isFollowingAuthor
      : !originalFollowingState[userId];
    // OPTIMISTICALLY UPDATING THE FOLLOWING STATE
    if (isAuthorAction) {
      setIsFollowingAuthor(nowFollowing);
    } else {
      setFollowingMap((prev) => ({
        ...prev,
        [userId]: nowFollowing,
      }));
    }
    // OPTIMISTICALLY UPDATING USER FOLLOWING
    let updatedFollowingList;
    // IF ALREADY FOLLOWING THEN REMOVING IT, OTHERWISE ADDING IT
    if (!nowFollowing) {
      updatedFollowingList = originalFollowingList.filter(
        (id) => id !== userId
      );
    } else {
      updatedFollowingList = [userId, ...originalFollowingList];
    }
    // DISPATCHING UPDATED USER IN THE AUTH SLICE
    dispatch(setUser({ ...user, following: updatedFollowingList }));
    // UPDATING THE TARGET USER FOLLOWING IN LOCAL LIKES ARRAY
    if (!isAuthorAction) {
      const newLikes = likes.map((u) => {
        if (u._id === userId) {
          const updatedUser = {
            ...u,
            followers: nowFollowing
              ? [...u.followers, user._id]
              : u.followers.filter((id) => id !== user._id),
          };
          return updatedUser;
        }
        return u;
      });
      // UPDATING LIKES
      setLikes(newLikes);
    }
    // UPDATING THE POST AUTHOR FOLLOWERS
    if (isAuthorAction) {
      const updatedAuthorFollowers = nowFollowing
        ? [...post.author.followers, user._id]
        : post.author.followers.filter((id) => id !== user._id);
      // UPDATING THE SINGLE POST
      dispatch(
        setSinglePost({
          ...post,
          author: {
            ...post.author,
            followers: updatedAuthorFollowers,
          },
        })
      );
    }
    // FOLLOW LOADING STATE
    setFollowLoadingMap((prev) => ({ ...prev, [userId]: true }));
    // MAKING REQUEST
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
      setLikes(originalLikes);
      setFollowingMap(originalFollowingState);
      setIsFollowingAuthor(user.following.includes(post.author._id));
      dispatch(setUser({ ...user, following: originalFollowingList }));
      dispatch(setSinglePost(originalPost));
      // LOGGING ERROR MESSAGE
      console.error("Failed to Perform Action!", error);
      // TOASTING ERROR MESSAGE
      toast.error(
        error?.response?.data?.message || "Failed to Perform Action!"
      );
    } finally {
      // FOLLOW LOADING STATE
      setFollowLoadingMap((prev) => ({ ...prev, [userId]: false }));
    }
  };
  // LOADING UI
  if (loading || !post) {
    return (
      <div className="w-screen h-screen max-[1200px]:pl-[70px] max-[768px]:pl-0 px-3 max-[768px]:pt-[75px] max-[768px]:pb-[60px] pl-[250px] flex items-center justify-center g-white">
        <Loader2 size={40} className="animate-spin text-sky-400" />
      </div>
    );
  }
  return (
    // POST PAGE MAIN WRAPPER
    <section className="w-full max-[1200px]:pl-[70px] max-[768px]:pt-[75px] max-[768px]:pb-[60px] pl-[250px] flex items-center justify-center max-[768px]:px-4">
      {/* POST MAIN SECTION */}
      <section className="w-full h-[90vh] mt-8 mb-6">
        {/* POST CONTENT SECTION */}
        <section className="w-full h-[90vh] flex px-18">
          {/* POST IMAGE SECTION */}
          <section
            onDoubleClick={() => {
              if (!liked) onLikeAnimationHandler();
            }}
            className="w-1/2 max-h-[90vh] flex items-center justify-center relative"
          >
            {/* POST IMAGE */}
            <img
              src={post?.image}
              alt="Post Image"
              className="w-full h-full rounded-l-sm object-cover cursor-pointer"
            />
            {/* LIKE ANIMATION */}
            <AnimatePresence>
              {showAnimation && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.4, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute overflow-hidden flex items-center justify-center z-[9999999]"
                >
                  <FaHeart size={80} className="text-white drop-shadow-lg" />
                </motion.div>
              )}
            </AnimatePresence>
          </section>
          {/* POST COMMENTS SECTION */}
          <section className="w-1/2 h-[90vh] flex flex-col items-center justify-between rounded-r-sm border-y-2 border-r-2 border-gray-200">
            {/* SECTION HEADER */}
            <div className="w-full py-4 bg-white flex items-center justify-between border-b-2 border-gray-200 px-4 rounded-tr-sm">
              {/* AVATAR & USERNAME */}
              <div className="flex items-center gap-3">
                {/* AVATAR */}
                <UserHoverCard user={post?.author}>
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
                          onClick={() =>
                            postDialogItemClickHandler(item.label, item.id)
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
                          } ${
                            item.label === "Follow Back" && "text-sky-400"
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
              {postComments?.length <= 0 && (
                <div className="flex items-center justify-center h-full w-full">
                  <span className="text-gray-500 text-sm">
                    No comments yet. Be the first to comment!
                  </span>
                </div>
              )}
              {/* IF COMMENTS AVAILABLE */}
              {postComments?.map((comment) => (
                <Comment key={comment._id} comment={comment} />
              ))}
            </div>
            {/* SECTION FOOTERS */}
            <section className="w-full flex flex-col items-center justify-center ">
              {/* FOOTER - 1 */}
              <section className="flex flex-col items-center justify-center w-full px-4 py-3 border-t-2 border-gray-200">
                {/* TOP SECTION */}
                <section className="w-full flex items-center justify-between">
                  {/* POST ACTIONS */}
                  <div className="flex items-center gap-2">
                    {/* LIKE */}
                    <span
                      onClick={onLikeAnimationHandler}
                      title={liked ? "Unlike" : "Like"}
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
                </section>
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
                      <div className="w-full p-3 border-b-2 border-gray-200 rounded-t-sm">
                        <h1 className="text-center text-[1.2rem] font-[600]">
                          Likes
                        </h1>
                      </div>
                      {/* LIKES SECTION */}
                      <div className="w-full flex flex-1 flex-col gap-3 px-5 py-4 overflow-y-auto">
                        {likesLoading ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <Loader2
                              size={"40px"}
                              className="text-gray-500 animate-spin"
                            />
                          </div>
                        ) : likes.length === 0 ? (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <Heart size={"40px"} className="text-red-500" />
                            <span className="text-[1rem] text-gray-500">
                              No likes yet
                            </span>
                          </div>
                        ) : (
                          likes.map((u) => {
                            // CHECKING IF THE USER IS FOLLOWED BY CURRENT USER
                            const isFollowing = followingMap[u._id];
                            // CHECKING IF THE USER IS FOLLOWING THE CURRENT USER
                            const isFollowingMe = u?.following?.includes(
                              user?._id
                            );
                            // SETTING LABEL IN BUTTON ACCORDING TO THE FOLLOWING STATE
                            let label = "Follow";
                            if (isFollowing) {
                              label = "Unfollow";
                            } else if (isFollowingMe) {
                              label = "Follow Back";
                            }
                            // FOLLOW LOADING STATE
                            const isFollowLoading = followLoadingMap[u._id];
                            return (
                              <div
                                key={u._id}
                                className="w-full flex items-center justify-between"
                              >
                                {/* AVATAR & USERNAME */}
                                <div className="flex items-center gap-3">
                                  {/* AVATAR */}
                                  <UserHoverCard user={u}>
                                    <Avatar
                                      className={`w-10 h-10 cursor-pointer ${
                                        u?.profilePhoto === ""
                                          ? "bg-gray-300"
                                          : "bg-none"
                                      } `}
                                    >
                                      <AvatarImage
                                        src={u?.profilePhoto}
                                        alt={u?.fullName}
                                      />
                                      <AvatarFallback>
                                        {getFullNameInitials(u?.fullName)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </UserHoverCard>
                                  {/* USERNAME */}
                                  <div className="flex flex-col items-start justify-center">
                                    <div className="flex items-center gap-2 font-[600] text-[0.9rem]">
                                      <UserHoverCard user={u}>
                                        <div className="flex flex-col">
                                          <span className="hover:text-gray-500 cursor-pointer">
                                            {u?.username}
                                          </span>
                                          <span className="text-gray-500 text-xs">
                                            {u?.fullName}
                                          </span>
                                        </div>
                                      </UserHoverCard>
                                    </div>
                                  </div>
                                </div>
                                {/* FOLLOW BUTTON */}
                                {user?._id !== u?._id && (
                                  <Button
                                    type="button"
                                    onClick={() =>
                                      followOrUnfollowHandler(u._id)
                                    }
                                    disabled={isFollowLoading}
                                    className="bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer focus-visible:ring-0"
                                  >
                                    {isFollowLoading ? (
                                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    ) : isFollowing ? (
                                      <UserMinus size={50} />
                                    ) : (
                                      <UserPlus size={50} />
                                    )}
                                    {label}
                                  </Button>
                                )}
                              </div>
                            );
                          })
                        )}
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
                <span className="w-full text-sm text-gray-500">{postTime}</span>
              </section>
              {/* FOOTER - 2 */}
              <div className="w-full py-3 px-4 border-t-2 border-gray-200 relative">
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
            </section>
          </section>
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
        </section>
        {/* OTHER POSTS SECTION */}
        <section>
          <OtherPosts author={post?.author} excludedId={post?._id} />
        </section>
      </section>
    </section>
  );
};

export default PostPage;
