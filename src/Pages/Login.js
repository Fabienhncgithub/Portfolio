import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ImageGrid from "../components/ImageGrid";
import Title from "../components/Title";
import UploadForm from "../components/UploadForm";
import Modal from "../components/Modal";
import LoginButton from "../components/LoginButton";
import LogoutButton from "../components/LogoutButton";
import Profile from "../components/Profile";
import { useAuth0 } from "@auth0/auth0-react";
import NavBar from "../components/NavBar";

function Login() {
  const [selectedImg, setSelectedImg] = useState(null);
  const { isLoading } = useAuth0;

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <NavBar />
        <LoginButton />
        <LogoutButton />
        <Profile />

     

      </>
  );
 
}


export default Login;