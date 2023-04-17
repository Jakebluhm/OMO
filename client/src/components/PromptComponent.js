import React from "react";
import { useState } from "react";

function PromptComponent({ prompt, onButtonClick }) {
  const [isAnswered, setIsAnswered] = useState(false);

  const handleIdentityASelected = () => {
    console.log("Identity A selected");
    setIsAnswered(true);
    onButtonClick({ [prompt.id]: 0 });
  };

  const handleIdentityBSelected = () => {
    console.log("Identity B selected");
    setIsAnswered(true);
    onButtonClick({ [prompt.id]: 1 });
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
        label={prompt.id}
        onClick={handleIdentityASelected}
        style={{ marginRight: 10, width: 150 }}
      >
        {prompt.identityA}
      </button>
      <button
        label={prompt.id}
        onClick={handleIdentityBSelected}
        style={{ marginLeft: 10, width: 150 }}
      >
        {prompt.identityB}
      </button>
    </div>
  );
}
export default PromptComponent;
