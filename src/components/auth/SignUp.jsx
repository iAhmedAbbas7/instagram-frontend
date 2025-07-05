// <= IMPORTS =>
import { toast } from "sonner";
import { Button } from "../ui/button";
import debounce from "lodash.debounce";
import useTitle from "@/hooks/useTitle";
import axiosClient from "@/utils/axiosClient";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import INSTA_FORM from "../../assets/images/INSTAGRAM-TXT.png";
import { CheckCircle2, Loader2, LogIn, User2, X, XCircle } from "lucide-react";

const SignUp = () => {
  // USE TITLE HOOK
  useTitle("Instagram - Sign Up");
  // NAVIGATION
  const navigate = useNavigate();
  // LOADING STATE
  const [loading, setLoading] = useState(false);
  // STATE MANAGEMENT
  const [input, setInput] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  // USERNAME AVAILABILITY STATE
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  // USERNAME AVAILABILITY LOADING STATE
  const [checkingUsername, setCheckingUsername] = useState(false);
  // USERNAME AVAILABILITY DEBOUNCED CHECK
  const checkUsername = useMemo(
    () =>
      debounce(async (username) => {
        try {
          const response = await axiosClient.get(
            `/user/checkUsername?username=${username}`
          );
          // SETTING USERNAME AVAILABILITY BASED ON RESPONSE RETURNED
          setUsernameAvailable(response.data.available);
        } catch {
          // SETTING USERNAME AVAILABILITY TO NULL ON ERROR
          setUsernameAvailable(null);
        } finally {
          // LOADING STATE
          setCheckingUsername(false);
        }
      }, 500),
    []
  );
  // EFFECT TO CHECK USERNAME AVAILABILITY
  useEffect(() => {
    // USERNAME
    const username = input.username.trim();
    // IF NO USERNAME
    if (!username) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      return;
    }
    setCheckingUsername(true);
    checkUsername(username);
  }, [checkUsername, input.username]);
  // CLEANUP EFFECT ON COMPONENT UNMOUNT
  useEffect(() => checkUsername.cancel(), [checkUsername]);
  // CHANGE EVENT HANDLER
  const changeEventHandler = (e) => {
    // UPDATING THE STATE
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  // SIGN UP HANDLER
  const signUpHandler = async (e) => {
    // PREVENTING PAGE REFRESH
    e.preventDefault();
    // DATA VALIDATION
    if (!input.fullName || !input.username || !input.email || !input.password) {
      toast.error("All Fields are Required!");
      return;
    }
    // IF USERNAME IS NOT AVAILABLE
    if (usernameAvailable === false) {
      toast.error("This Username is already Taken!");
    }
    // MAKING REQUEST
    try {
      // LOADING STATE
      setLoading(true);
      const response = await axiosClient.post(`/user/register`, input, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      // IF RESPONSE SUCCESS
      if (response.data.success) {
        // NAVIGATING TO LOGIN PAGE
        navigate("/login");
        // TOASTING SUCCESS MESSAGE
        toast.success(
          response?.data?.message ||
            `User ${input.fullName} Registered Successfully`
        );
        // RESETTING THE FORM
        setInput({
          fullName: "",
          username: "",
          email: "",
          password: "",
        });
      }
    } catch (error) {
      // LOGGING ERROR MESSAGE
      console.error(error);
      // TOASTING ERROR MESSAGE
      toast.error(
        error?.response?.data?.message || "Failed to Perform Action!"
      );
    } finally {
      // LOADING STATE
      setLoading(false);
    }
  };
  return (
    // <= SIGN UP COMPONENT =>
    <section className="flex items-center justify-center bg-gray-50 overflow-y-auto overflow-x-hidden">
      {/* SIGN UP MAIN WRAPPER */}
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
          {/* TAGLINE */}
          <div className="text-[1.1rem] text-gray-500 text-center">
            <h1>SignUp to see Photos and Videos of your Friends</h1>
          </div>
          {/* FORM ELEMENT */}
          <form
            onSubmit={signUpHandler}
            className="flex flex-col items-center justify-center gap-4 w-full mt-2"
          >
            {/* FULLNAME */}
            <div className="w-full relative">
              <input
                id="fullName"
                name="fullName"
                value={input.fullName}
                onChange={changeEventHandler}
                type="text"
                placeholder="FullName"
                className="w-full border-2 border-gray-200 outline-none focus:outline-none rounded-md bg px-4 py-2 text-gray-500 capitalize"
                spellCheck="false"
                autoComplete="off"
                autoCorrect="off"
              />
              {/* INPUT CLEAR BUTTON */}
              {input.fullName !== "" && (
                <span
                  title="Clear Field"
                  onClick={() => setInput({ ...input, fullName: "" })}
                  className="rounded-full absolute top-[0.6rem] right-2 bg-gray-200 text-sky-400 cursor-pointer p-1 hover:bg-gray-100"
                >
                  <X size={15} />
                </span>
              )}
            </div>
            {/* USERNAME */}
            <div className="w-full relative">
              <input
                id="username"
                name="username"
                value={input.username}
                onChange={changeEventHandler}
                type="text"
                placeholder="Username"
                className="w-full border-2 border-gray-200 outline-none focus:outline-none rounded-md bg px-4 py-2 text-gray-500"
                spellCheck="false"
                autoComplete="off"
                autoCorrect="off"
              />
              {/* INPUT CLEAR BUTTON */}
              {input.username !== "" && (
                <span
                  title="Clear Field"
                  onClick={() => setInput({ ...input, username: "" })}
                  className="rounded-full absolute top-[0.6rem] right-2 bg-gray-200 text-sky-400 cursor-pointer p-1 hover:bg-gray-100"
                >
                  <X size={15} />
                </span>
              )}
              {/* USERNAME CHECK */}
              {checkingUsername && (
                <div className="mt-4 p-1 flex items-center gap-2 bg-gray-200 rounded-sm w-full">
                  <span>
                    <Loader2 size={15} className="animate-spin text-gray-700" />
                  </span>
                  <span className="text-sm  text-gray-700 animate-pulse">
                    Checking Username{" "}
                    <span className="font-semibold">
                      &quot;{input.username}&quot;
                    </span>
                  </span>
                </div>
              )}
              {/* USERNAME AVAILABLE */}
              {!checkingUsername && usernameAvailable === true && (
                <div className="flex p-1 mt-4 bg-green-200 items-center gap-2 text-sm text-green-700 rounded-sm">
                  <span>
                    <CheckCircle2 size={15} />
                  </span>
                  <span>
                    Username{" "}
                    <span className="font-semibold">
                      &quot;{input.username}&quot;
                    </span>{" "}
                    is Available
                  </span>
                </div>
              )}
              {!checkingUsername && usernameAvailable === false && (
                <div className="flex p-1 mt-4 items-center gap-2 bg-red-200 rounded-sm text-sm text-red-700">
                  <span>
                    <XCircle size={15} />
                  </span>
                  <span>
                    Username{" "}
                    <span className="font-semibold">
                      &quot;{input.username}&quot;
                    </span>{" "}
                    is not Available
                  </span>
                </div>
              )}
            </div>
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
            {/* SIGN UP BUTTON */}
            <div className="w-full">
              <Button
                type="submit"
                className="w-full bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer"
              >
                {loading ? (
                  <Loader2 size={50} className="animate-spin" />
                ) : (
                  <User2 size={50} />
                )}
                {loading ? "Registering" : "Sign Up"}
              </Button>
            </div>
          </form>
        </section>
        {/* LOGIN SECTION */}
        <section className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border-gray-100 border-2 md:w-[600px] w-full gap-4">
          {/* LOGIN TAGLINE */}
          <div className="text-[1rem] text-gray-500">
            <h5>Already have an Account ?</h5>
          </div>
          {/* LOGIN LINK */}
          <div className="w-full">
            <Button
              onClick={() => navigate("/login")}
              type="button"
              className="w-full bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer"
            >
              <LogIn size={50} />
              Login
            </Button>
          </div>
        </section>
      </section>
    </section>
  );
};

export default SignUp;
