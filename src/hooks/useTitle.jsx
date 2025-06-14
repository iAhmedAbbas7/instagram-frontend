// <= IMPORTS =>
import { useEffect } from "react";

const useTitle = (title) => {
  useEffect(() => {
    // GETTING THE PREVIOUS DOCUMENT TITLE
    const prevTitle = document.title;
    // SETTING THE TITLE OF THE CURRENT DOCUMENT
    document.title = title;
    // RESTORING THE PREVIOUS TITLE ON UNMOUNT
    return () => (document.title = prevTitle);
  }, [title]);
};

export default useTitle;
