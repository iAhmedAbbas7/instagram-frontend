// <= IMPORTS =>
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TXT from "../assets/images/INSTAGRAM-TXT.png";
import MICROSOFT from "../assets/images/MICROSOFT.png";
import GOOGLE_PLAY from "../assets/images/GOOGLE-PLAY.png";

const Main = () => {
  // NAVIGATION
  const navigate = useNavigate();
  return (
    <>
      {/* MAIN PAGE MAIN WRAPPER */}
      <section className="h-screen w-screen flex items-center justify-center bg-gray-50 md:px-0 px-6">
        {/* TEXT SECTION */}
        <section className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border-gray-100 border-2 gap-4 lg:w-[75%] md:w-[80%] w-full">
          {/* INSTAGRAM IMAGE */}
          <div>
            <img
              src={TXT}
              alt="Instagram"
              className="w-full h-full object-contain"
            />
          </div>
          {/* TAGLINE */}
          <div className="text-[1.1rem] text-gray-500 text-center">
            <h1>Get Started to see what&apos;s happening with your Friends</h1>
          </div>
          {/* GET STARTED BUTTON */}
          <div className="w-full">
            <Button
              onClick={() => navigate("/signup")}
              type="button"
              className="w-full bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer"
            >
              Get Started
            </Button>
          </div>
          {/* TERMS & SERVICE CONDITIONS */}
          <div className="text-sm text-gray-500 text-center">
            <h6>
              By Continuing, you agree to our{" "}
              <span className="text-sky-300 cursor-pointer">
                Terms & Conditions
              </span>
              <br /> &{" "}
              <span span className="text-sky-300 cursor-pointer">
                Cookie Policy
              </span>
            </h6>
          </div>
          {/* GET APP SECTION */}
          <section className="flex flex-col items-center justify-center p-4 bg-white border-gray-100 border-t-2 w-full gap-4 relative mt-4">
            {/* OR */}
            <span className="flex items-center justify-center absolute top-[-1rem] bg-white z-[999] overflow-hidden w-[8rem] h-[1.85rem] text-gray-500">
              <span>OR</span>
            </span>
            {/* TAGLINE */}
            <div className="text-[1rem] text-gray-500 mt-2">
              <h5>Get our Official App</h5>
            </div>
            {/* APP LINKS */}
            <div className="w-full flex items-center justify-center gap-4">
              <img
                src={GOOGLE_PLAY}
                alt="Google Play Store"
                className="w-[134px] h-[40px] rounded-md cursor-pointer"
              />
              <img
                src={MICROSOFT}
                alt="Microsoft Store"
                className="w-[111px] h-[40px] rounded-md cursor-pointer"
              />
            </div>
          </section>
        </section>
      </section>
    </>
  );
};

export default Main;
