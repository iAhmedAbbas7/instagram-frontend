// <= IMPORTS =>
import Post from "./Post";

const Posts = () => {
  return (
    <section className="md:max-w-[500px] w-full">
      {[1, 2, 3, 4].map((post, index) => (
        <Post key={index} />
      ))}
    </section>
  );
};

export default Posts;
