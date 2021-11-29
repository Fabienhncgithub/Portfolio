import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import NavBar from "./components/NavBar";
import Contact from "./Pages/Contact";
import Home from "./Pages/MainPage";
import Login from "./Pages/Login";


function App() {
  const { isLoading } = useAuth0;

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Router>
        <NavBar />
      
        <Routes>
          <Route path="//*" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
