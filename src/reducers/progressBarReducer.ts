/** Defines the structure of the Redux store's state. */
interface AppState {
  requestsInProgress: number;
}

/** Describes the format of actions that can be dispatched to the reducer. */
interface StartRequestAction {
  type: "START_REQUEST";
}
interface EndRequestAction {
  type: "END_REQUEST";
}

/** Union type for actions that can be handled in the reducer. */
type Action = StartRequestAction | EndRequestAction;

/** Initial state of the Redux store. */
const initialState: AppState = {
  requestsInProgress: 0,
};

/** Reducer function to update the state based on the action type. */
const progressBarReducer = (
  state: AppState = initialState,
  action: Action,
): AppState => {
  switch (action.type) {
    case "START_REQUEST":
      return {
        ...state,
        requestsInProgress: state.requestsInProgress + 1,
      };
    case "END_REQUEST":
      return {
        ...state,
        requestsInProgress: state.requestsInProgress - 1,
      };
    default:
      return state;
  }
};

export default progressBarReducer;

/*
 *  Redux Working Principle:
 * 1) State: Application has some state, e.g., items in the cart.
 * 2) Actions: When something happens (e.g., user action), an "action" is created.
 * 3) Reducer: Function that takes current state and action, returning the new state.
 * Reducers should be pure functions for efficient state management.
 * */