import { OPEN_MODAL, CLOSE_MODAL, SET_MODAL_DATA, UPDATE_CARD } from '../actions/modalActions';

const initialState = {
    isModalOpen: false,
    modalData: {
        id: 0,
        title: '',
        description: '',
    },
};
interface OpenModalAction {
    type: 'OPEN_MODAL';
}

interface CloseModalAction {
    type: 'CLOSE_MODAL';
}

interface SetModalAction {
    type: 'SET_MODAL_DATA';
}

interface UpdateCardAction {
    type: 'UPDATE_CARD';
}


interface SetModalAction {
    type: typeof SET_MODAL_DATA;
    payload: {
        id:number
        title: string;
        description: string|null;
    };
}
interface UpdateCardAction {
    type: typeof UPDATE_CARD;
    payload: {
        id:number
        title: string;
        description: string;
    };
}

type Action = OpenModalAction| CloseModalAction | SetModalAction | UpdateCardAction;

const modalReducer = (state = initialState, action:Action) => {
    // console.log('Action received:', action.type);
    switch (action.type) {
        case OPEN_MODAL:
            return {
                ...state,
                isModalOpen: true,
            };

        case CLOSE_MODAL:
            return {
                ...state,
                isModalOpen: false,
            };

        case SET_MODAL_DATA:
            return {
                ...state,
                modalData: action.payload,
            };

        case UPDATE_CARD:
            return { ...state,
                modalData: { ...state.modalData, ...action.payload }
            };


        default:
            return state;
    }
};

export default modalReducer;