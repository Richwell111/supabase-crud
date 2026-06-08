import React from "react";
import NotesView from "./pages/NotesView";
import Note from "./pages/Note";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<NotesView />} />
        <Route path="/note/:id" element={<Note />} />
      </Routes>
    </>
  );
}

export default App;