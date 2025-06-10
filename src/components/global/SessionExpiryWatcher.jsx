// <= IMPORTS  =>
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { clearAuthState } from "@/redux/authSlice";
import { Dialog, DialogContent } from "../ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import { LogIn, LucideMessageSquareWarning } from "lucide-react";

const SessionExpiryWatcher = () => {
  // NAVIGATION
  const navigate = useNavigate();
  // DISPATCH
  const dispatch = useDispatch();
  // GETTING SESSION EXPIRED STATE FROM AUTH SLICE
  const { expired } = useSelector((store) => store.auth);
  // IF NOT EXPIRED
  if (!expired) return null;
  // LOGIN HANDLER
  const handleLogin = () => {
    dispatch(clearAuthState());
    navigate("/login");
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
            onClick={handleLogin}
            type="button"
            className="w-full bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer mt-4 focus-visible:ring-0"
          >
            <LogIn size={"70px"} />
            Login
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionExpiryWatcher;
