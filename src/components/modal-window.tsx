import React, { useState, useEffect, useRef } from "react";
import { connect, useDispatch } from "react-redux";
import ReactDOM from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { createBrowserHistory } from "history";
import { closeModal, updateCard } from "../actions/modalActions";
import api from "../api/request";
import "./modal-window.css";
import ValidatedInput from "./validated-input";
import { toast } from "react-toastify";

interface ModalWindowProps {
  isModalOpen: boolean;
  modalData: {
    id: number;
    title: string;
    description: string;
    idBoard: number;
    updateBoard: any;
    idList: number;
  };
}
const ModalWindow: React.FC<ModalWindowProps> = ({
  isModalOpen,
  modalData,
}) => {
  const [editingCard, setEditingCard] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const dispatch = useDispatch();
  const { board_id } = useParams();
  const navigate = useNavigate();
  const history = createBrowserHistory();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCursorToEnd();
    history.listen(handleCloseModal); // Listen for changes in the URL and close the modal accordingly
  }, [history, navigate]);

  /**
   * Set the cursor to the end of the textarea.
   */
  const setCursorToEnd = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
    }
  };

  /**
   * Close the modal and navigate to the board page.
   */
  const handleCloseModal = () => {
    dispatch(closeModal()); // Dispatch an action to close modal window in the state
    navigate(`/board/${board_id}`);
  };

  /**
   * Editing the name of card. If the new value is not equal to the previous value or undefined then sending
   *  put-request and updating current board.
   * @param newTitleCard New title of card.
   */
  const editCard = async (newTitleCard: string | null) => {
    setEditingCard(false);
    if (modalData.title !== newTitleCard && newTitleCard !== null) {
      try {
        // Send a PUT request to the API to update the card title
        await api.put(`board/${modalData.idBoard}/card/${modalData.id}`, {
          title: newTitleCard,
          list_id: modalData.idList,
        });
        modalData.updateBoard(); // Update the board by calling the updateBoard method from modalData
        dispatch(updateCard({ title: newTitleCard })); // Dispatch an action to update the new title in the state
        toast.success("Card name successfully changed"); // If the editing is successful, show a success message
      } catch (error) {
        toast.error("Error! Card name hasn't been changed"); // If an error occurs during the editing process
        console.error("Error during request: ", error); // Log the error to the console for debugging purposes
      }
    }
  };

  /**
   *  Function to handle blur event on a textarea. Check the textarea value and if everything is ok, send a put-request
   *  and update the current board.
   *
   * @param event The blur event triggered when the user finishes editing the textarea.
   */
  const handleBlurTextarea = async (event: any) => {
    setEditingDescription(false);
    const textareaValue = event.target.value; // Extract the value from the textarea
    const previousTextareaValue = modalData.description; // Retrieve the previous description value from the modalData

    // Check if the textarea value is not empty, not consist only spaces and different from the previous value
    if (
      textareaValue.length !== 0 &&
      textareaValue !== previousTextareaValue &&
      textareaValue.trim() !== ""
    ) {
      try {
        // Send a PUT request to the API to edit the card description
        await api.put(`board/${modalData.idBoard}/card/${modalData.id}`, {
          description: textareaValue,
          list_id: modalData.idList,
        });
        // If the editing is successful, show a success message
        toast.success("Description of card successfully changed");

        // Update the board by calling the updateBoard method from modalData
        modalData.updateBoard();

        // Dispatch an action to update the card description in the state
        dispatch(updateCard({ description: textareaValue }));

      } catch (error) {
        toast.error("Error! Description of card hasn't been changed"); // If an error occurs during the editing process
        console.error("Error during request: ", error); // Log the error to the console for debugging purposes
      }
    }
  };

  /**
   * Delete of the card, update the board page and close the modal window.
   */
  const deleteCard = async () => {
    try {
      // Send a DELETE request to the API to delete the card
      await api.delete(`board/${modalData.idBoard}/card/${modalData.id}`);

      // If the deletion is successful, show a success message
      toast.success("Card successfully deleted");

      // Update the board by calling the updateBoard method from modalData
      modalData.updateBoard();

      // Close modal window
      handleCloseModal();
    } catch (error) {
      toast.error("Error! Failed to delete card"); // If an error occurs during the deletion process
      console.error("Error during request: ", error); // Log the error to the console for debugging purposes
    }
  };

  /**
   * Delete of description of the card and update the board page.
   */
  const deleteDescription = async () => {
    try {
      // Send a DELETE request to the API to delete the card
      await api.put(`board/${modalData.idBoard}/card/${modalData.id}`, {
        description: "",
        list_id: modalData.idList,
      });

      // Update the board by calling the updateBoard method from modalData
      modalData.updateBoard();

      // Dispatch an action to update the card description in the state
      dispatch(updateCard({ description: "" }));

      // If the deletion is successful, show a success message
      toast.success("Description of the card successfully deleted");
    } catch (error) {
      toast.error("Error! Failed to delete card"); // If an error occurs during the deletion process
      console.error("Error during request: ", error); // Log the error to the console for debugging purposes
    }
  };

  const modalContainer = document.getElementById("root");

  // Render nothing if the modal is not open or modal container is not found
  if (!isModalOpen || !modalContainer) {
    return null;
  }

  // Render the modal window using ReactDOM.createPortal
  return ReactDOM.createPortal(
    <div className="modal-window">
      <div className="modal-window__overlay" onClick={handleCloseModal}>
        <div
          className="modal-window__content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-window__head-content">
            {!editingCard && (
              <div className="modal-window__title-wrapper">
                <h1
                  className="modal-window__title"
                  title="Click to change"
                  onClick={() => setEditingCard(true)}
                >
                  {modalData.title}
                </h1>
                <i
                  className="icon modal-window__icon modal-window__icon-edit-title"
                  onClick={() => setEditingCard(true)}
                >
                  edit
                </i>
              </div>
            )}

            {editingCard && (
              <div className="modal-window__edit-title-card">
                <ValidatedInput
                  className="modal-window__edit-input"
                  previousValue={modalData.title}
                  onEnter={(inputValue) => editCard(inputValue)}
                  onLostFocus={(inputValue) => editCard(inputValue)}
                />
                <span
                  className="modal-window__cancel-edit"
                  onClick={() => setEditingCard(false)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  Cancel
                </span>
              </div>
            )}
          </div>

          {modalData.description !== undefined &&
            modalData.description !== "" &&
            !editingDescription && (
              <div className="modal-window__with-description">
                <p
                  className="modal-window__description"
                  title="Click to change"
                  onClick={() => setEditingDescription(true)}
                >
                  {modalData.description}
                </p>
                <i
                  className="icon modal-window__icon modal-window__icon-edit-description"
                  onClick={() => setEditingDescription(true)}
                >
                  edit
                </i>
              </div>
            )}

          {(modalData.description === undefined ||
            modalData.description === "") &&
            !editingDescription && (
              <p
                className="modal-window__no-description"
                title="Click to change"
                onClick={() => setEditingDescription(true)}
              >
                Add the description
              </p>
            )}

          {editingDescription && (
            <div className="modal-window__edit-description-card">
              <textarea
                className="modal-window__edit-textarea"
                defaultValue={
                  modalData.description == undefined ||
                  modalData.description == ""
                    ? ""
                    : modalData.description
                }
                placeholder={
                  modalData.description == undefined ||
                  modalData.description == ""
                    ? "Enter description"
                    : ""
                }
                onBlur={handleBlurTextarea}
                ref={textareaRef}
                autoFocus
              ></textarea>
              <div className="modal-window__descriptions-control-panel">
                <button
                  className="btn btn__add-description"
                  onClick={handleBlurTextarea}
                >
                  ✓ Change description
                </button>
                <button
                  className="btn btn__cancel-editing-description"
                  onClick={() => setEditingDescription(false)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  ✖ Cancel editing
                </button>
              </div>
            </div>
          )}
          <button className="btn btn__close-modal" onClick={handleCloseModal}>
            Х
          </button>
          {modalData.description !== undefined &&
            modalData.description !== "" && (
              <button
                className="btn btn__del-description"
                onClick={deleteDescription}
              >
                Delete description
              </button>
            )}
          <button className="btn btn__delete-card" onClick={deleteCard}>
            Delete card
          </button>
        </div>
      </div>
    </div>,
    modalContainer,
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
  // Extracting isModalOpen and modalData from modalReducer in the Redux store state
  return {
    isModalOpen: state.modalReducer.isModalOpen,
    modalData: state.modalReducer.modalData,
  };
};

// Connect the component to Redux and export it
export default connect(mapStateToProps)(ModalWindow);
