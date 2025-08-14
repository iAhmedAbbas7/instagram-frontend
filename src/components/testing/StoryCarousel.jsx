// <== IMPORTS ==>
import useEmblaCarousel from "embla-carousel-react";
import {
  PrevButton,
  NextButton,
  usePrevNextButtons,
} from "./StoryCarouselControls";

const StoryCarousel = (props) => {
  // GETTING SLIDES NUMBER AND OPTIONS FROM PROPS
  const { slides, options } = props;
  // INITIALIZE STORY CAROUSEL AND GET API & REF
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  // HOOK PROVIDING PREVIOUS & NEXT BUTTONS AND THEIR STATES
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);
  return (
    <>
      {/* STORY CAROUSEL MAIN WRAPPER */}
      <section className="min-[768px]:max-w-[620px] w-[96vw]">
        {/* STORY CAROUSEL CONTENT WRAPPER */}
        <div
          className="w-full overflow-hidden relative flex items-center justify-center"
          ref={emblaRef}
        >
          {/* CONTENT SECTION */}
          <div className="w-full flex items-center gap-2">
            {slides.map((index) => (
              <div
                className="flex-none min-w-0 pl-4 transform border-2 rounded-full w-22 h-22 flex items-center justify-center"
                key={index}
              ></div>
            ))}
          </div>
          {/* PREVIOUS BUTTON */}
          <div className="absolute left-0">
            <PrevButton
              onClick={onPrevButtonClick}
              disabled={prevBtnDisabled}
            />
          </div>
          {/* NEXT BUTTON */}
          <div className="absolute right-0">
            <NextButton
              onClick={onNextButtonClick}
              disabled={nextBtnDisabled}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default StoryCarousel;
