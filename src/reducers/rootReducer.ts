import { combineReducers } from 'redux';
import modalWindowReducer from './modalWindowReducer';
import ProgressBarReducer from './progressBarReducer';

/**
 * Combining multiple reducers into a single rootReducer using combineReducers.
 * Each reducer is assigned to a specific key in the state.
 */
const rootReducer = combineReducers({
    modalReducer: modalWindowReducer, // Assigning the modalReducer to the 'modalReducer' key in the state.
    progressBarReducer: ProgressBarReducer,  // Assigning the ProgressBarReducer to the 'progressBarReducer' key in the state.
});

export default rootReducer;