// <= IMPORTS  =>
import { toast } from "sonner";
import { Button } from "../ui/button";
import axiosClient from "@/utils/axiosClient";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "../ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, LucideMessageSquareWarning } from "lucide-react";
import {
  clearAuthState,
  setIsLoggedIn,
  setIsLoggingOut,
} from "@/redux/authSlice";

const SessionExpiryWatcher = () => {
  // NAVIGATION
  const navigate = useNavigate();
  // DISPATCH
  const dispatch = useDispatch();
  // GETTING SESSION EXPIRED STATE FROM AUTH SLICE
  const { expired } = useSelector((store) => store.auth);
  // IF NOT EXPIRED
  if (!expired) return null;
  // LOGOUT HANDLER
  const logoutHandler = async () => {
    try {
      const response = await axiosClient.get(`/user/logout`);
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // SETTING LOGGING IN STATE IN AUTH SLICE
        dispatch(setIsLoggedIn(false));
        // SETTING LOGGING OUT STATE IN AUTH SLICE
        dispatch(setIsLoggingOut(true));
        // CLEARING AUTH STATE
        dispatch(clearAuthState());
        // NAVIGATING TO THE MAIN PAGE
        navigate("/");
        // TOASTING SUCCESS MESSAGE
        toast.success(response.data.message);
      }
    } catch (error) {
      // LOGGING ERROR IN THE CONSOLE
      console.error("Failed to Logout!", error);
      // TOASTING ERROR MESSAGE
      toast.error(error?.response?.data?.message || "Failed to Logout!");
    }
  };
  return (
    <Dialog open={expired}>
      <DialogContent className="p-0 border-none outline-none focus-visible:ring-0 focus:outline-none rounded-sm">
        {/* DIALOG CONTENT WRAPPER */}
        <div className="w-full flex flex-col items-center justify-center py-8 px-4">
          {/* ICON */}
          <LucideMessageSquareWarning size={"70px"} className="text-red-500" />
          {/* HEADING */}
          <h1 className="text-[1.75rem] font-[600]">Session Expired</h1>
          {/* SUBTEXT */}
          <span className="text-[1rem] text-gray-500 mt-2">
            Your Login Session has Expired, please Login again to Continue
          </span>
          {/* BUTTON */}
          <Button
            onClick={logoutHandler}
            type="button"
            className="w-full bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer mt-4 focus-visible:ring-0"
          >
            <LogOut size={"70px"} />
            Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionExpiryWatcher;
