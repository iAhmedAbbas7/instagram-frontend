// <= IMPORTS =>
import { useState } from "react";
import { FaRegHeart } from "react-icons/fa6";
import CommentDialog from "../shared/CommentDialog";
import INSTAGRAM from "../../assets/images/INSTAGRAM.png";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Bookmark, MessageCircle, MoreHorizontal, Send } from "lucide-react";

const Post = () => {
  // COMMENT STATE
  const [comment, setComment] = useState("");
  // COMMENT DIALOG STATE
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
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
  return (
    <div className="mb-6 mx-auto max-w-xl">
      {/* POST HEADER */}
      <div className="w-full flex items-center justify-between">
        {/* AVATAR */}
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 ">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <h6>Ahmed Abbas</h6>
        </div>
        {/* POST DIALOG */}
        <div className="cursor-pointer">
          <Dialog className="z-[99999]">
            <DialogTrigger asChild>
              <MoreHorizontal />
            </DialogTrigger>
            <DialogContent></DialogContent>
          </Dialog>
        </div>
      </div>
      {/* POST IMAGE */}
      <div className="w-full">
        <img
          src={INSTAGRAM}
          className="w-full aspect-square object-cover rounded-sm"
        />
      </div>
      {/* POST ACTIONS */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaRegHeart
            title="Like"
            size={"28px"}
            className="hover:text-gray-500 cursor-pointer"
          />
          <MessageCircle
            onClick={() => setCommentDialogOpen(true)}
            title="Comment"
            size={"28px"}
            className="hover:text-gray-500 cursor-pointer"
          />
          <Send
            title="Share"
            size={"28px"}
            className="hover:text-gray-500 cursor-pointer"
          />
        </div>
        <div>
          <Bookmark
            title="Save"
            size={"28px"}
            className="hover:text-gray-500 cursor-pointer"
          />
        </div>
      </div>
      {/* POST LIKES */}
      <span className="font-[600] mt-1">200k likes</span>
      {/* POST AUTHOR & DESCRIPTION */}
      <div className="w-full  flex items-center gap-3">
        <span className="font-[600]">iAhmed7</span>
        <span>My First Instagram Post!</span>
      </div>
      {/* VIEW COMMENTS */}
      <span
        onClick={() => setCommentDialogOpen(true)}
        className="text-[0.975rem] text-gray-500 hover:text-gray-600 cursor-pointer"
      >
        View all 95 comments
      </span>
      {/* COMMENT DIALOG */}
      <CommentDialog open={commentDialogOpen} setOpen={setCommentDialogOpen} />
      {/* ADD COMMENT */}
      <div className="w-full flex items-center justify-between mt-1 relative">
        <input
          type="text"
          value={comment}
          onChange={emptyCommentHandler}
          name="comment"
          id="comment"
          placeholder="Add a comment..."
          className="w-full border-b border-gray-300 focus:outline-none outline-none pr-4 text-gray-500 pb-3 text-sm"
        />
        {comment && (
          <span className="absolute right-0 text-sky-500 font-[600] pb-3 text-sm">
            Post
          </span>
        )}
      </div>
    </div>
  );
};

export default Post;
