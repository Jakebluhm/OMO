import React from 'react';
import { useState } from 'react';

function PromptComponent({ prompt, onButtonClick  }) {
  const [isAnswered, setIsAnswered] = useState(false);

  const handleOddManOutSelected = () => {
    console.log('Odd man out selected');
    setIsAnswered(true); 
    onButtonClick({[prompt.id]: false});
  }

  const handleTruthTellerSelected = () => {
    console.log('Truth teller selected');
    setIsAnswered(true);
    onButtonClick({[prompt.id]: true});
  }

  const divStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isAnswered ? 'lightgrey' : 'white',
  };

  return (
    <div style={divStyle}>
      <button label={prompt.id} onClick={handleOddManOutSelected} style={{ marginRight: 10, width: 50 }}> {prompt.omoAns} </button>
      <label style={{ flex: 1, wordWrap: "break-word", maxWidth: "300px", textAlign: 'center', padding: 5 }}>{prompt.question}</label>
      <button label={prompt.id} onClick={handleTruthTellerSelected} style={{ marginLeft: 10, width: 50 }}> {prompt.notOmoAns} </button>
    </div>
  );
}
export default PromptComponent;