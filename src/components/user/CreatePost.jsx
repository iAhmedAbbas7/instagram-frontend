// <= IMPORTS =>
import { toast } from "sonner";
import { Button } from "../ui/button";
import { setPosts } from "@/redux/postSlice";
import axiosClient from "@/utils/axiosClient";
import { Dialog, DialogContent } from "../ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import { getImageDataURI } from "@/utils/getImageDataURI";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Image, Loader2, MapPin, PlusSquareIcon, X } from "lucide-react";

const CreatePost = ({ open, setOpen }) => {
  // CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // GETTING POSTS ROM POST SLICE
  const { posts } = useSelector((store) => store.post);
  // IMAGE REF
  const imageRef = useRef();
  // DISPATCH
  const dispatch = useDispatch();
  // STATE MANAGEMENT
  const [file, setFile] = useState("");
  const [query, setQuery] = useState("");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  // FETCH LOCATIONS HANDLER
  const fetchLocations = useCallback(async (q) => {
    // IF NO QUERY
    if (!q) {
      setSuggestions([]);
      return;
    }
    // MAKING REQUEST
    try {
      // SETTING URL FOR SEARCH
      const url = new URL("https://nominatim.openstreetmap.org/search");
      // SETTING URL SEARCH PARAMS
      url.search = new URLSearchParams({
        q,
        format: "json",
        addressdetails: "0",
        limit: "5",
      }).toString();
      // AWAITING RESPONSE
      const response = await fetch(url.toString(), {
        headers: {
          "User-Agent": "Instagram Clone - (iahmedabbas7@gmail.com)",
        },
      });
      // CONVERTING DATA TO JSON
      const data = await response.json();
      // SETTING SUGGESTIONS LIST
      setSuggestions(data);
    } catch (error) {
      console.error("Failed to Load Location Suggestions!", error);
    }
  }, []);
  // DEBOUNCING THE FETCH LOCATION HANDLER REQUEST
  useEffect(() => {
    const handler = setTimeout(() => fetchLocations(query), 300);
    return () => clearTimeout(handler);
  }, [query, fetchLocations]);
  // FILE CHANGE HANDLER
  const changeFileHandler = async (e) => {
    // SELECTING FILE
    const file = e.target.files?.[0];
    // IF FILE AVAILABLE
    if (file) {
      // SETTING FILE
      setFile(file);
      // GETTING FILE DATA URL
      const imageURL = await getImageDataURI(file);
      // SETTING IMAGE PREVIEW
      setImagePreview(imageURL);
    }
  };
  // CREATE POST HANDLER
  const createPostHandler = async () => {
    // CREATING FORM DATA INSTANCE
    const formData = new FormData();
    // APPENDING DATA TO FORM DATA OBJECT
    if (caption.trim()) formData.append("caption", caption);
    if (location) formData.append("location", location);
    if (file) formData.append("file", file);
    // LOADING STATE
    setLoading(true);
    // MAKING REQUEST
    try {
      const response = await axiosClient.post(`/post/addPost`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      //  IF RESPONSE SUCCESS
      if (response.data.success) {
        // DISPATCHING NEW POST TO THE PASTS ARRAY
        dispatch(setPosts([response.data.post, ...posts]));
        // TOASTING SUCCESS MESSAGE
        toast.success(response.data.message);
        // CLEARING STATE
        setFile("");
        setImagePreview("");
        setCaption("");
        setLocation("");
        // CLOSING THE POST DIALOG
        setOpen(false);
      }
    } catch (error) {
      // LOGGING ERROR MESSAGE
      console.error("Failed to Create Post!", error);
      // TOASTING ERROR MESSAGE
      toast.error(error?.response?.data?.message);
    } finally {
      // LOADING STATE
      setLoading(false);
    }
  };
  return (
    <Dialog open={open}>
      <DialogContent
        className="border-none outline-none focus:outline-none focus-visible:ring-0 rounded-md p-0 overflow-y-auto"
        onInteractOutside={() => {
          setOpen(false);
          setFile("");
          setImagePreview("");
          setCaption("");
          setLocation("");
        }}
      >
        {/* DIALOG CONTENT MAIN WRAPPER */}
        <div className="w-full h-[88vh]">
          {/* HEADER */}
          <div className="sticky overflow-hidden z-[100000] bg-white top-0 flex items-center justify-center w-full text-[1.1rem] font-[600] py-3 px-4 border-b-2 border-gray-200 rounded-t-sm">
            <h1>Create New Post</h1>
          </div>
          {/* CONTENT SECTION */}
          <div className="w-full flex flex-col items-center justify-start">
            {/* AVATAR & USERNAME */}
            <div className="w-full flex items-center gap-3 px-4 py-4">
              {/* AVATAR */}
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.profilePhoto} alt={user?.username} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              {/* USERNAME */}
              <div className="flex flex-col items-start justify-center">
                <span className="text-[1rem] font-[600]">{user?.username}</span>
                <span className="text-xs text-gray-500">{user?.fullName}</span>
              </div>
            </div>
            {/* CHOOSE IMAGE */}
            {!imagePreview && !file && (
              <div className="w-full px-4 py-3">
                <input
                  ref={imageRef}
                  type="file"
                  name="file"
                  id="file"
                  className="hidden"
                  accept="image/*"
                  onChange={changeFileHandler}
                />
                <Button
                  onClick={() => imageRef.current.click()}
                  type="button"
                  className="w-full bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer focus-visible:ring-transparent"
                >
                  <Image size={50} />
                  Choose Image from Device
                </Button>
              </div>
            )}
            {/* IMAGE PREVIEW */}
            {imagePreview && (
              <div className="w-full px-4 relative">
                {!loading && (
                  <span
                    title="Remove"
                    onClick={() => {
                      setFile("");
                      setImagePreview("");
                      setCaption("");
                    }}
                    className="rounded-full absolute top-[0.6rem] right-6 bg-gray-200 text-sky-400 cursor-pointer p-1 hover:bg-gray-100"
                  >
                    <X size={15} />
                  </span>
                )}
                <div className="flex items-center justify-center border-2 rounded-sm w-full h-full">
                  <img
                    src={imagePreview}
                    alt="Image Preview"
                    className="rounded-sm w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            {/* IMAGE CAPTION */}
            {imagePreview && file && (
              <div className="w-full px-4 py-4">
                <textarea
                  className="w-full p-2 rounded-md border-2 border-gray-200 outline-none focus:outline none text-gray-500"
                  name="caption"
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write the post caption..."
                />
              </div>
            )}
            {/* POST LOCATION */}
            {!location && imagePreview && file && (
              <div className="w-full px-4 pb-4">
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setLocation("");
                  }}
                  className="w-full p-2 rounded-md border-2 border-gray-200 outline-none focus:outline none text-gray-500"
                  placeholder="Add Location..."
                  autoComplete="off"
                  spellCheck="false"
                />
                {/* LOCATION SUGGESTION LIST */}
                {suggestions.length > 0 && (
                  <ul className="bg-white border-2 border-gray-200 w-full mt-1 max-h-50 overflow-y-auto rounded-md">
                    {suggestions.map((item, i) => (
                      <li
                        key={i}
                        onClick={() => {
                          setLocation(item.name);
                          setQuery("");
                          setSuggestions([]);
                        }}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-gray-500 text-sm font-semibold flex flex-col gap-1"
                      >
                        <span>{item.name}</span>
                        <span className="text-xs text-gray-400">
                          {item.display_name}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {/* LOCATION TAG */}
            {location && (
              <div className="w-full flex items-center px-4 pb-4 relative">
                <div className="w-full rounded-md p-2 bg-gray-100 cursor-pointer hover:bg-gray-100 flex items-center gap-1 text-sm">
                  <MapPin className="text-sky-500" />
                  <span className="text-gray-500 font-semibold">
                    {location}
                  </span>
                </div>
                <span
                  title="Remove"
                  onClick={() => {
                    setLocation("");
                  }}
                  className="rounded-full absolute right-6 bg-gray-200 text-sky-400 cursor-pointer p-1 hover:bg-gray-100"
                >
                  <X size={15} />
                </span>
              </div>
            )}
            {/* POST BUTTON */}
            {imagePreview && file && (
              <div className="w-full px-4 pb-4">
                <Button
                  disabled={loading}
                  type="submit"
                  onClick={createPostHandler}
                  className="w-full bg-sky-400 hover:bg-sky-500 font-medium cursor-pointer focus:outline-none outline-none border-none text-white text-[1rem]  focus-visible:ring-transparent"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <PlusSquareIcon size={50} />
                  )}
                  {loading ? "Creating Post" : "Create Post"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
