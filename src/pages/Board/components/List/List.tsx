import { ICard } from "../../../../common/interfaces/Card";
import Card from "../Card/Card";
import "./list.css";
import api from "../../../../api/request";
import { useParams } from "react-router-dom";
import React, { useState } from "react";
import ValidatedInput from "../../../../components/validated-input";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

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
    <Card id={card.id} title={card.title} position={card.position} description={card.description} idList={id} cardsList={cards} updateBoard={updateBoard}/>
  ));

  function editList(inputValue: string | null) {
    if (title !== inputValue) {
      const fetchData = async () => {
        try {
          await api.put("board/" + board_id + "/list/" + id, {
            title: inputValue,
          });
          toast.success("List name successfully changed");
          updateBoard();
        } catch (error) {
          toast.error("Error! List name hasn't been changed");
          console.error("Ошибка при запросе ", error);
        }
      };
      fetchData();
    }
    setEditingList(false);
  }

  function deleteList() {
    const fetchData = async () => {
      try {
        await api.delete("board/" + board_id + "/list/" + id);
        toast.success("List successfully deleted");
        updateBoard();
      } catch (error) {
        toast.error("Error! Failed to delete list");
        console.error("Ошибка при запросе ", error);
      }
    };
    fetchData();
  }

  function createCard(inputValue: string | null) {
    setCreatingCard(false);
    if(inputValue===null) {
      toast.error("Error! Failed to create card");
    }else{
      const lastCard = cards[cards?.length - 1];
      let position = lastCard === undefined ? 0 : lastCard.position;

      const fetchData = async () => {
        try {
          await api.post("board/" + board_id + "/card/", {
            title: inputValue,
            list_id: id,
            position: ++position,
          });
          updateBoard();
          toast.success("Card successfully created");
        } catch (error) {
          toast.error("Error! Failed to create card");
          console.error("Ошибка при запросе ", error);
        }
      };
      fetchData();}
  }

  function dragEnter(event: React.DragEvent<HTMLDivElement>) {
    // console.log("Empty list")
    event.preventDefault(); // Prevent the default behavior of the drag event, which may interfere with the custom logic
    // If list is empty, then create the drop-zone
    if (!cards.length || cards.length===0) {
      const cardContainer = event.target as HTMLElement;
      const slots = cardContainer?.querySelectorAll('.drop');
      if (!slots?.length) {
        const slot = createDropZone();
        cardContainer.lastElementChild?.insertAdjacentElement('beforebegin', slot);
      }
    }
  }
  /**
   * Creates a drop zone element and returns it. The drop zone is a div element with specified styles and a 'drop' class.
   * It is used to handle drag-and-drop events for elements that can be dropped onto it.
   * @returns {HTMLElement} The created drop zone element.
   */
  function createDropZone(): HTMLElement {
    const slot = document.createElement('div');
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
    slot.addEventListener('dragover', (event) => {
      event.preventDefault();
    });
    slot.addEventListener('drop', onDragDrop);
    slot.classList.add('drop');
    return slot;
  }

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
      const slots = target!.querySelectorAll('.drop');
      slots.forEach((slot: any) => slot.remove());
    }
  }

  async function onDragDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    // console.log("YA TOLKO V PUSTOM LISTE MUST BE");
    const dataDrag = JSON.parse(event.dataTransfer!.getData('application/json'));
    try {
      await api.put("board/" + board_id + "/card/", [{
        id: dataDrag.idCard,
        position: 1,
        list_id: id,
      }]);
      toast.success("Card successfully moved");
    } catch (error) {
      toast.error("Error! Failed to move card");
      console.error("Ошибка при запросе ", error);
    }


    const requestData: any[] = [ ];
    for (const card of dataDrag.oldList.slice(dataDrag.position)) {
      requestData.push({
        id: card.id,
        position: card.position - 1,
        list_id: dataDrag.oldIdList,
      });
    }
    const fetchData = async () => {
      try {
        await api.put("board/" + board_id + "/card/" , requestData);
        updateBoard();
      } catch (error) {
        console.error("Ошибка при запросе ", error);
      }
    };
    fetchData();
    const dropZone = event.target as HTMLElement;
    dropZone?.remove();
  }

    return (
    <div className="list__wrapper" onDragEnter={cards.length === 0 ? dragEnter : undefined}  onDragLeave={cards.length === 0 ? onDragLeave : undefined}>
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
          onLostFocus={(inputValue:string | null) => editList(inputValue)}
        ></ValidatedInput>
      )}
      <div className="cards__wrapper" >{cardsElements}</div>

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
