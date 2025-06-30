// <= IMPORTS =>
import { useEffect, useState } from "react";

const useDebounce = (value, delay = 300) => {
  // STATE MANAGEMENT
  const [debounced, setDebounced] = useState(value);
  // USE EFFECT FOR DEBOUNCING
  useEffect(() => {
    const debounceHandler = setTimeout(() => {
      setDebounced(value);
    }, delay);
    // CLEANUP FUNCTION
    return () => clearTimeout(debounceHandler);
  }, [value, delay]);
  // RETUNING DEBOUNCED VALUE
  return debounced;
};

export default useDebounce;
