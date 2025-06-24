// <= IMPORTS =>
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // LOCATION
  const location = useLocation();
  // CURRENT USER CREDENTIALS & LOGIN & LOGOUT STATE
  const { user, isLoggedIn, isLoggingOut } = useSelector((store) => store.auth);
  // ROUTES NOT ACCESSIBLE WHEN LOGGED IN
  const authRoutes = ["/", "/login", "/signup"];
  // IF LOGGED IN USER TRIES TO ACCESS AUTH ROUTES
  if (user && authRoutes.includes(location.pathname)) {
    // NAVIGATING TO THE PRESENT PAGE
    return <Navigate to={location?.state?.from || "/home"} replace />;
  }
  // IF NOT LOGGED IN AND TRIES TO ACCESS PROTECTED ROUTES
  if (!user && !authRoutes.includes(location.pathname)) {
    // NAVIGATING TO HOMEPAGE WHEN LOGGING OUT
    if (!isLoggedIn && isLoggingOut) {
      return <Navigate to="/" replace />;
    } else if (!isLoggedIn && !isLoggingOut) {
      // NAVIGATING TO LOGIN PAGE WHEN NOT LOGGED IN
      return (
        <Navigate to="/login" state={{ from: location.pathname }} replace />
      );
    }
  }
  return <>{children}</>;
};

export default ProtectedRoute;
