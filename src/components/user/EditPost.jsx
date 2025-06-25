// <= IMPORTS =>
import { toast } from "sonner";
import { Button } from "../ui/button";
import useTitle from "@/hooks/useTitle";
import { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";
import useGetPostById from "@/hooks/useGetPostById";
import { Check, Loader2, User2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const EditPost = () => {
  // USING USE TITLE HOOK
  useTitle("Instagram - Edit Post");
  // PARAMS HOOK
  const params = useParams();
  // GETTING POST ID FROM REQUEST PARAMS
  const postId = params.id;
  // NAVIGATION
  const navigate = useNavigate();
  // USING GET POST BY ID HOOK
  const { loading, post } = useGetPostById(postId);
  // AVATAR FALLBACK MANAGEMENT
  const fullNameInitials =
    post && post?.author?.fullName
      ? getFullNameInitials(post?.author?.fullName)
      : "";
  // SYNCING POST CAPTION ON RENDER
  useEffect(() => {
    if (post?.caption) setCaption(post?.caption);
  }, [post]);
  // POST CAPTION STATE
  const [caption, setCaption] = useState(post?.caption);
  // EDIT LOADING STATE
  const [editing, setEditing] = useState(false);
  // EDIT POST HANDLER
  const editPostHandler = async () => {
    // EDITING LOADING STATE
    setEditing(true);
    // MAKING REQUEST
    try {
      const response = await axiosClient.post(
        `/post/${post?._id}/edit`,
        { caption },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // TOASTING SUCCESS MESSAGE
        toast.success(response.data.message);
        // NAVIGATING TO PROFILE PAGE
        navigate(`/home/profile/${post?.author?._id}`);
      }
    } catch (error) {
      // LOGGING ERROR MESSAGE
      console.error("Failed to Perform Action!", error);
      // TOASTING ERROR MESSAGE
      toast.error(
        error?.response?.data?.message || "Failed to Perform Action!"
      );
    } finally {
      // EDITING LOADING STATE
      setEditing(false);
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
    // EDIT POST MAIN WRAPPER
    <section className="w-full max-[1200px]:pl-[70px] max-[768px]:pt-[75px] max-[768px]:pb-[60px] pl-[250px] flex items-center justify-center max-[768px]:px-4">
      {/* POST SECTION */}
      {!loading && post && (
        <section className="md:max-w-[70%] w-full py-6 flex flex-col items-start justify-start">
          {/* HEADER */}
          <div className="w-full flex items-center justify-between flex-wrap-reverse">
            {/* AVATAR & USERNAME */}
            <div className="flex items-center gap-3">
              {/* AVATAR */}
              <Avatar
                className={`w-11 h-11 cursor-pointer ${
                  post?.author?.profilePhoto === "" ? "bg-gray-300" : "bg-none"
                } `}
              >
                <AvatarImage
                  src={post?.author?.profilePhoto}
                  alt={post?.author?.fullName}
                />
                <AvatarFallback>{fullNameInitials}</AvatarFallback>
              </Avatar>
              {/* USERNAME */}
              <div className="flex flex-col cursor-pointer">
                <span className="font-semibold text-[0.9rem]">
                  {post?.author?.username}
                </span>
                <span className="text-gray-500 text-sm">
                  {post?.author?.fullName}
                </span>
              </div>
            </div>
            {/* VIEW PROFILE */}
            <Button
              onClick={() => navigate(`/home/profile/${post?.author?._id}`)}
              type="button"
              className="bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer"
            >
              <User2 size={50} />
              View Profile
            </Button>
          </div>
          {/* POST IMAGE */}
          <div className="w-full flex items-center justify-center mt-12">
            <img
              src={post?.image}
              alt="Post Image"
              className="h-100 aspect-auto object-cover rounded-sm"
            />
          </div>
          {/* POST CAPTION */}
          <div className="w-full mt-5">
            <h1 className="text-[1.2rem] font-semibold mb-2">Caption</h1>
            <textarea
              name="caption"
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a Caption..."
              spellCheck="false"
              className="border-gray-200 border-2 outline-none focus:outline-none rounded-xl h-[7rem] w-full p-4 text-gray-500 resize-none"
            />
          </div>
          {/* SUBMIT BUTTON */}
          <div className="w-full flex items-center justify-end mt-5">
            <Button
              onClick={editPostHandler}
              disabled={editing}
              type="button"
              className="bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer"
            >
              {editing ? (
                <Loader2 size={50} className="animate-spin text-white" />
              ) : (
                <Check size={50} />
              )}
              {editing ? "Saving Changes" : "Save Changes"}
            </Button>
          </div>
        </section>
      )}
    </section>
  );
};

export default EditPost;
