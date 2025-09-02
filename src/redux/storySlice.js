// <== IMPORTS ==>
import { createSlice } from "@reduxjs/toolkit";

// <== SLICE ==>
const storySlice = createSlice({
  name: "stories",
  initialState: {
    modalOpen: false,
  },
  reducers: {
    // MODAL OPEN
    openModal: (state) => {
      state.modalOpen = true;
    },
    // MODAL CLOSE
    closeModal: (state) => {
      state.modalOpen = false;
    },
  },
});

// <== EXPORTING SLICE ACTIONS ==>
export const { openModal, closeModal } = storySlice.actions;

// <== EXPORTING STORIES SLICE ==>
export default storySlice.reducer;
