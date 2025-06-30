// <= IMPORTS =>
import { createSlice } from "@reduxjs/toolkit";

// <= SLICE =>
const searchSlice = createSlice({
  name: "search",
  initialState: {
    recentSearches: [],
  },
  reducers: {
    addRecentSearch: (state, action) => {
      // RECEIVING THE USER OBJECT IN THE PAYLOAD
      const user = action.payload;
      // REMOVING ANY OLD ENTRY FROM THE HISTORY
      state.recentSearches = state.recentSearches.filter(
        (u) => u._id !== user._id
      );
      // ADDING THE NEW ENTRY TO THE TOP OF THE HISTORY
      state.recentSearches.unshift(user);
      // LIMITING THE HISTORY AT 10 SEARCHES
      if (state.recentSearches.length > 10) {
        state.recentSearches.pop();
      }
    },
    removeRecentSearch: (state, action) => {
      // RECEIVING THE USER ID IN THE PAYLOAD
      const userId = action.payload;
      // REMOVING THE USER FOM THE HISTORY
      state.recentSearches = state.recentSearches.filter(
        (u) => u._id !== userId
      );
    },
    clearAllSearches: (state) => {
      state.recentSearches = [];
    },
  },
});

// <= EXPORTING SLICE ACTIONS =>
export const { addRecentSearch, removeRecentSearch, clearAllSearches } =
  searchSlice.actions;

// <= EXPORTING SEARCH SLICE =>
export default searchSlice.reducer;
