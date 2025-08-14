// <== IMPORTS ==>
import StoryCarousel from "./StoryCarousel";

const StoryTrayTest = () => {
  // SLIDES COUNT FOR STORY CAROUSEL FOR TESTING
  const SLIDE_COUNT = 20;
  // STORY CAROUSEL API AUTO SCROLL OPTIONS
  const STORY_CAROUSEL_OPTIONS = { slidesToScroll: 4 };
  // SLIDES ARRAY TO PASS TO THE STORY CAROUSEL
  const SLIDES = Array.from(Array(SLIDE_COUNT).keys());
  // COMPONENT'S RETURN
  return (
    <section className="mb-6">
      {/* MAIN STORY CAROUSEL COMPONENT */}
      <StoryCarousel slides={SLIDES} options={STORY_CAROUSEL_OPTIONS} />
    </section>
  );
};

export default StoryTrayTest;
