import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

const Container = styled.div`
  padding: 20px;
  display: flex;
  height: 100vh;
  width: 90%;
  margin: auto;
  flex-wrap: wrap;
`;

const StyledVideo = styled.video`
  height: 400px;
  width: 400px;
`;

const Timer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  font-size: 24px;
  font-weight: bold;
  color: white;
`;

const ModalContainer = styled.div`
  display: ${(props) => (props.isOpen ? "block" : "none")};
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
`;

const ModalContent = styled.div`
  background-color: white;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 50%;
  text-align: center;
`;

const VoteButton = styled.button`
  background-color: #4caf50;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 10px 2px;
  cursor: pointer;
`;

const Video = (props) => {
  const ref = useRef();
  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, []);

  return <StyledVideo playsInline autoPlay ref={ref} />;
};

const videoConstraints = {
  width: { min: 100, ideal: 200, max: 480 },
  height: { min: 100, ideal: 200, max: 480 },
  frameRate: { ideal: 10, max: 15 },
  //height: 10,//window.innerHeight / 2,
  //width: 20//window.innerWidth / 2
};

localStorage.debug = "";
const Room = (props) => {
  console.log("inside Room ------------------");
  const playerInfo = props.history.location.state;
  console.log("playerInfo?");
  console.log(playerInfo);
  const name = { playerName: playerInfo.playerName };
  console.log("name?");
  console.log(name);
  const oddOneOut = { oddOneOut: playerInfo.oddOneOut };
  console.log("oddOneOut?");
  console.log(oddOneOut);
  const uid = { uid: playerInfo.uid };
  console.log("uid?");
  console.log(uid);

  // ------------------- STATE VARIABLES ----------------
  const [peers, setPeers] = useState([]);
  //const [peerNames, setPeerNames]  = useState([]);
  const [isRoomFull, setIsRoomFull] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setSelectedUser(null);
  };
  const handleUserVote = (user) => {
    setSelectedUser(user);
    // Add code to communicate the vote to other users
  };

  const [timeLeft, setTimeLeft] = useState(120);
  const formatTime = (time) =>
    `${Math.floor(time / 60)}:${time % 60 < 10 ? "0" : ""}${time % 60}`;

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          // Call toggle modal
          toggleModal();
          // You can call the function to show the modal here
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]); //JAKEB Array of peers, Could expand this to class other user info, along with peer info
  const roomID = props.match.params.roomID;

  useEffect(() => {
    console.log("--------------useEffect 1---------------");
    const unloadCallback = (event) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", unloadCallback);
    return () => window.removeEventListener("beforeunload", unloadCallback);
  }, []);

  // JAKEB useEffect updates when state variables(above) that are in brackets at the bottom
  // of function change value. In this case no variables are specified so it runs when this
  // Component mounts aka displays to screen
  useEffect(() => {
    console.log("--------------useEffect 2---------------");

    console.log("Begining of useEffect in Room.js");

    console.log("Trying to read peers from storage");

    // if(window.localStorage["peers"]){
    //     console.log('peers were found in local storage in local storage, trying to get them...')
    //     const peersFromLocalStorage = window.localStorage.getItem('peers')

    //     console.log('-------peersFromLocalStorage')
    //     console.log(peersFromLocalStorage)
    //     setPeers(JSON.parse(peersFromLocalStorage));
    // }
    // else{
    //     console.log('No peers stored in local storage')
    // }

    console.log("Getting all users currently in room");
    socketRef.current = io.connect("/");
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        console.log("inside then----getUserMedia");
        userVideo.current.srcObject = stream; //JAKEB this is video data
        socketRef.current.emit("join room", {
          roomID: roomID,
          name: name,
          OMO: oddOneOut,
          uid: uid,
        }); // emits join room to server
        socketRef.current.on("all users", (users) => {
          // Return all users currently in the group video chat
          const initPeers = []; // JAKEB Create empty peers to add all existing peers
          users.forEach((userID) => {
            //JAKEB Get each peer in the chat
            const peer = createPeer(
              userID.socketID,
              socketRef.current.id,
              stream
            ); // Create peer object
            console.log("userID");
            console.log(userID);
            console.log("userID.name");
            console.log(userID.name);
            peersRef.current.push({
              // Pushing a new player into array of players -
              peerID: userID.socketID,
              peerName: userID.name,
              uid: userID.uid,
              omo: userID.omo,
              peer,
            });
            initPeers.push({
              peerID: userID.socketID,
              peerName: userID.name,
              uid: userID.uid,
              omo: userID.omo,
              peer: peer,
            });
          });

          if (initPeers.length > 0) {
            setPeers(initPeers); // JAKE Set peersRef state variable
          }
        });

        socketRef.current.on("room full", (users) => {
          // Return all users currently in the group video chat
          console.log("---------ROOM FULL---------");

          setIsRoomFull(true);

          startTimer();
        });

        //------------------ Callbacks--------------------

        //  Callback for when someone joined the room?
        socketRef.current.on("user joined", (payload) => {
          console.log("--------------user joined---------------");
          const peer = addPeer(payload.signal, payload.callerID, stream);
          console.log("payload.userName.playerName");
          console.log(payload.userName.playerName);
          console.log("payload");
          console.log(payload);
          peersRef.current.push({
            peerID: payload.callerID,
            peerName: payload.userName.playerName,
            uid: payload.uid,
            omo: payload.omo,
            peer,
          });
          console.log("before adding peer to peers list:");
          console.log(peers);
          const tempPeer = {
            peerID: payload.callerID,
            peerName: payload.userName.playerName,
            uid: payload.uid,
            omo: payload.omo,
            peer: peer,
          };
          console.log("Adding peer to peers list:");
          console.log(tempPeer);
          setPeers((peers) => [...peers, tempPeer]); // JAKEB update state variable, append to peersRef
        });

        socketRef.current.on("user left", (id) => {
          console.log("--------------user left handler---------------");
          console.log("peersRef before user left handler");
          console.log(peersRef);
          const peerObj = peersRef.current.find((p) => p.peerID === id);
          if (peerObj) {
            peerObj.peer.destroy();
          }

          const peers = peersRef.current.filter((p) => p.peerID !== id);
          peersRef.current = peers;
          console.log("peers after user left");
          console.log(peers);

          console.log("peersRef after user left handler");
          console.log(peersRef);

          setPeers(peers);
        });

        socketRef.current.on("receiving returned signal", (payload) => {
          console.log("--------------receiving returned signal---------------");
          console.log("peersRef before receiving returned signal");
          console.log(peersRef);
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);

          console.log("peersRef after receiving returned signal");
          console.log(peersRef);
          //console.log("receiving returned signal  " + [item.peer._id] + "   " + "   " + payload.userName.playerName)
          //setPeerNames(oldArray => [...oldArray, { [item.peer._id] : payload.userName.playerName} ]);
        });
      })
      .catch((error) => {
        // TODO: Handle error where user web cam or microphone could not be found
        //console.log('inside catch----getUserMedia')
        console.error("error: " + error);
      });
  }, []);

  window.onunload = function () {
    console.log(
      " onunload Closing page --sending Disconnect--- Clearing Local Storage!!!!!!"
    );
    //  socketRef.current.emit("disconnect")
  };

  window.onbeforeunload = function () {
    console.log(
      "onbeforeunload Closing page --sending Disconnect--- Clearing Local Storage!!!!!!"
    );
    // socketRef.current.emit("disconnect")

    //localStorage.clear();
  };

  //  called when joining a room with players already in room. Called in useEffect to make list of players
  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      // Peer is from third party NPM module called simple-peer
      initiator: true,
      trickle: false, //false,
      stream,
    });

    peer.on("signal", (signal) => {
      console.log("--------------signal createPeer---------------");
      console.log("peersRef before signal createPeer");
      console.log(peersRef);
      console.log("name?");
      console.log(name);
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
        name,
        uid,
        oddOneOut,
      });
      console.log("peersRef after signal createPeer");
      console.log(peersRef);
    });

    return peer;
  }

  //  Add new player to current call that this user is already in
  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      console.log("--------------signal addPeer---------------");
      socketRef.current.emit("returning signal", { signal, callerID, name });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  console.log("peers--------");
  console.log(peers);
  console.log("peers.length--------");
  console.log(peers.length);

  console.log("peers");
  console.log(peers);

  const uniqueIds = [];
  const filteredPeers = peers.filter((element) => {
    const isDuplicate = uniqueIds.includes(element.uid);
    console.log("uniqueIds");
    console.log(uniqueIds);
    console.log("element.uid");
    console.log(element.uid);
    console.log("isDuplicate");
    console.log(isDuplicate);

    if (!isDuplicate) {
      uniqueIds.push(element.uid);
      console.log("not a duplicate");

      return true;
    }
    console.log("Removing duplicate !!!");
    return false;
  });
  return (
    <Container style={{ border: "0px solid rgba(0, 255, 255, 1)" }}>
      <Timer>{formatTime(timeLeft)}</Timer>
      {isRoomFull && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h2>Room is Full</h2>
            <p>Please try again later</p>
          </div>
        </div>
      )}

      <ModalContainer isOpen={isModalOpen}>
        <ModalContent>
          {selectedUser === null ? (
            <>
              <h2>Select the odd man out:</h2>
              {peers.map((peer) => (
                <div key={peer.id}>
                  {peer.name}
                  <VoteButton onClick={() => handleUserVote(peer)}>
                    Vote
                  </VoteButton>
                </div>
              ))}
            </>
          ) : (
            <h2>Waiting for results...</h2>
          )}
          <button onClick={toggleModal}>Close</button>
        </ModalContent>
      </ModalContainer>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          border: "0px solid rgba(0, 255, 0, 1)",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "400px",
              width: "400px",
              border: "0px solid rgba(255, 0, 0, 1)",
            }}
          >
            <StyledVideo
              style={{ display: "flex", flex: 1 }}
              muted
              ref={userVideo}
              autoPlay
              playsInline
            />
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <label style={{ padding: 5 }}>
              {typeof name !== "undefined" && name != null
                ? name.playerName
                : "empty"}
            </label>
            <label style={{ padding: 5 }}>
              {typeof oddOneOut !== "undefined" && oddOneOut != null
                ? oddOneOut.oddOneOut
                  ? "true"
                  : "false"
                : "empty"}
            </label>
          </div>
        </div>
        {peers.length > 0 &&
          filteredPeers.map((peer) => {
            console.log("is peer connected - rendering peer");
            console.log(
              peer.peerName +
                "  " +
                peer.peer._connected +
                " " +
                peer.peer._connecting
            );
            return (
              <div>
                <div
                  key={peer.peer._id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "400px",
                    width: "400px",
                    border: "0px solid rgba(0, 255, 0, 1)",
                  }}
                >
                  <Video
                    style={{ display: "flex", flex: 1 }}
                    key={peer.peerID}
                    peer={peer.peer}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <label style={{ padding: 5 }}>
                    {peer.peerName + ": " + peer.omo}
                  </label>
                </div>
              </div>
            );
          })}
      </div>
    </Container>
  );
};

export default Room;
