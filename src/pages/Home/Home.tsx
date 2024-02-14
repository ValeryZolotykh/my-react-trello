import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import "./Home.css";
import api from "../../api/request";
import { IBoards } from "../../common/interfaces/Boards";
import Board from "./components/Board/Board";
import ValidatedInput from "../../components/validated-input";
import ProgressBar from "../../components/progress-bar";

import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// export class Home extends React.Component {
export default function Home() {
  const [boards, setBoards] = useState<IBoards[]>([]);
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [valid, setValid] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<{ boards: IBoards[] }>("board");
        const res = response.data.boards;
        console.log(res);
        setBoards(res);
      } catch (error) {
        console.error("Ошибка при получении данных:", error);
      }
    };
    fetchData();
  }, []);

  const boardList = boards.map((board:IBoards) => (
    <Board
      key={board.id}
      id={board.id}
      title={board.title}
      background={board.custom.background}
    />
  ));

  function createBoard(inputValue: string) {
    setCreatingBoard(false);
    const fetchData = async () => {
      try {
        await api.post("board", {
          title: inputValue,
          custom:{background:color}
        });
        const response = await api.get<{ boards: IBoards[] }>("board");
        setBoards(response.data.boards);
        toast.success('The board was created successfully!');
      } catch (error) {
        toast.error('Error! Board not created');
        console.error("Ошибка при получении данных:", error);
      }
    };
    fetchData();
  }
  const presetColors = ['var(--color_component)', 'rgb(139,218,252)', '#a4ff90', '#ff8f8f']; // Добавьте свои предопределенные цвета

  const [color, setColor] = useState(presetColors[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleColorChange = (event:any) => {
    setColor(event.target.value);
  };

  const toggleColorPicker = () => {
    setShowColorPicker(!showColorPicker);
  };


  // render() {
  return (
    <div className="boards__wrapper">
      <h1 className="title boards__title">My Boards:</h1>
      <ProgressBar />
      <div className="boards__items">
        {boardList}
        {!creatingBoard && (
          <button
            className="btn btn__add-board"
            onClick={() => setCreatingBoard(true)}
          >
            +Add board
          </button>
        )}

        {creatingBoard && (
          <div className="form form-create-board">
            <button className="btn btn__close-creating-board" onClick={()=>{setCreatingBoard(false)}}>X</button>
            <label className="title title-form">Enter title</label>
            <ValidatedInput
                checkValid={(valid: boolean) =>  setValid(valid)}
                onLostFocus={(inputValue: string|null) => {if(valid && inputValue!==null){setValue(inputValue);}}}
            ></ValidatedInput>

            <div className="colors__container">
              {presetColors.map((presetColor, index) => (
                  <label className="label__colors" key={index} >
                    <input
                        className="colors__input"
                        type="radio"
                        value={presetColor}
                        checked={color === presetColor}
                        onChange={handleColorChange}
                        style={{ marginRight: '5px' }}
                    />
                    <div
                        className="color__variant"
                        style={{
                          backgroundColor: presetColor,
                        }}
                    />
                  </label>
              ))}
              <br />
            </div>


            <button
              type="submit"
              className="btn btn__create-board"
              disabled={!valid}
              onClick={()=> { if (valid) {createBoard(value)}}}
            >
              Create board
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
