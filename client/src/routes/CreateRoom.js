import React, { useState, useEffect } from "react";
import { v1 as uuid } from "uuid";
import Modal from "react-modal";

import "../ModalStyles/ModalStyle.css";

import AWS from "aws-sdk";
import { putData } from "../awsLib/awsFunctions.js";
import PromptComponent from "../components/PromptComponent";

const CreateRoom = (props) => {
  const [promptClicked, setPromptClicked] = useState({});

  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  const [items, setItems] = useState([]);

  const [name, setname] = useState("");
  const [uuidNum, setuuid] = useState("");

  // Modal State
  const [isSearchingModalOpen, setIsOpen] = useState(false);
  //const [modalIndex, setModalIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(-1); // 1 is omo, 0 is not omo

  const [userData, setUserData] = useState({
    TableName: "OMOUserQueue",
    Item: {
      user: uuid(),
      prompts: [],
    },
  });

  // useEffect(() => {
  //     console.log('selectedAnswer was updated')
  //     // console.log('selectAnswer')
  //     // console.log(selectAnswer)

  //     console.log('userData')
  //     console.log(userData)

  //     const params = {
  //       TableName: "OMOUserQueue"
  //     };

  //     // dynamoDb.scan(params, (err, data) => {
  //     //     if (err) {
  //     //       console.error(err);
  //     //     } else {
  //     //         console.error('data.Items');
  //     //         console.error(data.Items);
  //     //       setItems(data.Items);
  //     //     }
  //     //   });

  //     if(selectedAnswer !== -1){
  //         console.log("dummyPrompts.find(element => element.id === modalIndex).uuid  --- Calling create" )
  //         console.log(dummyPrompts.find(element => element.id === modalIndex).uuid)
  //         //create(dummyPrompts.find(element => element.id === modalIndex).uuid);
  //     }
  //     // TODO:Check for valid answer, rooms will already have an omo and new omo should be prevented from entering

  // }, [selectedAnswer]);

  // This runs on mount and establishes a listener for a websocket signal from aws lambda
  // That tells the client the url of the Room this user has been matched to.
  // useEffect(() => {
  //   const userData = {
  //     TableName: "OMOUserQueue",
  //     Item: {
  //       user: uuid(),
  //       prompts: [],
  //     },
  //   };

  //   const ws = new WebSocket(
  //     `wss://86sw6hpi28.execute-api.us-east-1.amazonaws.com/production/?userId=${
  //       userData.Item.user
  //     }&prompts=${JSON.stringify(userData.Item.prompts)}`
  //   );

  //   // const ws = new WebSocket(
  //   //   "wss://86sw6hpi28.execute-api.us-east-1.amazonaws.com/production/"
  //   // );

  //   ws.onmessage = (event) => {
  //     const message = JSON.parse(event.data);

  //     if (message.action === "sendURL") {
  //       const url = message.url;
  //       // Redirect the user to the URL received from the Lambda function
  //       window.location.href = url;
  //     }
  //   };

  //   return () => {
  //     if (ws && ws.readyState === WebSocket.OPEN) {
  //       ws.close();
  //     }
  //   };
  // }, []);
  // Callback for confirm under Name entry
  async function startSearch() {
    console.log("startSearch() Establishing WebSocket Connection");

    // Establish WebSocket connection when the user clicks confirm
    const ws = new WebSocket(
      `wss://86sw6hpi28.execute-api.us-east-1.amazonaws.com/production/?userId=${
        userData.Item.user
      }&prompts=${JSON.stringify(userData.Item.prompts)}`
    );

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("---INSIDE ws.onmessage !!!!!!!!");
      console.log("message");
      console.log(message);

      if (message.action === "sendURL") {
        const url = message.url;
        // Redirect the user to the URL received from the Lambda function
        window.location.href = url;
      }
    };
  }

  useEffect(() => {
    console.log("userData:", userData);
  }, [userData]);

  useEffect(() => {
    const unloadHandler = () => {
      // Code to execute when user leaves the website
      console.log("User is leaving the website...");
      if (isSearchingModalOpen) {
        // User is searching for game and has exited, delete AWS DynamoDB entry
        console.log("User is leaving the website and searching for game...");
      }
    };

    window.addEventListener("beforeunload", unloadHandler);

    return () => {
      window.removeEventListener("beforeunload", unloadHandler);
    };
  }, []);

  const handlePromptClick = (buttonLabel) => {
    console.log("-----------handlePromptClick-----");
    console.log(buttonLabel);
    setPromptClicked(buttonLabel);

    // Adding answered prompts to userData
    setUserData((prevState) => {
      const promptId = buttonLabel.promptId;
      const existingIndex = prevState.Item.prompts.findIndex((prompt) => {
        return (
          Object.keys(JSON.parse(prompt))[0] === Object.keys(buttonLabel)[0]
        );
      });

      if (existingIndex === -1) {
        // If the promptId doesn't exist in the array, add the new answer
        return {
          ...prevState,
          Item: {
            ...prevState.Item,
            prompts: [...prevState.Item.prompts, JSON.stringify(buttonLabel)],
          },
        };
      } else {
        // If the promptId exists in the array, replace the existing answer with the new one
        const promptsCopy = [...prevState.Item.prompts];
        promptsCopy[existingIndex] = JSON.stringify(buttonLabel);
        return {
          ...prevState,
          Item: {
            ...prevState.Item,
            prompts: promptsCopy,
          },
        };
      }
    });
  };

  // Toggle modal
  function toggleModal() {
    console.log("toggleModal()");

    //Only set id on open
    // if(!isSearchingModalOpen){
    //     console.log('id')
    //     console.log(id)
    //     setModalIndex(id)
    // }
    setIsOpen(!isSearchingModalOpen);
  }

  function cancelSearch() {
    console.log("cancelSearch()");
    setIsOpen(!isSearchingModalOpen);
  }

  // function selectAnswer(ans){
  //     console.log("selectAnswer()")
  //     console.log('ans')
  //     console.log(ans)
  //     setSelectedAnswer(ans)
  //     //create();
  // }

  function create(id) {
    console.log("create()");
    const uid = uuid();
    // console.log(name)
    props.history.push(`/room/${id}`, {
      playerName: name,
      oddOneOut: selectedAnswer,
      uid: uid,
    });
  }

  // Callback for joining with a specific UUID
  function join() {
    console.log("join()");
    // console.log('uuidNum.length')
    // console.log(uuidNum.length)
    if (uuidNum.length > 20) {
      // console.log('uuid is 128 in length')
    } else {
      // console.log('uuid is NOT 128 in length')
      return;
    }
    // console.log(uuid + ' < Joining ')
    props.history.push(`/room/${uuidNum}`, { playerName: name });
  }

  // Callback for confirm under Name entry
  // async function startSearch() {
  //   console.log("startSearch()");

  //   console.log("'name': " + name);

  //   try {
  //     const data = await dynamoDb.put(userData).promise();
  //     console.log("Success", data);
  //     console.log("toggling modal");
  //     toggleModal();
  //   } catch (err) {
  //     console.log("Error", err);
  //   }
  // }
  const handleNameChange = (e) => {
    console.log(`New name value: ${e.target.value}`);
    const currentName = e.target.value;
    //if (e.target && e.target.value) {
    setname(e.target.value);
    //userData.Item['name'] = e.target.value
    setUserData((prevState) => ({
      ...prevState,
      Item: {
        ...prevState.Item,
        name: currentName,
      },
    }));

    // console.log('userData')
    // console.log(userData)
    //}
  };

  const style = {
    display: "flex",
    paddingTop: 50,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "..",
    height: "..",
  };
  const listItemStyle = { padding: 10 };

  // These will be read in from database
  // TODO: UUID can be assigned when prompt is created
  const dummyPrompts = [
    {
      id: 0,
      uuid: "abc123",
      prompt: "Prompt 1",
      question: "Are you a Kanye West Fan?",
      omoAns: "No",
      notOmoAns: "Yes",
      count: 0,
    },
    {
      id: 1,
      prompt: "Prompt 2",
      uuid: "xyz789",
      question: "Are you apart of the LGBTQIA+ community and or non-bindary?",
      omoAns: "No",
      notOmoAns: "Yes",
      count: 0,
    },
    {
      id: 2,
      prompt: "Prompt 3",
      uuid: "jkl456",
      question: "Are you married",
      omoAns: "Yes",
      notOmoAns: "No",
      count: 0,
    },
  ];

  // <button onClick={create}>{dummyPrompts[0]}</button>
  return (
    <div style={style}>
      <div>
        <h2>AWS DynamoDB Document Client</h2>
        {items.map((item) => (
          <div key={item.id}>
            <p>{item.user + " - " + item.name}</p>
          </div>
        ))}
      </div>

      <div
        style={{
          paddingBottom: 50,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <label style={{ padding: 5 }}> Enter name</label>
        <input
          onChange={(e) => {
            handleNameChange(e);
          }}
          type="text"
          placeholder="name"
          value={name}
        ></input>
        <button
          disabled={
            userData.Item.prompts.length === 0 ||
            !userData.Item.name ||
            userData.Item.name.length === 0
          }
          onClick={startSearch}
          key={"startSearchButton"}
        >
          Confirm
        </button>
      </div>
      {/* <div style={{paddingBottom:50, display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center',}}>
                <label style={{padding:5}}> Enter uuid</label>
                <input type="text" placeholder="uuid" value={uuidNum} onChange={e => setuuid(e.target.value)}></input>
                <button  onClick={join} key={'joinUUID'}>Join with UUID</button> 
            </div>      */}
      <label style={{ padding: 5 }}>
        Answer one or more questions below to be able to play OMO
      </label>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {dummyPrompts.map((prompt) => (
          <PromptComponent prompt={prompt} onButtonClick={handlePromptClick} />
        ))}
      </div>
      <Modal
        isOpen={isSearchingModalOpen}
        onRequestClose={toggleModal}
        contentLabel="My dialog"
        className="mymodal"
        overlayClassName="myoverlay"
        closeTimeoutMS={500}
      >
        <div className="modal-header">
          <h2>Searching for game...</h2>
          <button className="modal-exit" onClick={cancelSearch}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          {/* Add any additional content here */}
        </div>
      </Modal>
    </div>
  );
};

export default CreateRoom;
