// <= IMPORTS =>
import { Heart, Search, X } from "lucide-react";
import INSTAGRAM from "../../assets/images/INSTAGRAM-TXT.png";

const Header = () => {
  return (
    // HEADER MAIN WRAPPER
    <section className="bg-white hidden max-[768px]:flex items-center justify-between px-6 h-[70px] fixed top-0 w-full overflow-hidden z-[999999]">
      {/* LEFT SECTION */}
      <div className="flex items-center justify-center">
        <img src={INSTAGRAM} alt="Logo" className="h-9 cursor-pointer" />
      </div>
      {/* RIGHT SECTION */}
      <div className="flex items-center justify-center gap-4">
        {/* SEARCH INPUT */}
        <div className="relative flex items-center justify-center">
          <input
            type="text"
            className="bg-gray-100 border-none outline-none focus:outline-none rounded-md pl-11 pr-3 py-1.5 text-gray-500 placeholder:text-gray-500"
            placeholder="Search"
          />
          <span className="left-3 absolute">
            <Search className="text-gray-500" />
          </span>
          <span className="absolute right-2 p-1 rounded-full flex items-center justify-center bg-gray-200">
            <X size={13} className="text-gray-500" />
          </span>
        </div>
        {/* NOTIFICATIONS */}
        <div className="cursor-pointer" title="Notifications">
          <Heart size={27} />
        </div>
      </div>
    </section>
  );
};

export default Header;
