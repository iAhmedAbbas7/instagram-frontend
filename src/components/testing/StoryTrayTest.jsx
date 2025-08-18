// <== IMPORTS ==>
import StoryCarousel from "./StoryCarousel";

const StoryTrayTest = () => {
  // STORY CAROUSEL API AUTO SCROLL OPTIONS
  const STORY_CAROUSEL_OPTIONS = { slidesToScroll: 4 };
  // COMPONENT'S RETURN
  return (
    <section className="mb-6">
      {/* MAIN STORY CAROUSEL COMPONENT */}
      <StoryCarousel options={STORY_CAROUSEL_OPTIONS} />
    </section>
  );
};

export default StoryTrayTest;
