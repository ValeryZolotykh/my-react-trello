// Action types
export const OPEN_MODAL = "OPEN_MODAL";
export const CLOSE_MODAL = "CLOSE_MODAL";
export const SET_MODAL_DATA = "SET_MODAL_DATA";
export const UPDATE_CARD = "UPDATE_CARD";

/* Action creators - functions that create and return action objects in Redux. */

// Opens the modal
export const openModal = () => ({
  type: OPEN_MODAL,
});

// Closes the modal
export const closeModal = () => ({
  type: CLOSE_MODAL,
});

// Sets data for the modal, such as id, title, and description
export const setModalData = (data: {
  id: number;
  title: string;
  description: string;
}) => ({
  type: SET_MODAL_DATA,
  payload: data,
});

// Updates card data with the provided information
export const updateCard = (updatedData: any) => ({
  type: UPDATE_CARD,
  payload: updatedData,
});
