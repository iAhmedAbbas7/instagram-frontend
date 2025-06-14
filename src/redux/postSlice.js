// <= IMPORTS =>
import { createSlice } from "@reduxjs/toolkit";

// <= SLICE =>
const postSlice = createSlice({
  name: "post",
  initialState: {
    posts: [],
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    appendPosts: (state, action) => {
      state.posts.push(...action.payload);
    },
  },
});

// <= EXPORTING SLICE ACTIONS =>
export const { setPosts, appendPosts } = postSlice.actions;

// <= EXPORTING POST SLICE =>
export default postSlice.reducer;
