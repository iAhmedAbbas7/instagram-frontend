// <= IMPORTS =>
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "../ui/button";
import useTitle from "@/hooks/useTitle";
import { useDispatch } from "react-redux";
import axiosClient from "@/utils/axiosClient";
import { useNavigate } from "react-router-dom";
import { Loader2, LogIn, User2, X } from "lucide-react";
import INSTA_FORM from "../../assets/images/INSTAGRAM-TXT.png";
import { setIsLoggedIn, setIsLoggingOut, setUser } from "@/redux/authSlice";

const Login = () => {
  // USE TITLE HOOK
  useTitle("Instagram - Login");
  // NAVIGATION
  const navigate = useNavigate();
  // DISPATCH
  const dispatch = useDispatch();
  // LOADING STATE
  const [loading, setLoading] = useState(false);
  // STATE MANAGEMENT
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  // CHANGE EVENT HANDLER
  const changeEventHandler = (e) => {
    // UPDATING THE STATE
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  // LOGIN HANDLER
  const loginHandler = async (e) => {
    // PREVENTING PAGE REFRESH
    e.preventDefault();
    // DATA VALIDATION
    if (!input.email || !input.password) {
      toast.error("All Fields are Required!");
      return;
    }
    // MAKING REQUEST
    try {
      // LOADING STATE
      setLoading(true);
      const response = await axiosClient.post(`/user/login`, input, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // SETTING LOGGING IN STATE IN AUTH SLICE
        dispatch(setIsLoggedIn(true));
        // SETTING LOGGING OUT STATE IN AUTH SLICE
        dispatch(setIsLoggingOut(false));
        // SETTING USER IN THE AUTH STATE
        dispatch(setUser(response.data.user));
        // NAVIGATING TO HOMEPAGE
        navigate("/home");
        // TOASTING SUCCESS MESSAGE
        toast.success(response?.data?.message);
        // RESETTING THE FORM
        setInput({
          email: "",
          password: "",
        });
      }
    } catch (error) {
      // LOGGING ERROR MESSAGE
      console.error(error);
      // TOASTING ERROR MESSAGE
      toast.error(error?.response?.data?.message || "Failed to Login!");
    } finally {
      // LOADING STATE
      setLoading(false);
    }
  };
  return (
    // <= LOGIN COMPONENT =>
    <section className="flex items-center justify-center bg-gray-50 overflow-y-auto overflow-x-hidden">
      {/* LOGIN MAIN WRAPPER */}
      <section className="h-screen w-screen flex flex-col items-center justify-center gap-6 bg-gray-50 tracking-wide md:px-0 px-6 md:my-0 my-10">
        {/* FORM SECTION */}
        <section className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border-gray-100 border-2 md:w-[600px] w-full gap-4">
          {/* INSTAGRAM IMAGE */}
          <div>
            <img
              src={INSTA_FORM}
              alt="Instagram"
              className="w-full h-full object-contain"
            />
          </div>
          {/* FORM ELEMENT */}
          <form
            onSubmit={loginHandler}
            className="flex flex-col items-center justify-center gap-4 w-full mt-2"
          >
            {/* EMAIL */}
            <div className="w-full relative">
              <input
                id="email"
                name="email"
                value={input.email}
                onChange={changeEventHandler}
                type="text"
                placeholder="Email"
                className="w-full border-2 border-gray-200 outline-none focus:outline-none rounded-md bg px-4 py-2 text-gray-500"
                spellCheck="false"
                autoComplete="off"
                autoCorrect="off"
              />
              {/* INPUT CLEAR BUTTON */}
              {input.email !== "" && (
                <span
                  title="Clear Field"
                  onClick={() => setInput({ ...input, email: "" })}
                  className="rounded-full absolute top-[0.6rem] right-2 bg-gray-200 text-sky-400 cursor-pointer p-1 hover:bg-gray-100"
                >
                  <X size={15} />
                </span>
              )}
            </div>
            {/* PASSWORD */}
            <div className="w-full relative">
              <input
                id="password"
                name="password"
                value={input.password}
                onChange={changeEventHandler}
                type="password"
                placeholder="Password"
                className="w-full border-2 border-gray-200 outline-none focus:outline-none rounded-md bg px-4 py-2 text-gray-500"
              />
              {/* INPUT CLEAR BUTTON */}
              {input.password !== "" && (
                <span
                  title="Clear Field"
                  onClick={() => setInput({ ...input, password: "" })}
                  className="rounded-full absolute top-[0.6rem] right-2 bg-gray-200 text-sky-400 cursor-pointer p-1 hover:bg-gray-100"
                >
                  <X size={15} />
                </span>
              )}
            </div>
            {/* LOGIN BUTTON */}
            <div className="w-full">
              <Button
                type="submit"
                className="w-full bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer"
              >
                {loading ? (
                  <Loader2 size={50} className="animate-spin" />
                ) : (
                  <LogIn size={50} />
                )}
                {loading ? "Logging In" : "Login"}
              </Button>
            </div>
          </form>
        </section>
        {/* SIGN UP SECTION */}
        <section className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border-gray-100 border-2 md:w-[600px] w-full gap-4">
          {/* SIGN UP TAGLINE */}
          <div className="text-[1rem] text-gray-500">
            <h5>Don&apos;t have an Account ?</h5>
          </div>
          {/* SIGN UP LINK */}
          <div className="w-full">
            <Button
              onClick={() => navigate("/signup")}
              type="button"
              className="w-full bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer"
            >
              <User2 size={50} />
              Sign Up
            </Button>
          </div>
        </section>
      </section>
    </section>
  );
};

export default Login;
