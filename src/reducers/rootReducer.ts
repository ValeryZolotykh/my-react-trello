import { combineReducers } from 'redux';
import modalReducer from './modalReducer';
import ProgressBarReducer from './reducers';

const rootReducer = combineReducers({
    modalReducer: modalReducer,
    progressBarReducer: ProgressBarReducer,
});

export default rootReducer;