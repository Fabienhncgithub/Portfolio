import React, { useState } from "react";
import ImageGrid from "../components/ImageGrid";
import Title from "../components/Title";
import UploadForm from "../components/UploadForm";
import Modal from "../components/Modal";

import { useAuth0 } from "@auth0/auth0-react";

function MainPage() {
  const [selectedImg, setSelectedImg] = useState(null);
  const { isLoading } = useAuth0;

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <div className="App">
      <Title name="Portfolio"/>
        <UploadForm />
        <ImageGrid setSelectedImg={setSelectedImg} />
        {selectedImg && (
          <Modal selectedImg={selectedImg} setSelectedImg={setSelectedImg} />
        )}
      </div>
    </>
  );
}

export default MainPage;
