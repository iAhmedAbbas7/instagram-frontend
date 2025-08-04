// <== IMPORTS ==>
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { format, isAfter, isToday, subDays } from "date-fns";
import { getFullNameInitials } from "@/utils/getFullNameInitials";
import { BellOffIcon, ChevronLeft, Trash2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  clearAllNotifications,
  markAllAsRead,
  removeNotification,
} from "@/redux/notificationSlice";

const Notifications = () => {
  // DISPATCH
  const dispatch = useDispatch();
  // NAVIGATION
  const navigate = useNavigate();
  // GETTING ALL NOTIFICATIONS FROM NOTIFICATION SLICE
  const {
    likeNotifications,
    commentNotifications,
    followNotifications,
    hasUnread,
  } = useSelector((store) => store.notification);
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
  // EFFECT TO MARK ALL NOTIFICATIONS AS READ ON COMPONENT MOUNT
  useEffect(() => {
    if (hasUnread) {
      dispatch(markAllAsRead());
    }
  }, [dispatch, hasUnread]);
  return (
    // MAIN NOTIFICATIONS WRAPPER
    <section className="w-full flex flex-col items-start justify-start bg-white h-[100vh] pl-[250px] max-[1200px]:pl-[70px] max-[768px]:h-[90vh] max-[768px]:pl-0">
      {/* HEADER */}
      <header className="w-full flex items-center justify-center border-b-2 border-gray-200 bg-white overflow-hidden px-4 py-3 relative">
        {/* BACK BUTTON */}
        <span
          title="Go Back"
          onClick={() => navigate(-1)}
          className="cursor-pointer absolute left-0"
        >
          <ChevronLeft size={35} className="hover:text-gray-500" />
        </span>
        {/* TITLE */}
        <h5 className="text-[1.1rem] font-semibold">Notifications</h5>
        {/* IN NOTIFICATIONS EXIST */}
        {allNotifications.length > 0 && (
          <span
            title="Clear All"
            className="cursor-pointer absolute right-2"
            onClick={(e) => {
              e.stopPropagation();
              dispatch(clearAllNotifications());
            }}
          >
            <Trash2 size={25} className="hover:text-gray-500" />
          </span>
        )}
      </header>
      {/* NOTIFICATIONS SECTION */}
      <section className="w-full flex-1 overflow-y-auto">
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
      </section>
    </section>
  );
};

export default Notifications;
