// <= IMPORTS =>
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";
import axiosClient from "@/utils/axiosClient";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Loader2, Search, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import INSTAGRAM from "../../assets/images/INSTAGRAM-TXT.png";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  addRecentSearch,
  clearAllSearches,
  removeRecentSearch,
} from "@/redux/searchSlice";

const Header = () => {
  // DISPATCH
  const dispatch = useDispatch();
  // NAVIGATION
  const navigate = useNavigate();
  // SEARCH INPUT REF
  const searchInputRef = useRef();
  // LOCATION
  const { pathname } = useLocation();
  // SEARCH STATE
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const [isFocused, setIsFocused] = useState(false);
  // FIRING SEARCH WHENEVER DEBOUNCE CHANGES
  useEffect(() => {
    // IF DEBOUNCED QUERY IS EMPTY
    if (!debouncedQuery.trim()) {
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
          // SETTING RESULTS
          setResults(response.data.users);
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
  // SEARCH INPUT CLICK HANDLER
  const searchClickHandler = () => {
    // SHOWING PANEL
    setShowSearchPanel(true);
  };
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
    // CLOSING THE SEARCH PANEL
    setShowSearchPanel(false);
    // NAVIGATING TO USER PROFILE
    navigate(`/home/profile/${user._id}`);
    // ADDING THE USER TO THE RECENT SEARCHES
    dispatch(addRecentSearch(user));
    // CLEARING THE SEARCH INPUT
    setQuery("");
  };
  // HIDDEN ROUTES ADDRESS ARRAY
  const hiddenRoutesArray = ["/home/chat", "/home/notifications"];
  // CHECKING IF THE ROUTE IS HIDDEN
  const isHiddenRoute = hiddenRoutesArray.some((route) =>
    pathname.startsWith(route)
  );
  // GETTING UNREAD NOTIFICATIONS STATE FROM NOTIFICATION SLICE
  const { hasUnread } = useSelector((store) => store.notification);
  // WINDOW WIDTH TRACKING STATE
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  // SEARCH PANEL STATE
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  // GETTING RECENT SEARCHES FROM SEARCH SLICE
  const { recentSearches } = useSelector((store) => store.search);
  // SEARCH PANEL NO RECENT SEARCHES SECTION STATE
  const noRecentSearches =
    !debouncedQuery && !loading && recentSearches.length === 0;
  // SEARCH PANEL RECENT SEARCHES SECTION STATE
  const panelRecentSearches =
    !debouncedQuery && !query && !loading && recentSearches.length > 0;
  // SEARCH PANEL RECENT HEADING SECTION STATE
  const recentSection = !debouncedQuery && !query && !loading;
  // SEARCH PANEL RESULTS SECTION STATE
  const searchResults = debouncedQuery && !loading && results.length > 0;
  // SEARCH PANEL ZERO RESULTS SECTION STATE
  const zeroSearchResults = debouncedQuery && results.length === 0 && !loading;
  // EFFECT TO UPDATE WINDOW WIDTH STATE ON WINDOW WIDTH CHANGE
  useEffect(() => {
    // RESIZE HANDLER
    const handleResize = () => setWindowWidth(window.innerWidth);
    // ADDING EVENT LISTENER
    window.addEventListener("resize", handleResize);
    // CLEANUP
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // CLOSING THE SEARCH PANEL ON ABOVE 768PX
  useEffect(() => {
    if (windowWidth > 768) {
      setShowSearchPanel(false);
    }
  }, [windowWidth]);
  return (
    // HEADER MAIN WRAPPER
    <section
      className={`bg-white hidden ${
        isHiddenRoute ? "max-[768px]:hidden" : "max-[768px]:flex"
      } items-center justify-between px-4 h-[70px] fixed top-0 w-full z-[999999]`}
    >
      {/* LEFT SECTION */}
      <div className="flex items-center justify-center">
        <img
          onClick={() => navigate("/home")}
          src={INSTAGRAM}
          alt="Logo"
          className="min-[600px]:h-9 h-8 cursor-pointer"
        />
      </div>
      {/* RIGHT SECTION */}
      <div className="flex items-center justify-center gap-4">
        {/* SEARCH SECTION */}
        <div className="relative flex items-center justify-center">
          <input
            ref={searchInputRef}
            onClick={searchClickHandler}
            value={query}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value) setIsFocused(true);
            }}
            type="text"
            className={`bg-gray-100 border-none outline-none focus:outline-none  ${
              isFocused || !!query ? "pl-3" : "pl-11"
            }  pr-10 py-1.5 text-gray-500 placeholder:text-gray-500 w-full rounded-md transition-all duration-200 ease-in-out`}
            placeholder="Search"
            autoComplete="off"
            spellCheck="false"
          />
          {/* SEARCH ICON */}
          {!(isFocused || !!query) && (
            <span className="left-3 absolute">
              <Search className="text-gray-500" />
            </span>
          )}
          {/* LOADING SPINNER & CLEAR FIELD */}
          {loading ? (
            <span className="absolute right-3">
              <Loader2 size={20} className="animate-spin text-gray-500" />
            </span>
          ) : (
            <span
              onClick={handleClear}
              className="absolute right-3 p-1 rounded-full flex items-center justify-center bg-gray-200 cursor-pointer"
            >
              <X size={13} className="text-gray-500" />
            </span>
          )}
          {/* SEARCH PANEL */}
          {showSearchPanel && (
            <div className="absolute h-[78vh] min-[600px]:w-[60vw] w-[75vw] bg-white rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.4)] top-12 right-0 z-[100]">
              {/* SEARCH PANEL CONTENT WRAPPER */}
              <div className="w-full flex h-full flex-col">
                {/* HEADER */}
                <header className="w-full flex items-center justify-between px-4 py-3 border-b-2 border-gray-200">
                  <h5 className="text-[1.1rem] font-semibold">Search</h5>
                  <span
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSearchPanel(false);
                      setQuery("");
                    }}
                    title="Close"
                  >
                    <X size={28} className="hover:text-gray-500" />
                  </span>
                </header>
                {/* SEARCH SECTION */}
                <div className="flex flex-col flex-1 w-full h-full">
                  {/* RECENT SECTION */}
                  {recentSection && (
                    <section className="w-full flex items-center justify-between px-4 py-2">
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
                  {noRecentSearches && (
                    <section className="w-full flex flex-1 items-center justify-center">
                      <h5 className="text-gray-500 text-sm font-semibold">
                        No recent searches.
                      </h5>
                    </section>
                  )}
                  {/* RECENT SEARCHES SECTION */}
                  {panelRecentSearches && (
                    <section className="w-full flex flex-col flex-1 items-start justify-start overflow-y-auto">
                      {recentSearches.map((u) => {
                        // AVATAR FALLBACK MANAGEMENT
                        const fullNameInitials = u?.fullName
                          ? getFullNameInitials(u?.fullName)
                          : "";
                        return (
                          // AVATAR & USERNAME
                          <div
                            key={u._id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowSearchPanel(false);
                              navigate(`/home/profile/${u?._id}`);
                            }}
                            className="w-full flex items-center gap-3 hover:bg-gray-100 p-3 cursor-pointer relative"
                          >
                            {/* AVATAR */}
                            <Avatar
                              className={`w-11 h-11 cursor-pointer ${
                                u?.profilePhoto === ""
                                  ? "bg-gray-300"
                                  : "bg-none"
                              }`}
                            >
                              <AvatarImage
                                src={u?.profilePhoto}
                                alt={u?.fullName}
                              />
                              <AvatarFallback>
                                {fullNameInitials}
                              </AvatarFallback>
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
                        );
                      })}
                    </section>
                  )}
                  {/* WHEN NO RESULTS FOUND */}
                  {zeroSearchResults && (
                    <section className="w-full flex flex-1 items-center justify-center">
                      <h4 className="text-sm font-semibold text-gray-500">
                        No results found
                      </h4>
                    </section>
                  )}
                  {/* RESULTS SECTION */}
                  {searchResults && (
                    <section className="w-full flex flex-1 flex-col items-start justify-start overflow-y-auto">
                      {results.map((u) => {
                        // AVATAR FALLBACK MANAGEMENT
                        const fullNameInitials = u?.fullName
                          ? getFullNameInitials(u?.fullName)
                          : "";
                        return (
                          // AVATAR & USERNAME
                          <div
                            key={u._id}
                            onClick={() => handleSelectUser(u)}
                            className="w-full flex items-center gap-3 hover:bg-gray-100 p-3 cursor-pointer"
                          >
                            {/* AVATAR */}
                            <Avatar
                              className={`w-11 h-11 cursor-pointer ${
                                u?.profilePhoto === ""
                                  ? "bg-gray-300"
                                  : "bg-none"
                              }`}
                            >
                              <AvatarImage
                                src={u?.profilePhoto}
                                alt={u?.fullName}
                              />
                              <AvatarFallback>
                                {fullNameInitials}
                              </AvatarFallback>
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
                        );
                      })}
                    </section>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* NOTIFICATIONS */}
        <div
          onClick={() => navigate(`/home/notifications`)}
          className="cursor-pointer relative"
          title="Notifications"
        >
          <Heart size={27} />
          {hasUnread && (
            <span
              title="Unread Notifications"
              className="absolute w-2.5 h-2.5 top-0 right-0 rounded-full bg-red-500"
            ></span>
          )}
        </div>
      </div>
    </section>
  );
};

export default Header;
