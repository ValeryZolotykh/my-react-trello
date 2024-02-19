import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./card.css";
import api from "../../../../api/request";
import { toast } from "react-toastify";
import { ICard } from "../../../../common/interfaces/Card";
import { openModal, setModalData } from "../../../../actions/modalActions";

interface ICardProps {
  id: number;
  title: string;
  position: number;
  description: string;
  idList: number;
  cardsList: ICard[];
  updateBoard: () => void;
}

export default function Card({
  id,
  title,
  position,
  description,
  idList,
  cardsList,
  updateBoard,
}: ICardProps) {
  const { board_id } = useParams();
  const [newPositionForCard, setNewPositionForCard] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /**
   * Deleting of the current card and update the board.
   */
  async function deleteCard() {
    try {
      await api.delete("board/" + board_id + "/card/" + id); // Send a DELETE request to delete the card
      updateBoard(); // Update the board after request
      toast.success("Card successfully deleted"); // If the deletion is successful, show a success message
    } catch (error) {
      toast.error("Error! Failed to delete card"); // If an error occurs during the deletion process
      console.error("Error during request: ", error); // Log the error to the console for debugging purposes
    }
  }

  /**
   * Editing of the current card and open the modal window with card data.
   */
  function editCard() {
    // Prepare modal data with relevant information
    const modalData = {
      id: id,
      title: title,
      description: description,
      idBoard: board_id,
      updateBoard: updateBoard,
      idList: idList,
    };
    dispatch(openModal()); // Dispatch action to open the modal
    dispatch(setModalData(modalData)); // Dispatch action to set modal data
    navigate(`card/${id}`); // Navigate to the router with modal window with card data
  }

  /** Start LOGIC OF DRAG-N-DROP */

  /**
   * Save the information about the dragged card.
   *
   * @param event The drag event that triggered the method.
   */
  function dragStart(event: React.DragEvent<HTMLDivElement>) {
    // Prepare data to be transferred during the drag
    const dragData = {
      idCard: id, // The ID of the dragged card.
      position: position, // Position of the dragged card in the initial list.
      oldIdList: idList, // The ID of initial list of the dragged card.
      oldList: cardsList, // The initial list of the dragged card.
    };

    // Set the drag data in JSON format for the dragged element
    event.dataTransfer?.setData("application/json", JSON.stringify(dragData));
  }

  /**
   * Called when a draggable card is dragged over the drop-zone.
   * Creating a drop-zone slot above or below the card.
   *
   * @param event The drag event that triggered the method.
   */
  function onDragEnter(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault(); // Prevent the default behavior of the drag event, which may interfere with the custom logic
    const dropZoneTarget = event.target as HTMLElement; // Get the target element that triggered the event and cast it as an html-element

    // Check if the dragged element is a content card and if there are no existing drop zones in the card container
    if (
      dropZoneTarget.className === "card__content" &&
      !dropZoneTarget.parentElement?.parentElement?.querySelectorAll(".drop")
        .length
    ) {
      // Get the dimensions and position of the card
      const cardRect = dropZoneTarget.getBoundingClientRect(); // Return the position and size information of the element
      const cardHeight = cardRect.height; // Return the height of the element(card)
      const cardTopOffset = cardRect.top;
      const mouseY = event.clientY; // Get the Y coordinate of the mouse cursor at the time of the event
      const isAboveHalf = mouseY - cardTopOffset < cardHeight / 2;

      const cardContainer = dropZoneTarget.parentElement;
      const slots = cardContainer?.querySelectorAll(".drop");

      // Check if there are no existing drop zones in the card container
      if (!slots?.length) {
        const slot = createDropZone(); // Create a new drop-zone slot
        if (isAboveHalf) {
          // If the cursor is above the half of the card, insert the slot above it
          dropZoneTarget?.insertAdjacentElement("beforebegin", slot); // Insert the slot before the target element
          setNewPositionForCard(position); // Update position for the card
        } else {
          // If the cursor is below the half of the card, insert the slot below it
          dropZoneTarget?.insertAdjacentElement("afterend", slot); // Insert the slot after the target element
          setNewPositionForCard(position + 1); // Update position for the card
        }
      }
    }
  }

  /**
   * Creates a drop zone element and returns it. The drop zone is a div element with specified styles and a 'drop' class.
   * It is used to handle drag-and-drop events for elements that can be dropped onto it.
   *
   * @returns The created drop zone element.
   */
  function createDropZone(): HTMLElement {
    const slot = document.createElement("div");
    slot.style.cssText = `
    width: auto;
    height: 30px;
    border-radius: 4px;
    border: 1px dotted white;
    background: rgba(120, 120, 193, 0.355);
    margin-bottom: 20px;
    margin-top: 10px;`;

    /* Prevent the default behavior when an element is dragged over the drop zone.
    This is necessary to allow dropping elements onto the zone.*/
    slot.addEventListener("dragover", (event) => {
      event.preventDefault();
    });
    slot.classList.add("drop");
    return slot;
  }

  /**
   * Handles the event when a draggable element leaves a drop zone.
   *
   * @param event The drag event that triggered the method.
   */
  function onDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault(); // Prevent the default behavior of the drag event, which may interfere with the custom logic
    const element = event.target as HTMLElement; // Get the target element that triggered the event and cast it as an html-element
    const cardContainer = element.closest(".card__wrapper"); // Find the closest ancestor element with the class "card" inside the target element
    const containerCoordinate = cardContainer!.getBoundingClientRect(); //Get the bounding rectangle of the card container element to determine its position and size

    // Check if the mouse pointer is outside the boundaries of the container
    if (
      event.clientX < containerCoordinate.left ||
      event.clientX > containerCoordinate.right ||
      event.clientY < containerCoordinate.top ||
      event.clientY > containerCoordinate.bottom
    ) {
      // Remove all drop slots within the card container
      const slots = cardContainer!.querySelectorAll(".drop");
      slots.forEach((slot: any) => slot.remove());
    }
  }

  /**
   * This method handles the logic when a drag event triggers the drop action for a card.
   *
   * @param event The drag event that triggered the method.
   */
  function onDragDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault(); // Prevent the default behavior of the drag event, which may interfere with the custom logic

    // Extract data about the dragged card from the drag event
    const dataDrag = JSON.parse(
      event.dataTransfer!.getData("application/json"),
    );

    const fetchData = async () => {
      try {
        // Check if the dragged card is from the same list
        if (dataDrag.oldIdList === idList) {
          // Check if the card's position has changed
          if (dataDrag.position !== newPositionForCard) {
            // Check if the new position is not the immediate next position
            if (dataDrag.position !== newPositionForCard - 1) {
              // Update the position of the card within the same list
              updatePositionCardsInTheSameList(
                dataDrag.idCard,
                dataDrag.position,
                newPositionForCard,
                cardsList,
              );
            }
          }
        } else {
          await api.put("board/" + board_id + "/card/", [
            {
              id: dataDrag.idCard,
              position: newPositionForCard,
              list_id: idList,
            },
          ]);
          // Display a success message when the card is successfully moved
          toast.success("Card successfully moved");
          // Update the position of cards in the original list after moving the card
          updatePositionCardsInTheOriginalList(
            dataDrag.position,
            dataDrag.oldIdList,
            dataDrag.oldList,
          );
        }
      } catch (error) {
        toast.error("Error! Failed to move card"); // Display an error message
        console.error("Error during request:", error); // Log the error to the console for debugging purposes
      }
    };
    fetchData();

    // Delete the drop-zone after dragging of card.
    const dropZone = event.target as HTMLElement;
    dropZone?.remove();
  }

  /**
   * Updating the position of the cards in the list if the card dragged in the same list.
   *
   * @param idDraggedCard The ID of the dragged card.
   * @param originalPosition The original position of the dragged card.
   * @param newPositionForCard The new position for the dragged card.
   * @param cardsList An array of cards in the list.
   */
  function updatePositionCardsInTheSameList(
    idDraggedCard: number,
    originalPosition: number,
    newPositionForCard: number,
    cardsList: ICard[],
  ) {
    const requestData: any[] = []; // Array to store the request data for updating card positions
    // Check if the dragged card is moved down in the list
    if (originalPosition < newPositionForCard) {
      // Calculate the new position for the dragged card
      const newPosition: number = newPositionForCard - 1;

      // Add the dragged card with the updated position
      requestData.push({
        id: idDraggedCard,
        position: newPosition,
        list_id: idList,
      });

      // Iterate through cards between old and new positions to adjust their positions
      for (const card of cardsList.slice(originalPosition, newPosition)) {
        requestData.push({
          id: card.id,
          position: card.position - 1,
          list_id: idList,
        });
      }
     // Check if the dragged card is moved up in the list
    } else if (originalPosition > newPositionForCard) {
      // Add the dragged card with the updated position
      requestData.push({
        id: idDraggedCard,
        position: newPositionForCard,
        list_id: idList,
      });
      // Iterate through cards between new and old positions to adjust their positions
      for (const card of cardsList.slice(
        newPositionForCard - 1,
        originalPosition - 1,
      )) {
        requestData.push({
          id: card.id,
          position: card.position + 1,
          list_id: idList,
        });
      }
    }

    const fetchData = async () => {
      try {
        // Send a PUT request to update positions in the list
        await api.put("board/" + board_id + "/card/", requestData);
        toast.success("Card successfully moved");
        updateBoard(); // Retrieve the updated board data after updating the positions
      } catch (error) {
        console.error("Error during request:", error); // Log the error to the console for debugging purposes
      }
    };
    fetchData();
  }

  /**
   * Updating the position of the cards in the list from which the card was dragged.
   *
   * @param position Position of the dragged card in the original list.
   * @param idOriginalList The ID of the original list.
   * @param originalList An array of cards in the original list.
   */
  function updatePositionCardsInTheOriginalList(
    position: number,
    idOriginalList: number,
    originalList: ICard[],
  ) {
    const requestData: any[] = [];  // Array to store the request data for updating card positions

    // Iterate through the cards in the original list starting from the dragged card
    for (const card of originalList.slice(position)) {
      requestData.push({
        id: card.id,
        position: card.position - 1,
        list_id: idOriginalList,
      });
    }
    const fetchData = async () => {
      try {
        // Send a PUT request to update positions in the original list
        await api.put("board/" + board_id + "/card/", requestData);
        // After updating positions in the original list, we need update positions card in the list where card was dragged
        updatePositionCardsInTheNewList(newPositionForCard, idList, cardsList);
      } catch (error) {
        console.error("Error during request:", error); // Log the error to the console for debugging purposes
      }
    };
    fetchData();
  }

  /**
   * Updating the position of the cards in the list where the card was dragged.
   *
   * @param position Position of the dragged card the new list.
   * @param idList The ID of the new list.
   * @param cardsList An array of cards in the new list.
   */
  function updatePositionCardsInTheNewList(position: number, idList: number, cardsList: ICard[]) {
    const requestData: any[] = []; // Array to store the request data for updating card positions

    // Iterate through the cards in the new list starting from the dragged card
    for (const card of cardsList.slice(position - 1)) {
      requestData.push({
        id: card.id,
        position: card.position + 1,
        list_id: idList,
      });
    }
    const fetchData = async () => {
      try {
        // Send a PUT request to update positions in the new list
        await api.put("board/" + board_id + "/card/", requestData);
        updateBoard();
      } catch (error) {
        console.error("Error during request:", error); // Log the error to the console for debugging purposes
      }
    };
    fetchData();
  }

  /** Finish LOGIC OF DRAG-N-DROP */

  return (
    <div
      className="card__wrapper"
      draggable={true}
      onDragStart={dragStart}
      onDragLeave={onDragLeave}
      onDrop={onDragDrop}
    >
      <div className="card__content" onDragEnter={onDragEnter}>
        <h2 className="title card__title">{title}</h2>
        <div className="card__control-panel">
          <button className="btn btn__edit-card" onClick={editCard}>
            <i className="icon">edit</i>
          </button>
          <button className="btn btn__del-card" onClick={deleteCard}>
            x
          </button>
        </div>
      </div>
    </div>
  );
}
