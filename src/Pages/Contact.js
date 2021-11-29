import React from "react";
import Title from "../components/Title";
import ButtonMailto from"../components/ButtonMailto";




const Contact = ({ mailto, label }) => {


  return (
    <>
     <div className="App">
    <Title name="Let's talk" />

      let's start the conversation and make something happen:
      <span> </span>
      
      <ButtonMailto  label="contact@fabienhance.com" mailto="mailto:contact@fabienhance.com" />
     
    </div>
   
  </>
  );
};

export default Contact;
