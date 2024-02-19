import React, { useEffect, useState } from "react";
import "./Home.css";
import api from "../../api/request";
import { IBoards } from "../../common/interfaces/Boards";
import Board from "./components/Board/Board";
import ValidatedInput from "../../components/validated-input";
import ProgressBar from "../../components/progress-bar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [boards, setBoards] = useState<IBoards[]>([]);
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [valid, setValid] = useState(false);
  const [value, setValue] = useState("");

 // Effect to fetch data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Send a GET request to the API to get all boards
        const response = await api.get<{ boards: IBoards[] }>("board");
        setBoards(response.data.boards);
      } catch (error) {
        console.error("Error fetching data:", error); // If an error occurs during the update process
      }
    };
    fetchData();
  }, []);

  const boardsList = boards.map((board: IBoards) => (
    <Board
      key={board.id}
      id={board.id}
      title={board.title}
      background={board.custom.background}
    />
  ));

  /**
   * Creating the new board and updating current boards.
   *
   * @param titleBoard  title of the new board.
   */
  function createBoard(titleBoard: string) {
    setCreatingBoard(false);

    const fetchData = async () => {
      try {
        // Send a POST request to create a new board
        await api.post("board", {
          title: titleBoard,
          custom: { background: colorBoard },
        });
        //Updating the data with all boards
        const response = await api.get<{ boards: IBoards[] }>("board");
        setBoards(response.data.boards);
        toast.success("The board was created successfully!"); // Display a success toast message
      } catch (error) {
        toast.error("Error! Board not created"); // If an error occurs during the creation process
        console.error("Error during request:", error); // Log the error to the console for debugging purposes
      }
    };
    fetchData();
  }

  const presetColors = [
    "var(--color_component)",
    "var(--color_first-variant-for-board)",
    "var(--color_second-variant-for-board)",
    "var(--color_third-variant-for-board)",
  ];

  const [colorBoard, setColorBoard] = useState(presetColors[0]);

  /**
   *  Save the color which user chose for board. Extract the selected color value from the event object and update the state.
   *
   *
   * @param event The event object triggered when the color selection changes.
   */
  const handleColorChange = (event: any) => setColorBoard(event.target.value);

  return (
    <div className="boards__wrapper">
      <h1 className="title boards__title">My Boards:</h1>
      <ProgressBar />
      <div className="boards__items">
        {boardsList}
        {!creatingBoard && (
          <button
            className="btn btn__add-board"
            onClick={() => setCreatingBoard(true)}
          >
            +Add board
          </button>
        )}

        {creatingBoard && (
          <div className="boards__form-create-board">
            <button
              className="btn btn__close-creating-board"
              onClick={() => {
                setCreatingBoard(false);
              }}
            >
              X
            </button>
            <label className="title boards__form-create-list--title">
              Enter title
            </label>
            <ValidatedInput
              checkValid={(valid: boolean) => setValid(valid)}
              onLostFocus={(inputValue: string | null) => {
                if (valid && inputValue !== null) {
                  setValue(inputValue);
                }
              }}
            ></ValidatedInput>

            <div className="boards__choose-color-for-board">
              {presetColors.map((presetColor, index) => (
                <label
                  className="boards__choose-color-for-board--label"
                  key={index}
                >
                  <input
                    className="boards__choose-color-for-board--variants"
                    type="radio"
                    value={presetColor}
                    checked={colorBoard === presetColor}
                    onChange={handleColorChange}
                  />
                  <div
                    className="boards__choose-color-for-board--variant"
                    style={{
                      backgroundColor: presetColor,
                    }}
                  />
                </label>
              ))}
              <br />
            </div>

            <button
              className="btn btn__create-board"
              type="submit"
              disabled={!valid}
              onClick={() => {
                if (valid) {
                  createBoard(value);
                }
              }}
            >
              Create board
            </button>
          </div>
        )}
      </div>
    </div>
  );
}