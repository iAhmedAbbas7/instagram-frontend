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

// <= FLAG TO AVOID MULTIPLE SIMULTANEOUS REFRESHES =>
let isRefreshing = false;
// <= QUEUE TO STORE REQUESTS WHILE REFRESHING TOKEN =>
let requestsQueue = [];
// <= FUNCTION TO PROCESS REQUESTS IN QUEUE =>
const processQueue = (error) => {
  requestsQueue.forEach(({ reject, resolve }) => {
    // IF ERROR THEN REJECTING, OTHERWISE RESOLVING
    error ? reject(error) : resolve();
  });
  // CLEARING THE QUEUE
  requestsQueue = [];
};

// <= AXIOS INTERCEPTOR =>
axiosClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    // GETTING CONFIG & RESPONSE FROM ERROR
    const { config, response } = err;
    // SETTING ORIGINAL REQUEST
    const originalRequest = config;
    // IF RESPONSE IS UNAUTHORIZED (401)
    if (
      response &&
      response.status === 401 &&
      response.data.message === "Unauthorized to Perform Action!"
    ) {
      // PREVENTING THE INFINITE LOOP OF REFRESHING TOKEN
      if (originalRequest._retry) {
        // IF RETRY IS TRUE THEN RETURNING ERROR AND MARKING SESSION AS EXPIRED
        store.dispatch(sessionExpired());
        return Promise.reject(err);
      }
      // AVOIDING THE REFRESH IF THE CURRENT REQUEST IS ALREADY REFRESHING
      if (originalRequest.url.endsWith("/refreshToken")) {
        // IF REQUEST FAILS FOR THEN RETURNING ERROR AND MARKING SESSION AS EXPIRED
        store.dispatch(sessionExpired());
        return Promise.reject(err);
      }
      // MARKING THE REQUEST AS RETRY TO PREVENT LOOPS
      originalRequest._retry = true;
      // IF REFRESHING
      if (isRefreshing) {
        // IF REFRESH IS IN PROGRESS THEN ADDING TO THE QUEUE
        return new Promise((resolve, reject) => {
          requestsQueue.push({ resolve, reject });
        })
          .then(() => axiosClient(originalRequest))
          .catch((e) => Promise.reject(e));
      }
      // MARKING AS REFRESHING
      isRefreshing = true;
      // ATTEMPTING TO REFRESH TOKEN
      return new Promise((resolve, reject) => {
        axiosClient
          .post("/user/refreshToken")
          .then(() => {
            // PROCESSING THE QUEUE WITHOUT ERROR
            processQueue(null);
            // RESOLVING THE ORIGINAL REQUEST
            resolve(axiosClient(originalRequest));
          })
          .catch((refreshError) => {
            // PROCESSING THE QUEUE WITH ERROR
            processQueue(refreshError);
            // MARKING THE SESSION AS EXPIRED
            store.dispatch(sessionExpired());
            // REJECTING THE ERROR
            reject(refreshError);
          })
          .finally(() => {
            // RESETTING THE REFRESHING FLAG
            isRefreshing = false;
          });
      });
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
