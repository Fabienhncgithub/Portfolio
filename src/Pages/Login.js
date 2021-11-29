import React from "react";
import Profile from "../components/Profile";
import { useAuth0 } from "@auth0/auth0-react";

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
