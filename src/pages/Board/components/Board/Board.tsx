import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import "./board.css";
import List from "../List/List";
import ValidatedInput from "../../../../components/validated-input";
import ProgressBar from "../../../../components/progress-bar";
import ModalWindow from "../../../../components/modal-window";
import api from "../../../../api/request";
import { IBoard } from "../../../../common/interfaces/Board";
import { ICard } from "../../../../common/interfaces/Card";
import { openModal, setModalData } from "../../../../actions/modalActions";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface BoardProps {
  isModalOpen: boolean;
  dispatch: Dispatch;
}

const Board: React.FC<BoardProps> = ({ isModalOpen, dispatch }) => {
  const [editingBoard, setEditingBoard] = useState(false);
  const [creatingList, setCreatingList] = useState(false);
  const [value, setValue] = useState("");
  const [board, setBoard] = useState<IBoard>();
  const [valid, setValid] = useState(false);
  const navigate = useNavigate();
  const { board_id } = useParams();
  const { card_id } = useParams();

  // Effect to fetch data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Send a GET request to the API to get all data about board
        const response = await api.get<IBoard>("board/" + board_id);
        setBoard(response.data);

        // If routing with 'card_id' exists, find the card and open modal
        if (card_id !== undefined) {
          const cardIdToFind: number = parseInt(card_id, 10);

          // Function to find card by ID
          const findCardById = (
            lists: { id: number; title: string; cards: ICard[] }[],
            cardIdToFind: number,
          ): ICard | undefined => {
            return lists
              .flatMap((list) => list.cards)
              .find((card) => card.id === cardIdToFind);
          };

          // Find the card in the board data
          const foundCard = findCardById(response.data.lists, cardIdToFind);

          //Find the id list in the board data
          if (foundCard) {
            const foundListId = response.data.lists.find((list) =>
              list.cards.some((card) => card.id === cardIdToFind),
            )?.id;

            // Add necessary data to the card
            const cardWithBoardId = {
              ...foundCard,
              idBoard: board_id,
              idList: foundListId,
            };

            // Dispatch actions to open modal and set modal data
            dispatch(openModal());
            dispatch(setModalData(cardWithBoardId));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error); // If an error occurs during the update process
      }
    };
    fetchData();
  }, []);

  const lists = board?.lists.map((list) => (
    <List
      id={list.id}
      title={list.title}
      cards={list.cards}
      updateBoard={updateBoard}
    />
  ));

  /**
   * Update the current board after various manipulations with board data.
   */
  async function updateBoard() {
    try {
      // Send a GET request to the API to fetch the updated board data
      const response = await api.get<IBoard>("board/" + board_id);
      setBoard(response.data); // Update the board state with the new data
    } catch (error) {
      console.error("Error during request: ", error); // If an error occurs during the update process
    }
  }

  /**
   * Editing the name of board by press enter or lost focus of input.
   * If the new value is not equal to the previous value and is not null,
   * then sending put-request and updating current board.
   *
   * @param newTitle new title of board.
   */
  function editBoard(newTitle: string | null) {
    //If newTitle equals null, user enter invalid name
    if (newTitle == null) {
      toast.error("Error! Board name is invalid");
    } else if (board?.title !== newTitle) {
      const fetchData = async () => {
        try {
          // Send a PUT request to update the board name
          await api.put("board/" + board_id, {
            title: newTitle,
          });
          await updateBoard(); // Update the board state with the new data after successful editing
          toast.success("Board name successfully changed"); // Display a success message
        } catch (error) {
          toast.error("Error! Board name hasn't been changed"); // If an error occurs during the editing
          console.error("Error during request: ", error); // Log the error to the console for debugging purposes
        }
      };
      fetchData();
    }
    setEditingBoard(false);
  }

  /**
   * Deleting of the current board and redirect to the home page.
   */
  async function deleteBoard() {
    try {
      await api.delete("board/" + board_id); // Send a DELETE request to the API to delete the board
      toast.success("Board successfully deleted"); // If the deletion is successful, show a success message
      linkToHomePage(); // Redirect to the home page after successful deletion
    } catch (error) {
      toast.error("Error! Failed to delete board"); // If an error occurs during the deletion process
      console.error("Error during request: ", error); // Log the error to the console for debugging purposes
    }
  }

  /**
   * Creating the new list and updating current board.
   *
   * @param titleList title of the new list.
   */
  function createList(titleList: string | null) {
    setCreatingList(false);

    // Retrieve the current lists from the board
    const currentLists = board!.lists;

    // Find the position for the new list
    const lastList = currentLists[currentLists?.length - 1];
    let position = lastList === undefined ? 0 : lastList.position;

    const fetchData = async () => {
      try {
        // Send a POST request to create a new list
        await api.post(`board/${board_id}/list`, {
          title: titleList,
          position: ++position, // Increment position for the new list
        });
        updateBoard(); // Retrieve the updated board data after creating the list
        toast.success("List successfully created"); // Display a success toast message
      } catch (error) {
        toast.error("Error! Failed to create list"); // If an error occurs during the creation process
        console.error("Error during request:", error); // Log the error to the console for debugging purposes
      }
    };
    if (titleList !== null) {
      fetchData();
    }
  }

  /**
   * Redirect to the home page.
   */
  function linkToHomePage() {
    navigate("/my-react-trello");
  }

  return (
    <div className="board__wrapper">
      {isModalOpen && <ModalWindow />}
      <div className="board__head">
        <button className="btn btn__back-to-home" onClick={linkToHomePage}>
          &lt;
        </button>
        {!editingBoard && (
          <h1
            className="title board__name"
            onClick={() => setEditingBoard(true)}
          >
            {board?.title}
          </h1>
        )}
        <ProgressBar />
        {editingBoard && (
          <ValidatedInput
            className="board__edit-input"
            previousValue={board!.title}
            onEnter={(inputValue: string) => editBoard(inputValue)}
            onLostFocus={(inputValue: string | null) => editBoard(inputValue)}
          ></ValidatedInput>
        )}
        <button className="btn btn__del-board" onClick={deleteBoard}>
          Delete board
        </button>
      </div>
      <div className="board__body">
        <div className="lists__wrapper">{lists}</div>
        {!creatingList && (
          <button
            className="btn btn__add-list"
            onClick={() => setCreatingList(true)}
          >
            +Add list
          </button>
        )}
        {creatingList && (
          <div className="board__form-create-list">
            <button
              className="btn btn__close-creating-list"
              onClick={() => {
                setCreatingList(false);
              }}
            >
              X
            </button>
            <label className="title board__form-create-list--title">
              Enter title
            </label>
            <ValidatedInput
              checkValid={(valid: boolean) => setValid(valid)}
              onLostFocus={(inputValue: string | null) => {
                if (valid && inputValue != null) {
                  setValue(inputValue);
                }
              }}
            ></ValidatedInput>
            <button
              type="submit"
              className="btn btn__create-list"
              disabled={!valid}
              onClick={() => {
                if (valid) {
                  createList(value);
                }
              }}
            >
              Create list
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Function mapStateToProps extracts relevant data from the Redux state and maps it to the props of a component.
 *
 * @param state The Redux state object containing modalReducer with relevant properties. The current Redux store state.
 * @returns An object containing props derived from the Redux store state.
 */
const mapStateToProps = (state: {
  modalReducer: {
    isModalOpen: boolean;
    modalData: {
      id: number;
      title: string;
      description: string;
      idBoard: number;
      updateBoard: any;
      idList: number;
    };
  };
}) => {
  // Extract relevant data from the modalReducer in the Redux state
  return {
    isModalOpen: state.modalReducer.isModalOpen,
    modalData: state.modalReducer.modalData,
  };
};

// Connect the component to Redux and export it
export default connect(mapStateToProps)(Board);
