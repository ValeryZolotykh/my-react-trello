import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Board from "./pages/Board/components/Board/Board";
import Home from "./pages/Home/Home";
import { ToastContainer } from "react-toastify";
import ModalWindow from "./components/modal-window";

function App() {
  return (
    <Router>
      <ToastContainer
        /* Configuration for popup notifications */
        position="bottom-right" // Notification position
        autoClose={2500} // Time after which the notification will automatically close (in milliseconds)
        theme={"dark"} // Notification theme
      />
      <Routes>
        <Route path="/my-react-trello" element={<Home />} />
          <Route path="/my-react-trello/board/:board_id" element={<Board />}>
            <Route path="card/:card_id" element={<ModalWindow />} />
          </Route>
      </Routes>
    </Router>
  );
}

export default App;
