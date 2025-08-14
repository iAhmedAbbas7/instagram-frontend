// <= IMPORTS =>
import Post from "./Post";
import { Loader2, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useCallback, useRef } from "react";
import useGetInfinitePosts from "@/hooks/useGetInfinitePosts";

const Posts = () => {
  // GETTING POSTS FROM POST SLICE
  const { posts } = useSelector((store) => store.post);
  // USING USE GET INFINITE POSTS HOOK
  const { loading, hasMore, loadNext } = useGetInfinitePosts(10);
  // OBSERVER REF
  const observer = useRef();
  // SETTING LAST POST
  const lastPostRef = useCallback(
    (node) => {
      // IF LOADING
      if (loading) return;
      // REMOVING REF FROM THE PREVIOUS LAST POST
      if (observer.current) observer.current.disconnect();
      // ADDING INTERSECTION OBSERVER TO SET THE REF TO THE LAST POST IN VIEW
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadNext();
        }
      });
      // OBSERVER FOR THE ATTACHED NODE
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadNext]
  );
  return (
    // POSTS SECTION MAIN WRAPPER
    <section className="max-w-[500px] max-[1160px]:w-full">
      {/* IF POSTS AVAILABLE */}
      {posts.map((post, i) => {
        const ref = i === posts.length - 1 ? lastPostRef : null;
        return <Post ref={ref} key={post._id} post={post} />;
      })}
      {/* IF LOADING STATE */}
      {loading && (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={40} className="animate-spin text-sky-400" />
        </div>
      )}
      {/* IF NO MORE POSTS AVAILABLE */}
      {!hasMore && !loading && (
        <div className="flex items-center justify-center pb-6">
          <h1 className="flex items-center gap-2 px-3 py-1 rounded-sm bg-gray-100">
            <X className="text-sky-400" />
            <span className="text-gray-500 font-semibold">No More Posts</span>
          </h1>
        </div>
      )}
    </section>
  );
};

export default Posts;
