// <= IMPORTS =>
import { useEffect, useRef } from "react";
import { BellOffIcon, Trash2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { format, isAfter, isToday, subDays } from "date-fns";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  clearAllNotifications,
  removeNotification,
} from "@/redux/notificationSlice";

const NotificationSidebar = ({ isOpen, onClose, offset, justOpened }) => {
  // DISPATCH
  const dispatch = useDispatch();
  // NOTIFICATION SIDEBAR CONTAINER REF
  const notificationSidebarRef = useRef();
  // SETTING THE IGNORE CLICK REF
  const ignoreClick = useRef(false);
  // CLICK OUTSIDE HANDLER
  useEffect(() => {
    // JUST OPENED STATE PASSED THROUGH THE LEFT SIDEBAR ON NOTIFICATION ICON CLICK
    ignoreClick.current = !!justOpened;
    // IF CLICKED OUTSIDE THE CONTAINER
    const handleClick = (e) => {
      // IF CLICKED FOR THE FIRST TIME THEN
      if (ignoreClick.current) {
        ignoreClick.current = false;
        return;
      }
      if (
        notificationSidebarRef.current &&
        !notificationSidebarRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    // ON OPEN STATE
    if (isOpen) {
      // ADDING EVENT LISTENER
      document.addEventListener("click", handleClick);
    }
    // CLEANUP FUNCTION
    return () => {
      // REMOVING EVENT LISTENER
      document.removeEventListener("click", handleClick);
    };
  }, [isOpen, onClose, justOpened]);
  // GETTING ALL NOTIFICATIONS FROM NOTIFICATION SLICE
  const { likeNotifications, commentNotifications, followNotifications } =
    useSelector((store) => store.notification);
  // FLATTENING THE NOTIFICATIONS AND SORTING THEM BY CREATED AT
  const allNotifications = [
    ...likeNotifications,
    ...commentNotifications,
    ...followNotifications,
  ]
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  // CREATING BUCKETS OF TIMESPAN FOR THE NOTIFICATIONS
  const TODAY = [];
  const LAST_7_DAYS = [];
  const LAST_30_DAYS = [];
  const OLDER = [];
  // CREATING TIMESPAN BUCKETS FOR COMPARISON
  const today = new Date();
  const weekAgo = subDays(today, 7);
  const monthAgo = subDays(today, 30);
  // ITERATING THROUGH ALL NOTIFICATIONS TO BUCKET THEM
  allNotifications.forEach((n) => {
    // GETTING THE CREATED AT DATE OF EACH NOTIFICATION
    const when = new Date(n.createdAt);
    // CHECKING IF THE NOTIFICATION IS TODAY
    if (isToday(when)) {
      TODAY.push(n);
    } // CHECKING IF THE NOTIFICATION IS IN LAST 7 DAYS
    else if (isAfter(when, weekAgo)) {
      LAST_7_DAYS.push(n);
    } // CHECKING IF THE NOTIFICATION IS IN LAST 30 DAYS
    else if (isAfter(when, monthAgo)) {
      LAST_30_DAYS.push(n);
    } // ELSE IT IS OLDER THAN 30 DAYS
    else {
      OLDER.push(n);
    }
  });
  // RENDERING BUCKETS OF NOTIFICATIONS
  const renderBuckets = (label, arr) => {
    // IF THE ARRAY IS EMPTY THEN RETURN NOTHING
    if (!arr.length) return;
    // RETURNING THE BUCKET
    return (
      <section className="w-full mb-4">
        {/* BUCKET HEADING */}
        <h4 className="px-4 py-2 text-[1.2rem] font-semibold">{label}</h4>
        {/* NOTIFICATIONS LIST */}
        <ul className="w-full flex flex-col items-start justify-start">
          {arr.map((n, i) => {
            // ACTING USER OF THE NOTIFICATION
            const actingUser =
              n.likingUser ||
              n.dislikingUser ||
              n.commentingUser ||
              n.followingUser;
            // AVATAR FALLBACK MANAGEMENT
            const fullNameInitials = actingUser?.fullName
              ? getFullNameInitials(actingUser?.fullName)
              : "";
            return (
              <>
                {/* AVATAR & MESSAGE */}
                <li
                  key={`${n.type}-${i}-${n.createdAt}`}
                  className="w-full flex items-center gap-4 hover:bg-gray-100 pt-3 pb-3 pl-3 pr-8 cursor-pointer relative"
                >
                  {/* AVATAR */}
                  <Avatar
                    className={`w-11 h-11 cursor-pointer ${
                      actingUser?.profilePhoto === ""
                        ? "bg-gray-300"
                        : "bg-none"
                    } `}
                  >
                    <AvatarImage
                      src={actingUser?.profilePhoto}
                      alt={actingUser?.fullName}
                    />
                    <AvatarFallback>{fullNameInitials}</AvatarFallback>
                  </Avatar>
                  {/* MESSAGE & TIME */}
                  <div className="flex flex-col items-start justify-center">
                    <span className="text-[0.9rem] font-semibold">
                      {n.message}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      {format(new Date(n.createdAt), "PPpp")}
                    </span>
                  </div>
                  {/* CLEAR BUTTON */}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(
                        removeNotification({
                          category: n.type,
                          createdAt: n.createdAt,
                        })
                      );
                    }}
                    title="Delete"
                    className="absolute right-4"
                  >
                    <X size={25} className="text-gray-500" />
                  </span>
                </li>
              </>
            );
          })}
        </ul>
      </section>
    );
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          style={{ left: offset }}
          className="fixed top-0 h-full w-[350px] bg-white rounded-r-lg z-[10] overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.4)]"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "tween", duration: 0.5 }}
          ref={notificationSidebarRef}
        >
          {/* MAIN NOTIFICATION CONTAINER */}
          <section className="flex flex-col items-start justify-start w-full h-full pt-5">
            {/* HEADING & CLEAR BUTTON */}
            <div className="py-4 px-4 w-full flex items-center justify-between border-b-2 border-gray-200">
              <h1 className="w-full text-[1.5rem] font-semibold">
                Notifications
              </h1>
              {/* IN NOTIFICATIONS EXIST */}
              {allNotifications.length > 0 && (
                <span
                  title="Clear All"
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(clearAllNotifications());
                  }}
                >
                  <Trash2
                    size={20}
                    className="text-gray-500 hover:text-gray-700"
                  />
                </span>
              )}
            </div>
            {/* NOTIFICATIONS SECTION */}
            <div className="flex-1 overflow-y-auto h-full w-full">
              {/* RENDERING BUCKETS */}
              {renderBuckets("Today", TODAY)}
              {renderBuckets("Last 7 Days", LAST_7_DAYS)}
              {renderBuckets("Last 30 Days", LAST_30_DAYS)}
              {renderBuckets("Older", OLDER)}
              {/* IF NO NOTIFICATIONS AVAILABLE */}
              {allNotifications.length === 0 && (
                <div className="w-full h-full flex flex-col flex-1 items-center justify-center">
                  <BellOffIcon size={50} className="text-gray-500" />
                  <h4 className="text-sm font-semibold text-gray-500">
                    No notifications available
                  </h4>
                </div>
              )}
            </div>
          </section>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default NotificationSidebar;
