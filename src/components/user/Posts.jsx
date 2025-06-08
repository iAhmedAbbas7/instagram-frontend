// <= IMPORTS =>
import Post from "./Post";
import { useSelector } from "react-redux";

const Posts = () => {
  // GETTING POSTS FROM POST SLICE
  const { posts } = useSelector((store) => store.post);
  return (
    <section className="md:max-w-[500px] w-full">
      {posts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </section>
  );
};

export default Posts;
