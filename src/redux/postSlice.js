// <= IMPORTS =>
import { createSlice } from "@reduxjs/toolkit";

// <= SLICE =>
const postSlice = createSlice({
  name: "post",
  initialState: {
    posts: [],
    singlePost: null,
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    appendPosts: (state, action) => {
      state.posts.push(...action.payload);
    },
    setSinglePost: (state, action) => {
      state.singlePost = action.payload;
    },
  },
});

// <= EXPORTING SLICE ACTIONS =>
export const { setPosts, appendPosts, setSinglePost } = postSlice.actions;

// <= EXPORTING POST SLICE =>
export default postSlice.reducer;
