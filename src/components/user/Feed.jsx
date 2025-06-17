// <= IMPORTS =>
import Posts from "./Posts";

const Feed = () => {
  return (
    <div className="flex flex-col flex-1 items-center justify-center max-[1200px]:pl-[70px] pl-[250px]">
      <Posts />
    </div>
  );
};

export default Feed;
