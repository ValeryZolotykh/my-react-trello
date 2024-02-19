import {
  OPEN_MODAL,
  CLOSE_MODAL,
  SET_MODAL_DATA,
  UPDATE_CARD,
} from "../actions/modalActions";

const initialState = {
  isModalOpen: false,
  modalData: {
    id: 0,
    title: "",
    description: "",
  },
};

// Action interfaces for opening, closing, setting data, and updating a card in the modal
interface OpenModalAction {
  type: "OPEN_MODAL";
}

interface CloseModalAction {
  type: "CLOSE_MODAL";
}

interface SetModalAction {
  type: "SET_MODAL_DATA";
}

interface UpdateCardAction {
  type: "UPDATE_CARD";
}

// Interfaces using constants to specify action types and payload shapes
interface SetModalAction {
  type: typeof SET_MODAL_DATA;
  payload: {
    id: number;
    title: string;
    description: string | null;
  };
}

interface UpdateCardAction {
  type: typeof UPDATE_CARD;
  payload: {
    id: number;
    title: string;
    description: string;
  };
}

// Union type for all possible actions in the modal reducer
type Action =
  | OpenModalAction
  | CloseModalAction
  | SetModalAction
  | UpdateCardAction;

const modalWindowReducer = (state = initialState, action: Action) => {
  // Switch statement to handle different action types and update state accordingly
  switch (action.type) {
    case OPEN_MODAL:
      // If action type is OPEN_MODAL, set isModalOpen to true
      return {
        ...state,
        isModalOpen: true,
      };

    case CLOSE_MODAL:
      // If action type is CLOSE_MODAL, set isModalOpen to false
      return {
        ...state,
        isModalOpen: false,
      };

    case SET_MODAL_DATA:
      // If action type is SET_MODAL_DATA, update modalData with the payload
      return {
        ...state,
        modalData: action.payload,
      };

    case UPDATE_CARD:
      // If action type is UPDATE_CARD, update modalData by merging with the payload
      return { ...state, modalData: { ...state.modalData, ...action.payload } };

    default:
      // If the action type is unknown, return the current state
      return state;
  }
};

export default modalWindowReducer;
