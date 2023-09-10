import React, { useState, useEffect } from "react";
import { v1 as uuid } from "uuid";
import Modal from "react-modal";
import "../ModalStyles/ModalStyle.css";
import PromptComponent from "../components/PromptComponent";

const CreateRoom = (props) => {
  const [name, setname] = useState("");

  // Modal State
  const [isSearchingModalOpen, setIsOpen] = useState(false);

  const [userData, setUserData] = useState({
    TableName: "OMOUserQueue",
    Item: {
      user: uuid(),
      prompts: [],
      gameHistory: [],
    },
  });

  // Callback for confirm under Name entry
  async function startSearch() {
    console.log("startSearch() Establishing WebSocket Connection");

    const gameHistoryString = encodeURIComponent(
      JSON.stringify(userData.Item.gameHistory || {})
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

        props.history.push(`/room/${uuid}`, {
          playerName: name,
          oddOneOut: oddOneOutValue,
          uid: userData.Item.user,
          prompt: matchingPrompt,
          userData: userData,
          dummyPrompts: dummyPrompts,
        });
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

    setIsOpen(!isSearchingModalOpen);
  }

  function cancelSearch() {
    console.log("cancelSearch()");
    setIsOpen(!isSearchingModalOpen);
  }

  const handleNameChange = (e) => {
    console.log(`New name value: ${e.target.value}`);
    const currentName = e.target.value;
    setname(e.target.value);
    setUserData((prevState) => ({
      ...prevState,
      Item: {
        ...prevState.Item,
        name: currentName,
      },
    }));
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

  const dummyPrompts = [
    {
      id: 0,
      uuid: "abc123",
      identityA: "Vegan",
      identityB: "Meat Eater",
      count: 0,
      iceBreakers: [
        "What's your favorite meal?",
        "How do you feel about tofu?",
        "Describe the last burger you ate."
      ],
    },
    {
      id: 1,
      uuid: "xyz789",
      identityA: "Christian",
      identityB: "Atheist",
      count: 0,
      iceBreakers: [
        "How do you celebrate Christmas?",
        "What's your view on the afterlife?",
        "How often do you visit places of worship?"
      ],
    },
    {
      id: 2,
      uuid: "jkl456",
      identityA: "Rapper",
      identityB: "Fake Rapper",
      count: 0,
      iceBreakers: [
        "Who's your favorite hip-hop artist?",
        "Have you ever performed on stage?",
        "What's your go-to rap song to sing along to?"
      ],
    },
    {
      id: 3,
      uuid: "def123",
      identityA: "Left-wing",
      identityB: "Right-wing",
      count: 0,
      iceBreakers: [
        "Who's your favorite political leader?",
        "What's your stance on healthcare?",
        "How do you feel about tax breaks?"
      ],
    }, 
    {
      id: 4,
      uuid: "ghi789",
      identityA: "iPhone",
      identityB: "Android",
      count: 0,
      iceBreakers: [
        "Which app store do you prefer?",
        "Have you ever switched from one to the other?",
        "What feature of your phone do you value the most?"
      ],
    },
    {
      id: 5,
      uuid: "mno456",
      identityA: "Climate Change Believer",
      identityB: "Climate Change Skeptic",
      count: 0,
      iceBreakers: [
        "What's your primary news source?",
        "Have you ever been impacted by extreme weather?",
        "How do you feel about renewable energy?"
      ],
    },
    {
      id: 6,
      uuid: "pqr123",
      identityA: "Mac",
      identityB: "PC",
      count: 0,
      iceBreakers: [
        "Which operating system do you find more user-friendly?",
        "How often do you upgrade your computer?",
        "What's your go-to software or application on your platform?"
      ],
    },
    {
        id: 7,
        uuid: "stu456",
        identityA: "Pro-gun control",
        identityB: "Anti-gun control",
        count: 0,
        iceBreakers: [
          "How do you feel about stricter background checks for gun purchases?",
          "Have you ever taken a firearm safety course?",
          "What's your perspective on concealed carry permits?"
        ],
    },
    {
        id: 8,
        uuid: "vwx789",
        identityA: "Pro-choice",
        identityB: "Pro-life",
        count: 0,
        iceBreakers: [
          "How do you feel about reproductive health education in schools?",
          "Do you think the government should have a say in personal health decisions?",
          "What are your thoughts on pregnancy prevention methods?"
        ],
    },
    {
        id: 9,
        uuid: "yza012",
        identityA: "Pro-vaccination",
        identityB: "Anti-vaccination",
        count: 0,
        iceBreakers: [
          "How do you stay informed about new vaccines or medical updates?",
          "What's your stance on mandatory vaccinations for school admissions?",
          "Have you or your family experienced any side effects from vaccines?"
        ],
    },
    {
        id: 10,
        uuid: "bcd345",
        identityA: "Public School",
        identityB: "Homeschooling",
        count: 0,
        iceBreakers: [
          "How do you feel about standardized testing?",
          "What do you think are the most important aspects of education?",
          "How do you envision the future of learning?"
        ],
    },
    {
      id: 11,
      uuid: "efg678",
      identityA: "Cats",
      identityB: "Dogs",
      count: 0,
      iceBreakers: [
        "Which pet do you think requires more attention and why?",
        "Have you had any memorable experiences with a cat or dog?",
        "How do you feel about training or disciplining pets?"
      ],
  },
  {
      id: 12,
      uuid: "hij901",
      identityA: "Morning People",
      identityB: "Night Owls",
      count: 0,
      iceBreakers: [
        "What's the first thing you do after waking up?",
        "Do you rely on an alarm to wake up or naturally rise?",
        "What time of day do you feel most productive or creative?"
      ],
  } 
  ];
  

  return (
    <div style={style}>
      <div>
        <h2>OMO</h2>
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
          name="displayName"
          value={name}
        ></input>
        <button
          name="confirmButton"
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
      <label style={{ padding: 5 }}>
        Answer one or more questions below to be able to play OMO
      </label>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {dummyPrompts.map((prompt) => (
          <PromptComponent prompt={prompt} onButtonClick={handlePromptClick} />
        ))}
      </div>
      {/* <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h3>Debug Room.js UI</h3>
        <button
          className="debug-room-btn"
          onClick={() => {
            console.log("I suck");
            props.history.push(`/room/${uuid}`, {
              playerName: "Dummy",
              oddOneOut: ['{"0":0}', '{"1":0}', '{"2":0}'],
              uid: "31eb15f0-f44e-11ed-aa47-d7f63467c0b0",
              prompt: {
                id: 0,
                uuid: "abc123",
                identityA: "Vegan",
                identityB: "Meat Eater",
                count: 0,
              },
              debug: true, // Add this line
            });
          }}
        >
          Debug
        </button>
      </div> */}
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
