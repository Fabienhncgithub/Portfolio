import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ImageGrid from "../components/ImageGrid";
import Title from "../components/Title";
import UploadForm from "../components/UploadForm";
import Modal from "../components/Modal";

import { useAuth0 } from "@auth0/auth0-react";
import NavBar from "../components/NavBar";


function MainPage() {
  const [selectedImg, setSelectedImg] = useState(null);
  const { isLoading } = useAuth0;

  if (isLoading) return <div>Loading...</div>;

  return (
    <Router>
      <NavBar />
      <div className="App">
        <Title />
        <UploadForm />
        <ImageGrid setSelectedImg={setSelectedImg} />
        {selectedImg && (
          <Modal selectedImg={selectedImg} setSelectedImg={setSelectedImg} />
        )}
      </div>
    </Router>
  );
}


export default MainPage;