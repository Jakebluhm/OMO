// IntermediateComponent.js

import React, { useEffect, useRef } from "react";

const IntermediateComponent = (props) => {
  const params = props.history.location.state;
  const playerName = params.playerName.playerName;
  const uid = params.uid;
  var userData = params.userData;
  const newGame = params.newGame;
  const dummyPrompts = params.dummyPrompts;

  console.log("playerName");
  console.log(playerName);
  console.log("uid");
  console.log(uid);
  console.log("userData");
  console.log(userData);
  console.log("newGame");
  console.log(newGame);
  console.log("dummyPrompts");
  console.log(dummyPrompts);

  const hasStartSearchBeenCalled = useRef(false);
  useEffect(() => {
    // Callback for confirm under Name entry
    async function startSearch() {
      console.log("startSearch() Establishing WebSocket Connection");
      if(newGame != null){
        userData.Item.gameHistory.push(newGame);
      }
      console.log("userData.Item.gameHistory");
      console.log(userData.Item.gameHistory);

      console.log("---------Game History--------");
      console.log(userData.Item.gameHistory);

      const gameHistoryString = encodeURIComponent(
        JSON.stringify(userData.Item.gameHistory)
      );
      // Establish WebSocket connection when the user clicks confirm
      const ws = new WebSocket(
        `wss://1myegfct68.execute-api.us-east-1.amazonaws.com/production/?userId=${
          userData.Item.user
        }&prompts=${encodeURIComponent(
          JSON.stringify(userData.Item.prompts)
        )}&gameHistory=${gameHistoryString}`
      );

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("---INSIDE ws.onmessage !!!!!!!!");
        console.log("message");
        console.log(message);

        if (message.action === "sendURL") {
          const uuid = message.uuid;
          const promptId = message.promptId;

          // Find the corresponding prompt object and parse its value
          const prompt = userData.Item.prompts.find(
            (p) => Object.keys(JSON.parse(p))[0] === promptId
          );
          const oddOneOutValue = JSON.parse(prompt)[promptId];

          console.log("oddOneOutValue");
          console.log(oddOneOutValue);

          console.log("Type of promptId");
          console.log(typeof promptId);

          console.log("promptId");
          console.log(promptId);

          console.log("Type of dummyPrompts[0].id");
          console.log(typeof dummyPrompts[0].id);

          console.log("dummyPrompts");
          console.log(dummyPrompts);

          const matchingPrompt = dummyPrompts.find(
            (promptObj) => promptObj.id === Number(promptId)
          );
          console.log("matchingPrompt");
          console.log(matchingPrompt);

          setTimeout(() => {
            props.history.push(`/room/${uuid}`, {
              playerName: playerName,
              oddOneOut: oddOneOutValue,
              uid: uid,
              prompt: matchingPrompt,
              userData: userData,
              dummyPrompts: dummyPrompts,
            });
          }, 10);
        }
      };
    }

    if (!hasStartSearchBeenCalled.current) {
      // Check the ref value
      try {
        console.log("About to call startSearch");
        startSearch();
        hasStartSearchBeenCalled.current = true; // Set the ref value to true
        console.log("startSearch has been called");
      } catch (error) {
        console.error("Error starting search:", error);
      }
    }
  }, [dummyPrompts, newGame, playerName, props.history, uid, userData]);

  return (
    <div>
      <h1>Finding next game</h1>
      <p>Searching...</p>
    </div>
  );
};

export default IntermediateComponent;
