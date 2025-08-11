// <== IMPORTS ==>
import { toast } from "sonner";
import { useRef, useState } from "react";
import axiosClient from "@/utils/axiosClient";
import { Dialog, DialogContent } from "../ui/dialog";
import { Image, Loader2, Trash2, Upload, X } from "lucide-react";

const StoryUpload = ({ open, onClose }) => {
  // INPUT REF
  const inputRef = useRef();
  // FILES STATE
  const [files, setFiles] = useState([]);
  // UPLOADING LOADING STATE
  const [uploading, setUploading] = useState(false);
  // FILES SELECT HANDLER
  const onFilesSelected = (e) => {
    // CREATING AN ARRAY OF MAXIMUM OF 10 FILES
    const selected = Array.from(e.target.files || []).slice(0, 10);
    // SETTING FILES
    setFiles(selected);
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
  // COMPONENT'S RETURN
  return (
    <>
      {/* STORY UPLOAD MAIN WRAPPER */}
      <Dialog open={open}>
        <DialogContent
          onInteractOutside={() => onClose()}
          className="p-0 border-none outline-none focus:outline-none focus-visible:ring-0 rounded-xl min-h-[80vh] min-w-[60vw]"
        >
          {/* DIALOG CONTENT WRAPPER */}
          <div className="w-full flex flex-col items-start justify-start">
            {/* HEADER */}
            <div className="w-full flex items-center justify-between px-4 py-3 rounded-t-xl border-b-2 border-gray-200">
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
                  onChange={onFilesSelected}
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
                      onClick={() => inputRef.current.click()}
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
              <div className="w-full flex-1">
                {files.length > 0 && (
                  <>
                    {/* WHEN MEDIA IS SELECTED */}
                    <div className="w-full flex flex-col items-start justify-start gap-1">
                      {/* HEADING */}
                      <h6 className="w-full text-sm font-semibold text-gray-500">
                        Selected Media <span>({files.length}) :</span>
                      </h6>
                      {/* FILES  */}
                      <div className="w-full flex flex-col gap-1 items-start justify-start overflow-y-auto max-h-[150px]">
                        {files.map((file, i) => (
                          <div key={i} className="flex items-center gap-1">
                            {file.type.startsWith("video") ? (
                              <div>🎬</div>
                            ) : (
                              <div>🖼️</div>
                            )}
                            <span className="text-xs font-semibold text-gray-700">
                              {file.name}
                            </span>
                          </div>
                        ))}
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
                      onClick={() => {
                        setFiles([]);
                        inputRef.current.value = null;
                      }}
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
