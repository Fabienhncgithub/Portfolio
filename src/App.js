import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import ImageGrid from "./components/ImageGrid";
import Title from "./components/Title";
import UploadForm from "./components/UploadForm";
import Modal from "./components/Modal";
import LoginButton from "./components/LoginButton";
import LogoutButton from "./components/LogoutButton";
import Profile from "./components/Profile";

function App() {
  const [selectedImg, setSelectedImg] = useState(null);
  console.log(Profile)

  return (
    <Router>
      <div className="App">
        <LoginButton />
        <LogoutButton />
        <Profile />

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

export default App;
