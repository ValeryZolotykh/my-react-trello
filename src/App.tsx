import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Board from "./pages/Board/components/Board/Board";
import Home from "./pages/Home/Home";
import { ToastContainer } from "react-toastify";
import ModalWindow from "./components/modal-window";

function App() {
  return (
    <Router>
      <ToastContainer
        position="bottom-right" // Позиция уведомлений
        autoClose={2500} // Время, через которое уведомление автоматически закроется (в миллисекундах)
        theme={"dark"} // Тема уведомлений
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="board/:board_id" element={<Board />}>
          <Route path="card/:card_id" element={<ModalWindow />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
