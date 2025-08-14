// <== IMPORTS ==>
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export const usePrevNextButtons = (emblaApi) => {
  // NEXT BUTTON STATE MANAGEMENT (ENABLED/DISABLED)
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  // PREVIOUS BUTTON STATE MANAGEMENT (ENABLED/DISABLED)
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  // NEXT BUTTON CLICK HANDLER
  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);
  // PREVIOUS BUTTON CLICK HANDLER
  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);
  // CALLBACK RUN WHEN CAROUSEL RE-INITIALIZES TO UPDATE BUTTON STATES
  const onSelect = useCallback((emblaApi) => {
    // SET NEXT BUTTON DISABLED IF CANNOT SCROLL NEXT
    setNextBtnDisabled(!emblaApi.canScrollNext());
    // SET PREVIOUS BUTTON DISABLED IF CANNOT SCROLL NEXT
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
  }, []);
  // WHEN CAROUSEL API IS READY, RUNNING SELECT CALLBACK WITH EVENT LISTENERS
  useEffect(() => {
    // IF API IS NOT READY, THEN RETURNING
    if (!emblaApi) return;
    // INITIAL CALL TO API TO SET CORRECT BUTTON STATES
    onSelect(emblaApi);
    // ATTACHING LISTENERS ON RE-INITIALIZATION OR WHEN SELECTION CHANGES
    emblaApi.on("reInit", onSelect).on("select", onSelect);
    // CLEANUP OF EVENT LISTENERS WHEN API CHANGES OR UNMOUNTS
    return () => {
      // IF API IS NOT READY, THEN RETURNING
      if (!emblaApi) return;
      // REMOVING EVENT LISTENERS
      emblaApi.off("reInit", onSelect).off("select", onSelect);
    };
  }, [emblaApi, onSelect]);
  // RETURNING STATES & HANDLERS FOR USAGE
  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  };
};
// <== NEXT BUTTON ==>
export const NextButton = (props) => {
  // COMPONENT PROPS
  const { children, ...restProps } = props;
  return (
    <button
      title="Next"
      className="cursor-pointer"
      type="button"
      {...restProps}
    >
      <ChevronRight size={35} className="text-gray-500" />
      {children}
    </button>
  );
};
// <== PREVIOUS BUTTON ==>
export const PrevButton = (props) => {
  // COMPONENT PROPS
  const { children, ...restProps } = props;
  return (
    <button
      title="Previous"
      className="cursor-pointer"
      type="button"
      {...restProps}
    >
      <ChevronLeft size={35} className="text-gray-500" />
      {children}
    </button>
  );
};
