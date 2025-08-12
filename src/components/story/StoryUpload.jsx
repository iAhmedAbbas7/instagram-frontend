// <== IMPORTS ==>
import { toast } from "sonner";
import axiosClient from "@/utils/axiosClient";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { getImageDataURI } from "@/utils/getImageDataURI";
import { Image, Loader2, Plus, Trash2, Upload, X } from "lucide-react";

const StoryUpload = ({ open, onClose }) => {
  // INPUT REF
  const inputRef = useRef();
  // FILES STATE
  const [files, setFiles] = useState([]);
  // FILES PREVIEWS STATE
  const [previews, setPreviews] = useState([]);
  // UPLOADING LOADING STATE
  const [uploading, setUploading] = useState(false);
  // MEDIA PREVIEWS REF
  const mediaPreviewsRef = useRef([]);
  // CLEANUP CREATED OBJECT URL'S ON UNMOUNT
  useEffect(() => {
    // SNAPSHOT OF CURRENT MEDIA PREVIEWS
    const currentMediaPreviews = mediaPreviewsRef.current;
    // CLEANUP
    return () => {
      // IF CREATED PREVIEWS EXIST
      (currentMediaPreviews || []).forEach((pre) => {
        if (pre && pre._objectURLCreated) {
          try {
            URL.revokeObjectURL(pre.url);
          } catch (e) {
            console.error(e);
          }
        }
      });
    };
  }, []);
  // OPEN FILE PICKER HELPER
  const openFilePicker = () => {
    // IF NO INPUT REF CURRENT
    if (!inputRef.current) return;
    // OPENING THE FILE PICKER
    inputRef.current.click();
  };
  // HELPER TO CLEAR RELATED SECTIONS
  const clearAllSections = () => {
    // REMOVING CRATED URL'S FOR MEDIA
    try {
      (mediaPreviewsRef.current || []).forEach((p) => {
        if (p && p._objectURLCreated) {
          try {
            URL.revokeObjectURL(p.url);
          } catch (e) {
            console.error(e);
          }
        }
      });
    } catch (e) {
      console.error(e);
    }
    // CLEARING FILES
    setFiles([]);
    // CLEARING PREVIEWS STATE & REF
    setPreviewsAndRef([]);
    // CLEARING INPUT
    if (inputRef.current) inputRef.current.value = null;
  };
  // REMOVE SELECTED FILE HANDLER
  const removeSelected = (index) => {
    // UPDATING THE PREVIEWS AND REF
    setPreviewsAndRef((prev) => {
      // THE ITEM TO BE REMOVED
      const itemToRemove = prev[index];
      // IF ITEM FOUND & HAS AN URL PREVIEW CREATED
      if (itemToRemove && itemToRemove._objectURLCreated) {
        // REVOKING THE CREATED URL TO FREE MEMORY
        try {
          URL.revokeObjectURL(itemToRemove.url);
        } catch (e) {
          console.error(e);
        }
      }
      // RETURNING THE UPDATED VALUES
      return prev.filter((_, i) => i !== index);
    });
    // UPDATING THE SELECTED FILES STATE AS WELL
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };
  // HELPER TO UPDATE BOTH STATE & REF
  const setPreviewsAndRef = (updater) => {
    setPreviews((prev) => {
      // SETTING NEXT VALUE
      const nextValue = typeof updater === "function" ? updater(prev) : updater;
      // UPDATING REFS
      mediaPreviewsRef.current = nextValue;
      // RETURNING NEXT VALUE
      return nextValue;
    });
  };
  // UPLOAD STORY HANDLER
  const uploadStroyHandler = async () => {
    // IF NO FILES SELECTED
    if (!files || files.length === 0) return;
    // UPLOADING LOADING STATE
    setUploading(true);
    try {
      // CREATING FORM DATA INSTANCE FOR FILES
      const formData = new FormData();
      // APPENDING FILES TO FORM DATA
      files.forEach((file) => formData.append("files", file, file.name));
      // MAKING REQUEST
      const response = await axiosClient.post(`/story/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // IF RESPONSE SUCCESS
      if (response && response.data.success) {
        // CLEARING RELATED SECTIONS
        clearAllSections();
        // CLOSING THE UPLOAD MODAL
        if (onClose) onClose();
        // TOASTING SUCCESS MESSAGE
        toast.success(response.data.message || "Story Posted Successfully!");
      } else {
        // LOGGING ERROR MESSAGE
        console.error("Story Upload Failed!", response.data);
        // TOASTING ERROR MESSAGE
        toast.error("Story Upload Failed!");
      }
    } catch (error) {
      // LOGGING ERROR MESSAGE
      console.error("Story Upload Failed!", error);
      // TOASTING ERROR MESSAGE
      toast.error(error?.response?.data?.message || "Story Upload Failed!");
    } finally {
      // UPLOADING LOADING STATE
      setUploading(false);
    }
  };
  // HELPER FUNCTION TO BUILD SELECTED MEDIA PREVIEWS
  const buildMediaPreviews = async (fileList) => {
    // INITIATING AN ARRAY
    const mediaArray = [];
    // LOOPING OVER EACH FILE
    for (const file of fileList) {
      try {
        // VIDEO MEDIA TYPE FLAG
        const isVideo = file?.type?.startsWith("video");
        // IF MEDIA IS OF VIDEO TYPE
        if (isVideo) {
          // CONSTRUCTING URL
          const url = URL.createObjectURL(file);
          // ADDING THE THE MEDIA ARRAY
          mediaArray.push({
            id: `${file.name}_${file.lastModified}`,
            file: file,
            url,
            type: "VIDEO",
            _objectURLCreated: true,
          });
        } else {
          try {
            // FOR IMAGE GETTING MEDIA DATA URI
            const dataURI = await getImageDataURI(file);
            // CONSTRUCTING URL FROM STRING RETURNED BY THE DATA URI
            const url =
              typeof dataURI === "string"
                ? dataURI
                : dataURI?.content || URL.createObjectURL(file);
            // URL CREATED CHECK FLAG
            const urlCreated = url.startsWith("blob:");
            // PUSHING TO THE MEDIA ARRAY
            mediaArray.push({
              id: `${file.name}_${file.lastModified}`,
              file: file,
              url,
              type: "IMAGE",
              _objectURLCreated: urlCreated,
            });
          } catch {
            // FALLBACK
            const url = URL.createObjectURL(file);
            // PUSHING TO THE MEDIA ARRAY
            mediaArray.push({
              id: `${file.name}_${file.lastModified}`,
              file: file,
              url,
              type: "IMAGE",
              _objectURLCreated: true,
            });
          }
        }
      } catch {
        // SAFETY FALLBACK FOR UNEXPECTED FILES
        const url = URL.createObjectURL(file);
        // VIDEO MEDIA TYPE FLAG
        const isVideo = file?.type?.startsWith("video");
        // ADDING THE THE MEDIA ARRAY
        mediaArray.push({
          id: `${file.name}_${file.lastModified}`,
          file: file,
          url,
          type: isVideo ? "VIDEO" : "IMAGE",
          _objectURLCreated: true,
        });
      }
    }
    // RETURNING MEDIA ARRAY
    return mediaArray;
  };
  // FILES SELECT HANDLER
  const onMediaFilesSelected = async (inputEvent) => {
    // CREATING AN ARRAY OF MAXIMUM OF 10 FILES
    const selected = Array.from(inputEvent.target.files || []);
    // IF NO FILES SELECTED
    if (!selected || selected.length === 0) return;
    // MERGING FILES WITH PRESERVING ORDER AND SLICING TO 10
    const mergedFiles = [...files, ...selected].slice(0, 10);
    // SETTING FILES
    setFiles(mergedFiles);
    // SETTING NEW FILES
    const newFiles = mergedFiles.filter(
      (f) =>
        !previews.some(
          (p) =>
            p.file &&
            p.file.name === f.name &&
            p.file.lastModified === f.lastModified
        )
    );
    // BUILDING NEW PREVIEWS
    const newPreviews = await buildMediaPreviews(newFiles);
    // SETTING PREVIEWS & UPDATING PREVIEWS REF
    setPreviewsAndRef((prev) => {
      // KEEPING EXISTING PREVIEWS AND NEW ONES
      const combinedPreviews = [...prev, ...newPreviews].slice(0, 10);
      // RETURNING COMBINED PREVIEWS
      return combinedPreviews;
    });
    // RESETTING INPUT
    if (inputRef.current) inputRef.current.value = null;
  };
  // COMPONENT'S RETURN
  return (
    <>
      {/* STORY UPLOAD MAIN WRAPPER */}
      <Dialog open={open}>
        <DialogContent
          onInteractOutside={() => onClose()}
          className="p-0 border-none outline-none focus:outline-none focus-visible:ring-0 rounded-xl h-auto min-h-[80vh] min-w-[80vw]"
        >
          {/* DIALOG CONTENT WRAPPER */}
          <div className="w-full flex flex-col items-start justify-start">
            {/* HEADER */}
            <div className="w-full flex items-center justify-between px-4 py-3 rounded-t-xl border-b-2 border-gray-200 bg-white z-10 overflow-hidden">
              {/* TEXT */}
              <h5 className="text-[1rem] font-semibold">Upload Story</h5>
              {/* CLOSE BUTTON */}
              <span
                title="Close"
                onClick={() => onClose()}
                className="cursor-pointer"
              >
                <X size={25} className="hover:text-gray-500" />
              </span>
            </div>
            {/* CONTENT AREA */}
            <div className="w-full flex flex-col items-start justify-between flex-1 gap-2 p-4">
              {/* FILE INPUT */}
              <div className="hidden">
                <input
                  ref={inputRef}
                  type="file"
                  name="file"
                  id="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={onMediaFilesSelected}
                  disabled={uploading}
                  className="hidden"
                />
              </div>
              {/* FILE INPUT TRIGGER */}
              <div
                className={`w-full ${
                  files.length !== 0 && "hidden"
                } flex flex-col items-start justify-start gap-1`}
              >
                {files.length === 0 && (
                  <>
                    {/* BUTTON */}
                    <button
                      onClick={openFilePicker}
                      className="border-none outline-none focus:outline-none px-3 py-2 text-white bg-sky-400 hover:bg-sky-500 font-semibold rounded-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Choose Media</span>
                      <span>
                        <Image />
                      </span>
                    </button>
                  </>
                )}
              </div>
              {/* SELECTED MEDIA */}
              <div className="w-full flex-1 flex flex-col items-start justify-start">
                {previews.length > 0 && (
                  <>
                    {/* HEADING */}
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm font-semibold text-gray-500">
                        <Image size={20} />
                        <h6>Selected Media</h6>
                      </div>
                      <span className="italic text-xs text-gray-500">
                        Max 10
                      </span>
                    </div>
                    {/* THUMBNAILS SECTION WRAPPER */}
                    <div className="w-full mt-2">
                      {/* THUMBNAILS SECTION SCROLL CONTAINER */}
                      <div className="max-h-[60vh] overflow-y-auto py-2">
                        {/* THUMBNAILS SECTION CONTENT CONTAINER */}
                        <div className="flex flex-wrap gap-2">
                          {/* PREVIEWS */}
                          {previews.map((p, i) => (
                            <div key={p.id} className="relative w-40 h-40">
                              {/* PREVIEW MEDIA SECTION */}
                              <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-lg border border-gray-200">
                                {p.type === "VIDEO" ? (
                                  <video
                                    src={p.url}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <img
                                    src={p.url}
                                    alt={p.file.name}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                )}
                              </div>
                              {/* REMOVE BUTTON */}
                              <button
                                title="Remove"
                                onClick={() => removeSelected(i)}
                                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center bg-gray-500 cursor-pointer text-white"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))}
                          {/* ADD MORE BUTTON */}
                          {previews.length < 10 && (
                            <div
                              onClick={openFilePicker}
                              className="w-40 h-40 flex-shrink-0 flex items-center justify-center rounded-lg border-dashed border-2 border-gray-500 cursor-pointer"
                            >
                              <div className="flex flex-col items-center justify-center gap-1 ">
                                <Plus size={30} className="text-gray-500" />
                                <span className="text-sm text-gray-500 font-semibold">
                                  Add More
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {/* UPLOAD STORY & CLEAR BUTTON */}
              <div className="w-full mb-0 flex items-center justify-end gap-2">
                {files && files.length > 0 && (
                  <>
                    {/* UPLOAD STORY */}
                    <button
                      onClick={uploadStroyHandler}
                      disabled={uploading}
                      className="border-none outline-none focus:outline-none px-3 py-2 text-white bg-sky-400 hover:bg-sky-500 font-semibold rounded-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{uploading ? "Uploading" : "Upload"}</span>
                      <span>
                        {uploading ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Upload />
                        )}
                      </span>
                    </button>
                    {/* CLEAR FILES */}
                    <button
                      onClick={clearAllSections}
                      disabled={uploading}
                      className="border-none outline-none focus:outline-none px-3 py-2 text-white bg-sky-400 hover:bg-sky-500 font-semibold rounded-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Discard</span>
                      <span>
                        <Trash2 />
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StoryUpload;
