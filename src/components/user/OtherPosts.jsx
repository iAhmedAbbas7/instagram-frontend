// <= IMPORTS =>
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaMessage } from "react-icons/fa6";
import useGetOtherPosts from "@/hooks/useGetOtherPosts";

const OtherPosts = ({ author, excludedId }) => {
  // NAVIGATION
  const navigate = useNavigate();
  // USING GET OTHER POSTS HOOK
  const { loading, posts } = useGetOtherPosts(excludedId, author._id);
  // IF LOADING
  if (loading || !posts) {
    return (
      <div className="w-full flex items-center justify-center py-10">
        <Loader2 size={40} className="animate-spin text-gray-500" />
      </div>
    );
  }
  // IF NO POSTS AVAILABLE
  if (!loading && posts.length === 0) {
    return (
      <div className="w-full px-8 py-10 flex items-center justify-center">
        <div className="w-full border-t-2 border-gray-200"></div>
      </div>
    );
  }
  return (
    // OTHER POSTS MAIN WRAPPER
    <section className="w-full px-12 pt-12 pb-10">
      {/* OTHER POSTS CONTENT WRAPPER */}
      <section className="w-full pt-8 border-t-2 border-gray-200 flex flex-col items-start justify-start">
        {/* SECTION TEXT */}
        <div className="w-full pb-2">
          <h4 className="text-[0.9rem] font-semibold text-gray-500">
            More posts from{" "}
            <span
              onClick={() => navigate(`/home/profile/${author._id}`)}
              className="text-black hover:underline underline-offset-2 cursor-pointer"
            >
              {author.username}
            </span>
          </h4>
        </div>
        {/* OTHER POSTS */}
        <section className="w-full grid grid-cols-3 max-[768px]:grid-cols-2 max-[600px]:grid-cols-1 gap-2 pt-1 pb-6">
          {!loading &&
            posts.map((post) => (
              <div key={post._id} className="relative group cursor-pointer">
                {/* POST IMAGE */}
                <img
                  src={post?.image}
                  alt="Post Image"
                  className="w-full h-full object-cover rounded-sm"
                />
                {/* IMAGE OVERLAY */}
                <div
                  onClick={() => {
                    navigate(`/home/post/${post._id}`);
                  }}
                  className="absolute inset-0 bg-black/70 opacity-0 rounded-sm flex items-center justify-center group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-white flex items-center gap-2">
                      <FaHeart size={"22px"} />
                      <span className="text-[1.1rem] font-semibold">
                        {post?.likes?.length}
                      </span>
                    </div>
                    <div className="text-white flex items-center gap-2">
                      <FaMessage size={"22px"} />
                      <span className="text-[1.1rem] font-semibold">
                        {post?.comments?.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </section>
      </section>
    </section>
  );
};

export default OtherPosts;
