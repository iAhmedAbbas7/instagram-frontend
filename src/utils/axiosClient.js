// <= IMPORTS =>
import axios from "axios";
import store from "@/redux/store";
import { sessionExpired } from "@/redux/authSlice";

// <= API ROOT =>
const API_ROOT = "http://localhost:8080/api/v1";

// <= CREATING AXIOS CLIENT INSTANCE =>
const axiosClient = axios.create({
  baseURL: API_ROOT,
  withCredentials: true,
});

// <= AXIOS INTERCEPTOR =>
axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err?.response?.status === 401 &&
      err?.response?.data?.message === "Unauthorized to Perform Action!"
    ) {
      store.dispatch(sessionExpired());
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
