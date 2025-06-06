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
  },
});

// <= EXPORTING SLICE ACTIONS =>
export const { setPosts } = postSlice.actions;

// <= EXPORTING POST SLICE =>
export default postSlice.reducer;
