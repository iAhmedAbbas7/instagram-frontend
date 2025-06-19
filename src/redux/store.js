// <= IMPORTS =>
import authSlice from "./authSlice";
import postSlice from "./postSlice";
import chatSlice from "./chatSlice";
import storage from "redux-persist/lib/storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

// <= REDUX-PERSIST =>
const persistConfig = {
  key: "Instagram",
  version: 1,
  storage,
};

// <= APPLICATION-REDUCERS =>
const rootReducer = combineReducers({
  auth: authSlice,
  post: postSlice,
  chat: chatSlice,
});

// <= REDUX-PERSIST =>
const persistedReducer = persistReducer(persistConfig, rootReducer);

// <= STORE WITH PERSISTENCE CONFIGURATION =>
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export default store;
