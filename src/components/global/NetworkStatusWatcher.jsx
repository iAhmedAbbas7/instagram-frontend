// <= IMPORTS =>
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { RefreshCcw, WifiOff } from "lucide-react";
import { Dialog, DialogContent } from "../ui/dialog";

const NetworkStatusWatcher = () => {
  // STATE MANAGEMENT
  const [isPoor, setIsPoor] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  // CONNECTIVITY CHECKING
  useEffect(() => {
    // CHECKING FOR POOR CONNECTION VIA NETWORK CONNECTION API
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    // INITIAL CONNECTION STATUS CHECK
    if (!navigator.onLine) {
      setIsOffline(true);
      console.log("Offline!");
    }
    // INITIAL CONNECTION QUALITY CHECK
    if (connection && connection.effectiveType) {
      const slowTypes = ["slow-2g", "2g"];
      setIsPoor(slowTypes.includes(connection.effectiveType));
    }
    // HANDLING OFFLINE STATUS
    const handleOffline = () => {
      setIsOffline(true);
      console.log("Offline!");
    };
    // HANDLING ONLINE STATUS
    const handleOnline = () => {
      // RESETTING ON CONNECTION ALIVE
      setIsOffline(false);
      setIsPoor(false);
      console.log("Online!");
    };
    // HANDLING QUALITY CHANGES
    let updateQuality;
    if (connection) {
      updateQuality = () => {
        const slowTypes = ["slow-2g", "2g"];
        setIsPoor(slowTypes.includes(connection.effectiveType));
      };
      connection.addEventListener("change", updateQuality);
      updateQuality();
    }
    // ADDING BROWSER EVENT LISTENERS
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    // CLEANUP FUNCTION
    return () => {
      // REMOVING BROWSER EVENT LISTENERS
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      // REMOVING CONNECTION EVENT IF APPLICABLE
      if (connection) connection.removeEventListener("change", updateQuality);
    };
  }, []);
  // RENDERING NOTHING IF CONNECTION IS FINE
  if (!isOffline && !isPoor) return null;
  // OFFLINE DIALOG
  if (isOffline) {
    return (
      <Dialog open>
        <DialogContent className="p-0 border-none outline-none focus-visible:ring-0 focus:outline-none rounded-sm">
          {/* DIALOG CONTENT WRAPPER */}
          <div className="w-full flex flex-col items-center justify-center py-8 px-4">
            {/* ICON */}
            <WifiOff size={"70px"} className="text-red-500" />
            {/* HEADING */}
            <h1 className="text-[1.75rem] font-[600]">Your&apos;e Offline</h1>
            {/* SUBTEXT */}
            <span className="text-[1rem] text-gray-500 mt-2">
              Your Internet Connection appears to be Offline
            </span>
            {/* BUTTON */}
            <Button
              onClick={() => window.location.reload()}
              type="button"
              className="w-full bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer mt-4 focus-visible:ring-0"
            >
              <RefreshCcw size={"70px"} />
              Reload
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  // POOR CONNECTION DIALOG
  if (isPoor) {
    return (
      <Dialog open>
        <DialogContent className="p-0 border-none outline-none focus-visible:ring-0 focus:outline-none rounded-sm">
          {/* DIALOG CONTENT WRAPPER */}
          <div className="w-full flex flex-col items-center justify-center py-8 px-4">
            {/* ICON */}
            <WifiOff size={"70px"} className="text-red-500" />
            {/* HEADING */}
            <h1 className="text-[1.75rem] font-[600]">Poor Connection</h1>
            {/* SUBTEXT */}
            <span className="text-[1rem] text-gray-500 mt-2">
              Your Internet Connection appears to be very Slow
            </span>
            {/* BUTTON */}
            <Button
              onClick={() => window.location.reload()}
              type="button"
              className="w-full bg-sky-400 hover:bg-sky-500 font-medium focus:outline-none outline-none border-none text-white text-[1rem] cursor-pointer mt-4 focus-visible:ring-0"
            >
              <RefreshCcw size={"70px"} />
              Reload
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
};

export default NetworkStatusWatcher;
