// <= IMPORTS =>
import axios from "axios";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { USER_API_ENDPOINT } from "@/utils/constants";
import { Loader2, LogIn, User2, X } from "lucide-react";
import INSTA_FORM from "../../assets/images/INSTAGRAM-TXT.png";

const SignUp = () => {
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
    // MAKING REQUEST
    try {
      // LOADING STATE
      setLoading(true);
      const response = await axios.post(
        `${USER_API_ENDPOINT}/register`,
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      // IF RESPONSE SUCCESS
      if (response.data.success) {
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
