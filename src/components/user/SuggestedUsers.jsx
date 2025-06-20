// <= IMPORTS =>
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const SuggestedUsers = () => {
  // USING GET SUGGESTED USERS HOOK
  const { loading } = useGetSuggestedUsers();
  // GETTING SUGGESTED USERS FROM AUTH SLICE
  const { suggestedUsers } = useSelector((store) => store.auth);
  return (
    // SUGGESTED USERS MAIN WRAPPER
    <div className="w-full">
      {/* HEADING */}
      <div className="flex items-center justify-between w-full text-gray-500 font-semibold text-[0.9rem]">
        <h1>Suggested for you</h1>
        <span className="text-black text-sm font-semibold cursor-pointer">
          See All
        </span>
      </div>
      {/* SUGGESTED USERS SECTION */}
      <div className="w-full">
        {/* IF LOADING */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={30} className="animate-spin text-gray-500" />
          </div>
        )}
        {/* IF NOT LOADING */}
        <section className="w-full flex flex-col items-start justify-start gap-4 my-5">
          {!loading &&
            suggestedUsers.map((user) => {
              // AVATAR FALLBACK MANAGEMENT
              const fullNameInitials = getFullNameInitials(user?.fullName);
              return (
                <div
                  className="flex items-center justify-between w-full"
                  key={user._id}
                >
                  {/* AVATAR & USERNAME */}
                  <div className="flex items-center gap-3">
                    {/* AVATAR */}
                    <Avatar
                      className={`w-11 h-11 cursor-pointer ${
                        user.profilePhoto === "" ? "bg-gray-300" : "bg-none"
                      } `}
                    >
                      <AvatarImage
                        src={user.profilePhoto}
                        alt={user.fullName}
                      />
                      <AvatarFallback>{fullNameInitials}</AvatarFallback>
                    </Avatar>
                    {/* USERNAME */}
                    <div className="flex flex-col cursor-pointer">
                      <span className="font-semibold text-[0.9rem]">
                        {user?.username}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {user?.fullName}
                      </span>
                    </div>
                  </div>
                  {/* FOLLOW BUTTON */}
                  <span className="cursor-pointer text-xs text-sky-400 hover:text-sky-500 font-semibold">
                    Follow
                  </span>
                </div>
              );
            })}
        </section>
      </div>
    </div>
  );
};

export default SuggestedUsers;
