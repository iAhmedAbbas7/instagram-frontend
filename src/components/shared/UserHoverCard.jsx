// <= IMPORTS =>
import { useState } from "react";
import { Button } from "../ui/button";
import axiosClient from "@/utils/axiosClient";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Image, Loader2, MessageCircle, UserPlus } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

const UserHoverCard = ({ user, children }) => {
  // NAVIGATION
  const navigate = useNavigate();
  // HOVER CARD OPEN STATE
  const [open, setOpen] = useState(false);
  // AVATAR FALLBACK MANAGEMENT
  const fullNameInitials = user?.fullName
    ? getFullNameInitials(user?.fullName)
    : "";
  // FETCHING USER POSTS WHEN THE HOVER CARD IS OPEN & CACHING IT FOR 5 MINUTES
  const { data, isLoading, error } = useQuery({
    queryKey: ["recentUserPosts", user?._id],
    queryFn: () =>
      axiosClient
        .get(`/post/${user?._id}/getRecentPosts`)
        .then((res) => res.data.posts),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });
  console.log(error);
  return (
    <HoverCard open={open} onOpenChange={setOpen}>
      <HoverCardTrigger
        onClick={() => navigate(`/home/profile/${user?._id}`)}
        asChild
      >
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="border-none outline-none focus:outline-none focus-visible:ring-0 rounded-sm p-0 w-[400px] shadow-2xl bg-white z-[50]">
        {/* HOVER CONTENT MAIN WRAPPER */}
        <div className="w-full flex flex-col items-center justify-center">
          {/* HEADER */}
          <div className="px-6 py-6 w-full flex items-center gap-3">
            {/* AVATAR */}
            <div>
              <Avatar
                className={`w-10 h-10 cursor-pointer ${
                  user?.profilePhoto === "" ? "bg-gray-300" : "bg-none"
                } `}
              >
                <AvatarImage src={user?.profilePhoto} alt={user?.fullName} />
                <AvatarFallback>{fullNameInitials}</AvatarFallback>
              </Avatar>
            </div>
            {/* USER INFO */}
            <div className="flex flex-col items-start justify-center">
              <span className="flex items-center gap-2 font-[600] text-[1rem]">
                {user?.username}
              </span>
              <span className="text-gray-500 text-xs">{user?.fullName}</span>
            </div>
          </div>
          {/* PROFILE INFO */}
          <div className="w-full flex items-center justify-evenly pb-4">
            {/* POSTS */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[1.1rem] font-[600]">
                {user?.posts?.length}
              </span>
              <span className="text-sm text-gray-500">posts</span>
            </div>
            {/* FOLLOWERS */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[1.1rem] font-[600]">
                {user?.followers?.length}
              </span>
              <span className="text-sm text-gray-500">followers</span>
            </div>
            {/* FOLLOWING */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[1.1rem] font-[600]">
                {user?.following?.length}
              </span>
              <span className="text-sm text-gray-500">following</span>
            </div>
          </div>
          {/* POSTS SECTION */}
          <div className="w-full flex items-center justify-center gap-[0.2rem] my-4">
            {/* IF LOADING */}
            {isLoading && (
              <div className="w-full h-[9rem] flex items-center justify-center">
                <Loader2 size={30} className="text-gray-500 animate-spin" />
              </div>
            )}
            {/* IF NOT LOADING */}
            {!isLoading && data?.length > 0 && (
              <div className="w-full flex items-center justify-start gap-[0.2rem] my-4">
                {data?.map((post) => (
                  <img
                    key={post?._id}
                    src={post?.image}
                    alt="Post Image"
                    className="h-[8.19rem] object-cover aspect-square"
                  />
                ))}
              </div>
            )}
            {/* IF NO POSTS */}
            {!isLoading &&
              error?.response?.data?.message === "No Posts Found!" && (
                <div className="w-full h-[9rem] flex flex-col gap-3 items-center justify-center bg-gray-100">
                  <Image size={40} className="text-red-500" />
                  <span className="text-gray-500 font-semibold text-[0.9rem]">
                    No posts available
                  </span>
                </div>
              )}
          </div>
          {/* FOLLOW & MESSAGE BUTTON */}
          <div className="w-full pt-2 pb-4 flex items-center justify-center gap-3 px-5">
            {/* FOLLOW BUTTON */}
            <Button
              type="button"
              className="bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer w-1/2"
            >
              <UserPlus size={50} />
              Follow
            </Button>
            {/* MESSAGE BUTTON */}
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
  );
};

export default UserHoverCard;
