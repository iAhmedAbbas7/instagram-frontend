// <== IMPORTS ==>
import authSlice from "./authSlice";
import postSlice from "./postSlice";
import chatSlice from "./chatSlice";
import searchSlice from "./searchSlice";
import storiesSlice from "./storySlice";
import settingsSlice from "./settingsSlice";
import storage from "redux-persist/lib/storage";
import notificationSlice from "./notificationSlice";
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

// <== REDUX-PERSIST ==>
const persistConfig = {
  key: "Instagram",
  version: 1,
  storage,
};

// <== APPLICATION-REDUCERS ==>
const rootReducer = combineReducers({
  auth: authSlice,
  post: postSlice,
  chat: chatSlice,
  search: searchSlice,
  stories: storiesSlice,
  settings: settingsSlice,
  notification: notificationSlice,
});

// <== REDUX-PERSIST ==>
const persistedReducer = persistReducer(persistConfig, rootReducer);

// <== STORE WITH PERSISTENCE CONFIGURATION ==>
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
