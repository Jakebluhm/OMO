import React from "react";
import { useState } from "react";

function PromptComponent({ prompt, onButtonClick }) {
  const [isAnswered, setIsAnswered] = useState(false);
  const [aSelected, setASelected] = useState(false);
  const [bSelected, setBSelected] = useState(false);

  const handleIdentityASelected = () => {
    console.log("Identity A selected");
    setIsAnswered(true);
    setASelected(true);
    setBSelected(false);
    onButtonClick({ [prompt.id]: 0 });
  };

  const handleIdentityBSelected = () => {
    console.log("Identity B selected");
    setIsAnswered(true);
    setBSelected(true);
    setASelected(false);
    onButtonClick({ [prompt.id]: 1 });
  };

  const buttonStyleA = {
    marginRight: 10,
    width: 150,
    border: aSelected ? "3px solid red" : "none",
  };

  const buttonStyleB = {
    marginLeft: 10,
    width: 150,
    border: bSelected ? "3px solid red" : "none",
  };

  const divStyle = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isAnswered ? "lightgrey" : "white",
  };

  return (
    <div style={divStyle}>
      <button
        name={"identityA" + prompt.id}
        label={prompt.id}
        onClick={handleIdentityASelected}
        style={buttonStyleA}
      >
        {prompt.identityA}
      </button>
      <button
        name={"identityB" + prompt.id}
        label={prompt.id}
        onClick={handleIdentityBSelected}
        style={buttonStyleB}
      >
        {prompt.identityB}
      </button>
    </div>
  );
}
export default PromptComponent;
