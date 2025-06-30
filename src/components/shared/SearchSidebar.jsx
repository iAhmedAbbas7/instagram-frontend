// <= IMPORTS =>
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";
import axiosClient from "@/utils/axiosClient";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  addRecentSearch,
  clearAllSearches,
  removeRecentSearch,
} from "@/redux/searchSlice";

const SearchSidebar = ({ isOpen, onClose, offset, justOpened }) => {
  // DISPATCH
  const dispatch = useDispatch();
  // NAVIGATION
  const navigate = useNavigate();
  // SEARCH SIDEBAR CONTAINER REF
  const searchSidebarRef = useRef();
  // SETTING THE IGNORE CLICK REF
  const ignoreClick = useRef(false);
  // SEARCH INPUT REF
  const searchInputRef = useRef();
  // SEARCH STATE
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  // SEARCH INPUT FOCUS STATE MANAGEMENT
  const [isFocused, setIsFocused] = useState(false);
  // GETTING RECENT SEARCHES FROM SEARCH SLICE
  const { recentSearches } = useSelector((store) => store.search);
  // EFFECT TO CLEAR INPUT AND SET FOCUS ON EACH RENDER
  useEffect(() => {
    setQuery("");
    setResults([]);
    setIsFocused(true);
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);
  // FIRING THE SEARCH WHENEVER THE DEBOUNCE CHANGES
  useEffect(() => {
    // IF THE DEBOUNCED QUERY IS EMPTY
    if (!debouncedQuery.trim()) {
      // SETTING THE RESULTS TO AN EMPTY ARRAY
      setResults([]);
      return;
    }
    // FETCHING RESULTS
    const fetchResults = async () => {
      // LOADING STATE
      setLoading(true);
      // MAKING REQUEST
      try {
        const response = await axiosClient.get(
          `/user/search?q=${encodeURIComponent(debouncedQuery)}`
        );
        // IF RESPONSE SUCCESS
        if (response.data.success) {
          // SETTING RESULTS WITH RETURNED USERS
          setResults(response.data.users);
        } else {
          // SETTING RESULTS WITH AN EMPTY ARRAY
          setResults([]);
        }
      } catch (error) {
        // LOGGING ERROR MESSAGE
        console.error("Error Fetching Search Results!", error);
        // TOASTING ERROR MESSAGE
        toast.error(
          error?.response?.data?.message || "Error Fetching Search Results!"
        );
      } finally {
        // LOADING STATE
        setLoading(false);
      }
    };
    fetchResults();
  }, [debouncedQuery]);
  // CLICK OUTSIDE HANDLER
  useEffect(() => {
    // JUST OPENED STATE PASSED THROUGH THE LEFT SIDEBAR ON SEARCH ICON CLICK
    ignoreClick.current = !!justOpened;
    // IF CLICKED OUTSIDE THE CONTAINER
    const handleClick = (e) => {
      // IF CLICKED FOR THE FIRST TIME THEN
      if (ignoreClick.current) {
        ignoreClick.current = false;
        return;
      }
      if (
        searchSidebarRef.current &&
        !searchSidebarRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    // ON OPEN STATE
    if (isOpen) {
      // ADDING EVENT LISTENER
      document.addEventListener("click", handleClick);
    }
    // CLEANUP FUNCTION
    return () => {
      // REMOVING EVENT LISTENER
      document.removeEventListener("click", handleClick);
    };
  }, [isOpen, onClose, justOpened]);
  // CLEAR INPUT & REMOVE FOCUS HANDLER
  const handleClear = () => {
    setQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };
  // USER SELECT HANDLER
  const handleSelectUser = (user) => {
    // IF NO USER IS PASSED THEN
    if (!user) return;
    // CLOSING THE SEARCH SIDEBAR
    onClose();
    // NAVIGATING TO USER PROFILE
    navigate(`/home/profile/${user._id}`);
    // ADDING THE USER TO THE RECENT SEARCHES
    dispatch(addRecentSearch(user));
    // CLEARING THE SEARCH INPUT
    setQuery("");
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          style={{ left: offset }}
          className="fixed top-0 h-full w-[350px] bg-white rounded-r-lg shadow-xl z-[10] overflow-hidden"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "tween", duration: 0.5 }}
          ref={searchSidebarRef}
        >
          {/* MAIN SEARCH CONTAINER */}
          <section className="flex flex-col items-start justify-start w-full h-full pt-5">
            {/* HEADING */}
            <h1 className="w-full px-4 text-[1.5rem] font-semibold">Search</h1>
            {/* SEARCH INPUT */}
            <div className="px-4 w-full relative flex items-center justify-center mt-5 border-b-2 border-gray-200 pb-7">
              {/* INPUT */}
              <input
                type="text"
                name="search"
                id="search"
                ref={searchInputRef}
                value={query}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value) setIsFocused(true);
                }}
                placeholder="Search"
                autoComplete="off"
                className={`bg-gray-100 border-none outline-none focus:outline-none  ${
                  isFocused || !!query ? "pl-3" : "pl-11"
                }  pr-3 py-1.5 text-gray-500 placeholder:text-gray-500 w-full rounded-md transition-all duration-200 ease-in-out`}
              />
              {/* SEARCH ICON */}
              {!(isFocused || !!query) && (
                <span className="left-6 absolute">
                  <Search className="text-gray-500" />
                </span>
              )}
              {/* LOADING SPINNER & CLEAR FIELD */}
              {loading ? (
                <span className="absolute right-6">
                  <Loader2 size={20} className="animate-spin text-gray-500" />
                </span>
              ) : (
                <span
                  onClick={handleClear}
                  className="absolute right-6 p-1 rounded-full flex items-center justify-center bg-gray-200 cursor-pointer"
                >
                  <X size={13} className="text-gray-500" />
                </span>
              )}
            </div>
            {/* RECENT SECTION */}
            {!debouncedQuery && !query && !loading && (
              <section className="w-full flex items-center justify-between p-4">
                <h4 className="text-[1rem] font-semibold">Recent</h4>
                {recentSearches.length > 0 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      // CLEARING ALL RECENT SEARCHES
                      dispatch(clearAllSearches());
                    }}
                    className="text-xs font-semibold text-sky-400 cursor-pointer hover:underline underline-offset-2"
                  >
                    Clear All
                  </span>
                )}
              </section>
            )}
            {/* WHEN NO RECENT SEARCHES */}
            {!debouncedQuery && !loading && recentSearches.length === 0 && (
              <section className="w-full flex flex-1 items-center justify-center">
                <h5 className="text-gray-500 text-sm font-semibold">
                  No recent searches.
                </h5>
              </section>
            )}
            {/* RECENT SEARCHES SECTION */}
            {!debouncedQuery && !loading && recentSearches.length > 0 && (
              <section className="w-full flex flex-col flex-1 items-start justify-start overflow-y-auto">
                {recentSearches.map((u) => {
                  // AVATAR FALLBACK MANAGEMENT
                  const fullNameInitials = u?.fullName
                    ? getFullNameInitials(u?.fullName)
                    : "";
                  return (
                    <>
                      {/* AVATAR & USERNAME */}
                      <div
                        key={u._id}
                        onClick={() => navigate(`/home/profile/${u?._id}`)}
                        className="w-full flex items-center gap-3 hover:bg-gray-100 p-3 cursor-pointer relative"
                      >
                        {/* AVATAR */}
                        <Avatar
                          className={`w-11 h-11 cursor-pointer ${
                            u?.profilePhoto === "" ? "bg-gray-300" : "bg-none"
                          } `}
                        >
                          <AvatarImage
                            src={u?.profilePhoto}
                            alt={u?.fullName}
                          />
                          <AvatarFallback>{fullNameInitials}</AvatarFallback>
                        </Avatar>
                        {/* USERNAME */}
                        <div className="flex flex-col">
                          <span className="font-semibold text-[1rem]">
                            {u?.username}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {u.fullName}
                          </span>
                        </div>
                        {/* CLEAR BUTTON */}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(removeRecentSearch(u?._id));
                          }}
                          title="Delete"
                          className="absolute right-4"
                        >
                          <X size={25} className="text-gray-500" />
                        </span>
                      </div>
                    </>
                  );
                })}
              </section>
            )}
            {/* WHEN NO RESULTS FOUND */}
            {debouncedQuery && results.length === 0 && !loading && (
              <section className="w-full flex flex-1 items-center justify-center">
                <h4 className="text-sm font-semibold text-gray-500">
                  No results found
                </h4>
              </section>
            )}
            {/* RESULTS SECTION */}
            {debouncedQuery && !loading && results.length > 0 && (
              <section className="w-full flex flex-1 flex-col items-start justify-start overflow-y-auto">
                {results.map((u) => {
                  // AVATAR FALLBACK MANAGEMENT
                  const fullNameInitials = u?.fullName
                    ? getFullNameInitials(u?.fullName)
                    : "";
                  return (
                    <>
                      {/* AVATAR & USERNAME */}
                      <div
                        key={u._id}
                        onClick={() => handleSelectUser(u)}
                        className="w-full flex items-center gap-3 hover:bg-gray-100 p-3 cursor-pointer"
                      >
                        {/* AVATAR */}
                        <Avatar
                          className={`w-11 h-11 cursor-pointer ${
                            u?.profilePhoto === "" ? "bg-gray-300" : "bg-none"
                          } `}
                        >
                          <AvatarImage
                            src={u?.profilePhoto}
                            alt={u?.fullName}
                          />
                          <AvatarFallback>{fullNameInitials}</AvatarFallback>
                        </Avatar>
                        {/* USERNAME */}
                        <div className="flex flex-col">
                          <span className="font-semibold text-[1rem]">
                            {u?.username}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {u.fullName}
                          </span>
                        </div>
                      </div>
                    </>
                  );
                })}
              </section>
            )}
          </section>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default SearchSidebar;
