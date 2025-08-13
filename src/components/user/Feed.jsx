// <= IMPORTS =>
import Posts from "./Posts";
import StoryTrayTest from "../testing/StoryTrayTest";

const Feed = () => {
  return (
    // FEED MAIN WRAPPER
    <div className="flex flex-col flex-1 items-center justify-center max-[768px]:pl-[0] max-[768px]:px-2 max-[768px]:pt-[75px] max-[768px]:pb-[35px] max-[1200px]:pl-[70px] pl-[250px]">
      <StoryTrayTest />
      <Posts />
    </div>
  );
};

export default Feed;
