// <= IMPORTS =>
import { toast } from "sonner";
import { Button } from "../ui/button";
import useTitle from "@/hooks/useTitle";
import { setUser } from "@/redux/authSlice";
import axiosClient from "@/utils/axiosClient";
import { useNavigate } from "react-router-dom";
import React, { useRef, useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import { Check, Loader2, Trash2, Upload } from "lucide-react";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const EditProfile = () => {
  // NAVIGATION
  const navigate = useNavigate();
  // DISPATCH
  const dispatch = useDispatch();
  // USE TITLE HOOK
  useTitle("Instagram - Edit Profile");
  // CURRENT USER CREDENTIALS
  const { user } = useSelector((store) => store.auth);
  // AVATAR FALLBACK MANAGEMENT
  const fullNameInitials = getFullNameInitials(user?.fullName);
  // MAX WORDS LIMIT FOR BIO
  const MAX_CHARS = 150;
  // DELETE POST DIALOG STATE
  const [avatarDialogOpen, setShowAvatarDialogOpen] = useState(false);
  // LOADING STATE FOR DELETE AVATAR
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  // SUBMIT LOADING
  const [submitLoading, setSubmitLoading] = useState(false);
  // IMAGE INPUT REF
  const imageInputRef = useRef();
  // INITIAL USER DATA REF
  const initialUserData = useRef({
    bio: user?.bio || "",
    gender: user?.gender || "",
    profilePhoto: user?.profilePhoto || "",
  });
  // STATE MANAGEMENT FOR PROFILE DATA
  const [input, setInput] = useState({
    profilePhoto: user?.profilePhoto,
    bio: user?.bio,
    gender: user?.gender,
  });
  // FILE CHANGE HANDLER
  const fileChangeHandler = (e) => {
    // FILE
    const file = e.target.files?.[0];
    // SETTING FILE IN INPUT STATE
    setInput({ ...input, profilePhoto: file });
    // CLOSING THE AVATAR DIALOG
    setShowAvatarDialogOpen(false);
  };
  // GENDER CHANGE HANDLER
  const genderChangeHandler = (value) => {
    // SETTING GENDER
    setInput({ ...input, gender: value });
  };
  // DELETE PROFILE PHOTO HANDLER
  const deleteAvatarHandler = async () => {
    // DELETE AVATAR LOADING STATE
    setDeletingAvatar(true);
    // MAKING REQUEST
    try {
      const response = await axiosClient.delete(`/user/deleteAvatar`);
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // DISPATCHING UPDATED USER IN THE AUTH SLICE
        dispatch(setUser(response.data.user));
        // TOASTING SUCCESS MESSAGE
        toast.success(response?.data?.message);
        // NAVIGATING TO PROFILE PAGE
        navigate(`/home/profile/${user?._id}`);
      }
    } catch (error) {
      // LOGGING ERROR MESSAGE
      console.error("Failed to Perform Action!", error);
      // TOASTING ERROR MESSAGE
      toast.error(error?.response?.data?.message);
      // CLOSING THE DELETE AVATAR DIALOG
      setShowAvatarDialogOpen(false);
    } finally {
      // DELETE AVATAR LOADING STATE
      setDeletingAvatar(false);
    }
  };
  // SUBMIT HANDLER
  const submitHandler = async () => {
    // SUBMIT LOADING STATE
    setSubmitLoading(true);
    // CREATING A FORM DATA INSTANCE
    const formData = new FormData();
    // APPENDING DATA TO FORM DATA OBJECT
    formData.append("bio", input.bio);
    formData.append("gender", input.gender);
    // IF PROFILE PHOTO IS PROVIDED
    if (input.profilePhoto) formData.append("file", input.profilePhoto);
    // MAKING REQUEST
    try {
      const response = await axiosClient.post(`/user/profile/edit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // DISPATCHING UPDATED USER IN THE AUTH SLICE
        dispatch(setUser(response.data.user));
        // TOASTING SUCCESS MESSAGE
        toast.success(response?.data?.message);
        // NAVIGATING TO PROFILE PAGE
        navigate(`/home/profile/${user?._id}`);
      }
    } catch (error) {
      // LOGGING ERROR MESSAGE
      console.error("Failed to Perform Action!", error);
      // TOASTING ERROR MESSAGE
      toast.error(error?.response?.data?.message);
    } finally {
      // SUBMIT LOADING STATE
      setSubmitLoading(false);
    }
  };
  // CHANGED DATA FLAG
  const isChanged = React.useMemo(() => {
    // COPY OF THE INPUT DATA
    const cleanInputData = {
      bio: input.bio,
      gender: input.gender,
      profilePhoto:
        input.profilePhoto instanceof File ? "__FILE__" : input.profilePhoto,
    };
    // COPY OF THE CLEAN INITIAL DATA
    const cleanInitialData = {
      bio: initialUserData.current.bio,
      gender: initialUserData.current.gender,
      profilePhoto:
        typeof initialUserData.current.profilePhoto === "string"
          ? initialUserData.current.profilePhoto
          : "__FILE__",
    };
    // COMPARING INPUT & INITIAL DATA TO DETECT CHANGES
    return JSON.stringify(cleanInputData) !== JSON.stringify(cleanInitialData);
  }, [input]);
  return (
    // EDIT PROFILE MAIN WRAPPER
    <div className="w-full max-[1200px]:pl-[70px] max-[768px]:pt-[75px] max-[768px]:pb-[60px] pl-[250px] flex items-center justify-center max-[768px]:px-4">
      {/* EDIT PROFILE CONTENT WRAPPER */}
      <section className="md:max-w-[70%] w-full py-6 flex flex-col items-start justify-start">
        {/* HEADING */}
        <div className="w-full text-[1.4rem] font-bold">
          <h1>Edit Profile</h1>
        </div>
        {/* AVATAR MANAGEMENT */}
        <div className="w-full flex items-center justify-between mt-12 bg-gray-100 rounded-xl p-6">
          {/* AVATAR & USERNAME */}
          <div className="flex items-center gap-3">
            {/* AVATAR */}
            <Avatar
              onClick={() => setShowAvatarDialogOpen(true)}
              className={`w-18 h-18 cursor-pointer ${
                user.profilePhoto === "" ? "bg-gray-300" : "bg-none"
              } `}
            >
              <AvatarImage src={user.profilePhoto} alt={user.fullName} />
              <AvatarFallback>{fullNameInitials}</AvatarFallback>
            </Avatar>
            {/* USERNAME */}
            <div className="flex flex-col">
              <span className="font-bold text-[1.1rem]">{user?.username}</span>
              <span className="text-gray-500 text-[1rem]">
                {user?.fullName}
              </span>
            </div>
          </div>
          {/* BUTTON */}
          <Button
            onClick={() => setShowAvatarDialogOpen(true)}
            type="button"
            className="bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none border-none text-white text-[1rem] cursor-pointer outline-none"
          >
            {user?.profilePhoto !== "" ? "Change Photo" : "Add Profile Photo"}
          </Button>
          {/* FILE INPUT */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            name="file"
            id="file"
            onChange={fileChangeHandler}
          />
        </div>
        {/* BIO MANAGEMENT */}
        <div className="w-full flex flex-col gap-3 mt-12 relative">
          <h1 className="text-[1.3rem] font-bold">Bio</h1>
          <textarea
            onChange={(e) => {
              const text = e.target.value.slice(0, MAX_CHARS);
              setInput({ ...input, bio: text });
            }}
            placeholder="Add Bio..."
            name="bio"
            id="bio"
            className="border-gray-200 border-2 outline-none focus:outline-none rounded-xl h-[7rem] w-full p-4 text-gray-500 resize-none"
            value={input.bio}
            maxLength={MAX_CHARS}
          />
          {/* BIO COUNTER */}
          <span className="absolute bottom-[0.5rem] right-[1.85rem] text-sm text-gray-500">
            {input.bio.length}/{MAX_CHARS}
          </span>
        </div>
        {/* GENDER MANAGEMENT */}
        <div className="w-full flex flex-col gap-3 mt-12">
          <h1 className="text-[1.3rem] font-bold">Gender</h1>
          <Select
            defaultValue={input.gender}
            onValueChange={genderChangeHandler}
          >
            <SelectTrigger className="text-gray-500 w-full border-gray-200 rounded-lg shadow-none outline-none focus-visible:ring-0 focus:outline-none  focus-within:ring-0 p-6 border-2">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent className="text-gray-500">
              <SelectItem className="p-4" value="MALE">
                Male
              </SelectItem>
              <SelectItem className="p-4" value="FEMALE">
                Female
              </SelectItem>
              <SelectItem className="p-4" value="OTHER">
                Other
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* SUBMIT BUTTON */}
        {isChanged && (
          <div className="w-full flex items-center justify-end mt-10">
            <Button
              onClick={submitHandler}
              type="button"
              className="bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none border-none text-white text-[1rem] cursor-pointer outline-none"
            >
              {submitLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Check size={50} />
              )}
              {submitLoading ? "Submitting Changes" : "Submit"}
            </Button>
          </div>
        )}
      </section>
      {/* AVATAR DIALOG */}
      <Dialog open={avatarDialogOpen}>
        <DialogContent className="p-0 border-none outline-none focus-visible:ring-0 focus:outline-none rounded-sm">
          {/* DIALOG CONTENT WRAPPER */}
          <div className="w-full flex flex-col items-center justify-center py-4">
            {/* HEADING */}
            <h1 className="w-full text-[1.4rem] px-2 text-center">
              Change Profile Photo
            </h1>
            {/* ACTION BUTTONS */}
            <div className="w-full flex flex-col items-center justify-center mt-6">
              {/* CHANGE PHOTO */}
              <button
                onClick={() => imageInputRef?.current.click()}
                className="w-full py-3 px-2 border-y-2 border-gray-200 text-black cursor-pointer font-[600] text-center outline-none focus:outline-none focus-visible:outline-none flex items-center justify-center gap-2"
              >
                <Upload size={25} />
                <span>Upload Photo</span>
              </button>
              {/* DELETE PHOTO */}
              {user?.profilePhoto !== "" && (
                <button
                  onClick={deleteAvatarHandler}
                  className="w-full py-3 px-2 border-b-2 border-gray-200 text-red-500 cursor-pointer font-[600] text-center outline-none focus:outline-none focus-visible:outline-none flex items-center justify-center gap-2"
                >
                  {deletingAvatar ? (
                    <Loader2 size={25} className="animate-spin" />
                  ) : (
                    <Trash2 size={25} />
                  )}
                  {deletingAvatar ? (
                    <span>Deleting Photo</span>
                  ) : (
                    <span>Delete Photo</span>
                  )}
                </button>
              )}
              {/* CANCEL */}
              <button
                onClick={() => setShowAvatarDialogOpen(false)}
                className="text-center px-2 cursor-pointer outline-none focus:outline-none focus-visible:outline-none mt-3 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditProfile;
