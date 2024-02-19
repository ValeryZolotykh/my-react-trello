import {createStore} from 'redux';
import rootReducer from "../reducers/rootReducer";

// Create a Redux store using createStore with a root reducer, defining rules for updating data.
const store = createStore(rootReducer);

export default store;

/*
 * Redux Store: Centralized place to store application state in a single object.
 * store.js creates and configures the store using createStore and a root reducer.
 * Actions update the state based on rules defined in the root reducer.
 * Exported store is used to access and update the application state.
 */
