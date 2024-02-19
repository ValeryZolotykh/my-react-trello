import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./list.css";
import { ICard } from "../../../../common/interfaces/Card";
import Card from "../Card/Card";
import ValidatedInput from "../../../../components/validated-input";
import api from "../../../../api/request";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface IListProps {
  id: number;
  title: string;
  cards: ICard[];
  updateBoard: () => void; // Принимает функцию удаления списка
}

export default function List({ id, title, cards, updateBoard }: IListProps) {
  const [editingList, setEditingList] = useState(false);
  const [creatingCard, setCreatingCard] = useState(false);
  const { board_id } = useParams();

  const cardsElements = cards.map((card) => (
    <Card
      id={card.id}
      title={card.title}
      position={card.position}
      description={card.description}
      idList={id}
      cardsList={cards}
      updateBoard={updateBoard}
    />
  ));

  /**
   * Editing the name of list by press enter or lost focus of input.
   * If the new value is not equal to the previous value and isn't not null, then sending put-request
   * and updating current board.
   *
   * @param newTitle new title of list.
   */
  function editList(newTitle: string | null) {
    //If newTitle equals null, user enter invalid name
    if (newTitle == null) {
      toast.error("Error! Lisr name is invalid");
    } else if (title !== newTitle) {
      const fetchData = async () => {
        try {
          // Send a PUT request to update the list name
          await api.put("board/" + board_id + "/list/" + id, {
            title: newTitle,
          });
          updateBoard(); // Update the board state with the new data after successful editing
          toast.success("List name successfully changed"); // Display a success message
        } catch (error) {
          toast.error("Error! List name hasn't been changed"); // If an error occurs during the editing
          console.error("Error during request: ", error); // Log the error to the console for debugging purposes
        }
      };
      fetchData();
    }
    setEditingList(false);
  }

  /**
   * Deleting of the current list and updating current board.
   */
  async function deleteList() {
    try {
      // Send a DELETE request to delete the list
      await api.delete("board/" + board_id + "/list/" + id);
      toast.success("List successfully deleted"); // If the deletion is successful, show a success message
      updateBoard(); // Update the board state with the new data after successful deleting
    } catch (error) {
      toast.error("Error! Failed to delete list"); // If an error occurs during the deletion process
      console.error("Error during request: ", error); // Log the error to the console for debugging purposes
    }
  }

  /**
   * Creating the new card and updating current board.
   *
   * @param titleCard title of the new card.
   */
  function createCard(titleCard: string | null) {
    setCreatingCard(false);
    //If titleCard equals null, user enter invalid name
    if (titleCard === null) {
      toast.error("Error! Failed to create card");
    } else {
      //Define the correct position for new card
      const lastCard = cards[cards?.length - 1];
      let position = lastCard === undefined ? 0 : lastCard.position;

      const fetchData = async () => {
        try {
          // Send a POST request to create a new card
          await api.post("board/" + board_id + "/card/", {
            title: titleCard,
            list_id: id,
            position: ++position,
          });
          updateBoard(); // Retrieve the updated board data after creating the list
          toast.success("Card successfully created"); // Display a success toast message
        } catch (error) {
          toast.error("Error! Failed to create card"); // If an error occurs during the creation process
          console.error("Error during request:", error); // Log the error to the console for debugging purposes
        }
      };
      fetchData();
    }
  }

  /** Start LOGIC OF DRAG-N-DROP (Case for empty list) */

  /**
   * Creating a drop-zone slot in empty list.
   * 
   * @param event The drag event that triggered the method.
   */
  function dragEnter(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault(); // Prevent the default behavior of the drag event, which may interfere with the custom logic

    // If list is empty, then create the drop-zone
    if (!cards.length || cards.length === 0) {
      const cardContainer = event.target as HTMLElement;
      const slots = cardContainer?.querySelectorAll(".drop");
      if (!slots?.length) {
        const slot = createDropZone();
        cardContainer.lastElementChild?.insertAdjacentElement(
          "beforebegin",
          slot
        );
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
    slot.addEventListener("drop", onDragDrop);
    slot.classList.add("drop");
    return slot;
  }

  /**
   * Handles the event when a draggable element leaves a drop zone.
   * 
   * @param event The drag event that triggered the method.
   */
  function onDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const target = event.target as HTMLElement;
    const containerCoordinate = target!.getBoundingClientRect();

    // Check if the mouse pointer is outside the boundaries of the container
    if (
      event.clientX < containerCoordinate.left ||
      event.clientX > containerCoordinate.right ||
      event.clientY < containerCoordinate.top ||
      event.clientY > containerCoordinate.bottom - 5
    ) {
      // Remove all drop slots within the card container
      const slots = target!.querySelectorAll(".drop");
      slots.forEach((slot: any) => slot.remove());
    }
  }

  /**
   *  This method handles the logic when a drag event triggers the drop action for a card.
   * 
   * @param event The drag event that triggered the method.
   */
  async function onDragDrop(event: DragEvent): Promise<void> {
    event.preventDefault(); // Prevent the default behavior of the drag event, which may interfere with the custom logic

     // Extract data about the dragged card from the drag event
    const dataDrag = JSON.parse(
      event.dataTransfer!.getData("application/json")
    );
    try {
      // Send a PUT request to the API to edit position of the dragged card
      await api.put("board/" + board_id + "/card/", [
        {
          id: dataDrag.idCard,
          position: 1,
          list_id: id,
        },
      ]);
      toast.success("Card successfully moved"); // If the editing is successful, show a success message
    } catch (error) {
      toast.error("Error! Failed to move card");  // If an error occurs during the editing process
      console.error("Error during request:", error); // Log the error to the console for debugging purposes
    }

    // Array to store the request data for updating card positions in original list
    const requestData: any[] = [];
    for (const card of dataDrag.oldList.slice(dataDrag.position)) {
      requestData.push({
        id: card.id,
        position: card.position - 1,
        list_id: dataDrag.oldIdList,
      });
    }

    const fetchData = async () => {
      try {
        // Send a PUT request to update positions in the original list
        await api.put("board/" + board_id + "/card/", requestData);
        updateBoard();// Retrieve the updated board data after updating the positions
      } catch (error) {
        console.error("Error during request:", error); // Log the error to the console for debugging purposes
      }
    };
    fetchData();

    // Delete the drop-zone after dragging of card.
    const dropZone = event.target as HTMLElement;
    dropZone?.remove();
  }

  /** Finish LOGIC OF DRAG-N-DROP */

  return (
    <div
      className="list__wrapper"
      onDragEnter={cards.length === 0 ? dragEnter : undefined}
      onDragLeave={cards.length === 0 ? onDragLeave : undefined}
    >
      <button className="btn btn__del-list" onClick={deleteList}>
        X
      </button>
      {!editingList && (
        <h2 className="title list__title" onClick={() => setEditingList(true)}>
          {title}
        </h2>
      )}
      {editingList && (
        <ValidatedInput
          previousValue={title}
          onEnter={(inputValue: string) => editList(inputValue)}
          onLostFocus={(inputValue: string | null) => editList(inputValue)}
        ></ValidatedInput>
      )}
      <div className="cards__wrapper">{cardsElements}</div>

      {creatingCard && (
        <ValidatedInput
          onLostFocus={(inputValue: string | null) => createCard(inputValue)}
          onEnter={(inputValue: string) => createCard(inputValue)}
        ></ValidatedInput>
      )}
      {!creatingCard && (
        <button
          className="btn btn__add-card"
          onClick={() => setCreatingCard(true)}
        >
          +Add card
        </button>
      )}
    </div>
  );
}
