import React from "react";
import LoginButton from "../components/LoginButton";
import LogoutButton from "../components/LogoutButton";
import Profile from "../components/Profile";
import { useAuth0 } from "@auth0/auth0-react";
import NavBar from "../components/NavBar";

function Login() {
  const { isLoading } = useAuth0;

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
        <Profile />
      </>
  );
}

export default Login;
