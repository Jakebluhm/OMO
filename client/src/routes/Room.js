import React, { useEffect, useRef, useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
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
  color: black;
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

const MuteUnmuteButton = styled.button`
  /* Add your styles for the mute/unmute button */
  position: absolute;
  bottom: 10px;
  right: 10px;
`;

const Video = (props) => {
  const ref = useRef();
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const [muted, setMuted] = useState(isIOS || isSafari);

  useEffect(() => {
    const setStream = (stream, retryCount = 0) => {
      if (ref.current) {
        ref.current.srcObject = stream;
      } else if (retryCount < 10) {
        // Stop retrying after 10 attempts
        // Retry after 100ms if ref.current is not available
        setTimeout(() => setStream(stream, retryCount + 1), 100);
      } else {
        throw Error("Unable to set ref.cuurent.srcObject in Video");
      }
    };

    props.peer.on("stream", (stream) => {
      console.log("Inside peer received stream in Video");
      console.log("Stream ID:", stream.id);
      console.log("Stream active:", stream.active);
      console.log("Stream tracks:", stream.getTracks());
      console.log("navigator.userAgent");
      console.log(navigator.userAgent);

      setStream(stream);
    });
  }, []);

  // Debug stream
  useEffect(() => {
    if (ref.current && ref.current.srcObject) {
      ref.current.srcObject.onaddtrack = (event) => {
        console.log("Track added to stream:", event.track);
      };

      ref.current.srcObject.onremovetrack = (event) => {
        console.log("Track removed from stream:", event.track);
      };

      ref.current.srcObject.getTracks().forEach((track) => {
        track.onended = (event) => {
          console.log("Track ended:", event.target);
        };
      });
    }
  }, [ref.current?.srcObject]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (ref.current) {
        console.log("Video readyState:", ref.current.readyState);
      }
    }, 5000); // Log the readyState every 5 seconds

    // Cleanup function to clear the interval when the component is unmounted
    return () => clearInterval(interval);
  }, []);

  const toggleMute = () => {
    setMuted(!muted);
  };

  return (
    <div style={{ position: "relative" }}>
      <StyledVideo
        playsInline
        autoPlay
        muted={muted}
        ref={ref}
        onLoadedMetadata={props.onVideoReady}
      />
      <MuteUnmuteButton onClick={toggleMute}>
        {muted ? "Unmute" : "Mute"}
      </MuteUnmuteButton>
    </div>
  );
};

const videoConstraints = {
  width: { min: 100, ideal: 200, max: 480 },
  height: { min: 100, ideal: 200, max: 480 },
  frameRate: { ideal: 10, max: 15 },
};

localStorage.debug = "";
const Room = (props) => {
  const playerInfo = props.history.location.state;
  const name = { playerName: playerInfo.playerName };
  const oddOneOut = { oddOneOut: playerInfo.oddOneOut };
  const uid = { uid: playerInfo.uid };
  const prompt = { prompt: playerInfo.prompt };

  const currentPlayer = {
    peerName: playerInfo.playerName,
    uid: playerInfo.uid,
    omo: playerInfo.oddOneOut,
  };

  // ------------------- STATE VARIABLES ----------------
  const [peers, setPeers] = useState([]);
  const [isRoomFull, setIsRoomFull] = useState(false);
  const [identityATally, setIdentityATally] = useState(0);
  const [identityBTally, setIdentityBTally] = useState(0);
  const [gameReady, setGameReady] = useState(false);
  const [voteCounts, setVoteCounts] = useState({});
  const [voteComplete, setVoteComplete] = useState(false);
  const [voteResult, setVoteResult] = useState(null);
  const [isRevote, setIsRevote] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [realOddManOut, setRealOddManOut] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [redirectCount, setRedirectCount] = useState(30);
  const [videosReady, setVideosReady] = useState(0);
  const [turnCredentials, setTurnCredentials] = useState(null);

  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]); //JAKEB Array of peers, Could expand this to class other user info, along with peer info

  // useCallback Definitions

  const updateTally = useCallback(() => {
    let uniqueIds = new Set();
    let newIdentityATally = oddOneOut.oddOneOut === 0 ? 1 : 0;
    let newIdentityBTally = oddOneOut.oddOneOut === 1 ? 1 : 0;

    peers.forEach((peer) => {
      if (!uniqueIds.has(peer.uid)) {
        uniqueIds.add(peer.uid);
        if (peer.omo === 0) {
          newIdentityATally++;
        } else if (peer.omo === 1) {
          newIdentityBTally++;
        }
      }
    });

    setIdentityATally(newIdentityATally);
    setIdentityBTally(newIdentityBTally);
  }, [peers]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setSelectedUser(null);
  };

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

  const roomID = props.match.params.roomID;

  const history = useHistory();

  // Create a callback function to handle video readiness
  const handleVideoReady = () => {
    console.log("-------handleVideoReady-----");
    setVideosReady((prevVideosReady) => prevVideosReady + 1);
  };

  useEffect(() => {
    console.log("redirectCount: ", redirectCount);
    console.log("countdown: ", countdown);
  }, [redirectCount, countdown]);
  // Update the gameReady state based on the number of ready videos
  useEffect(() => {
    if (videosReady >= 2) {
      setGameReady(true);
      startTimer();
    }
  }, [videosReady, peers]);

  useEffect(() => {
    if (
      (voteComplete && voteResult !== "tie" && !isRevote && countdown === 0) ||
      (voteComplete && isRevote && countdown === 0)
    ) {
      setGameComplete(true);
      const timer = setTimeout(() => {
        stopMediaStream(userVideo.current.srcObject);
        socketRef.current.disconnect();
        console.log("Attemting to return to home");
        history.push("/");
      }, 30000);

      const countdownTimer = setInterval(() => {
        setRedirectCount((prev) => prev - 1);
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearInterval(countdownTimer);
      };
    }
  }, [voteComplete, voteResult, isRevote, history, countdown]);

  const handleUserVote = (user) => {
    //console.log("----- Inside handleUserVote");
    setSelectedUser(user);
    //console.log("handleUserVote user");
    //console.log(user);
    //console.log("handleUserVote roomId");
    //console.log(roomID);
    // Add code to communicate the vote to other users

    socketRef.current.emit("vote cast", {
      voterId: uid.uid,
      votedUserId: user.uid,
      roomId: roomID,
    });
  };

  useEffect(() => {
    updateTally();
  }, [peers, updateTally]);

  // useEffect(() => {
  //   if (identityATally + identityBTally >= 3) {
  //     console.log("-----------Game Ready!!------------");
  //     setGameReady(true);
  //   }
  // }, [identityBTally, identityATally]);

  useEffect(() => {
    //console.log("voteCounts:");
    //console.log(voteCounts);

    let totalVotes = 0;

    // Loop through the voteCounts object and sum the counts
    for (const count of Object.values(voteCounts)) {
      totalVotes += count;
    }

    //console.log("Total votes cast:", totalVotes);

    if (totalVotes === 3) {
      //console.log("Voting complete!!!!!");
      setVoteComplete(true);

      // Calculate the person with the most votes
      let maxVotes = 0;
      let maxVotedUserId = null;
      let tie = false;

      for (const [userId, count] of Object.entries(voteCounts)) {
        if (count > maxVotes) {
          maxVotes = count;
          maxVotedUserId = userId;
          tie = false;
        } else if (count === maxVotes) {
          tie = true;
        }
      }

      //console.log("Max votes:", maxVotes);
      //console.log("Max voted user ID:", maxVotedUserId);
      //console.log("Tie:", tie);

      // Set the voteResult or "tie"
      if (tie) {
        setVoteResult("tie");
      } else {
        let voteResultName;

        if (maxVotedUserId === currentPlayer.uid) {
          voteResultName = currentPlayer.peerName;
        } else {
          voteResultName = peers.find(
            (peer) => peer.uid === maxVotedUserId
          )?.peerName;
        }

        setVoteResult(voteResultName);
      }
    }
  }, [voteCounts, peers]);

  const [timerStarted, setTimerStarted] = useState(false);

  useEffect(() => {
    let timer;
    let restartCountdown = false;

    const startCountdown = () => {
      setCountdown(10);

      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      setTimeout(() => {
        clearInterval(timer);
        setTimerStarted(false);

        if (voteResult === "tie") {
          console.log("Vote ended in a tie, resetting the vote...");

          setIsRevote(true);

          setVoteCounts({});
          setCountdown(10);
          setVoteComplete(false);
          setVoteResult(null);
          setSelectedUser(null);

          restartCountdown = true;
        } else {
          setCountdown(0);

          // Find the real odd man out here and update the state
          const uniquePeerIds = new Set([currentPlayer.uid]);
          const identityCounts = {
            [currentPlayer.omo]: 1, // Initialize with the current player's identity
          };

          peers.forEach((peer) => {
            if (!uniquePeerIds.has(peer.uid)) {
              uniquePeerIds.add(peer.uid);
              identityCounts[peer.omo] = (identityCounts[peer.omo] || 0) + 1;
            }
          });

          const minorityIdentity = Object.entries(identityCounts).find(
            ([, count]) => count === 1
          )[0];

          let realOddManOutPeer;

          if (currentPlayer.omo === parseInt(minorityIdentity)) {
            realOddManOutPeer = {
              peerName: currentPlayer.peerName,
            };
          } else {
            realOddManOutPeer = peers.find(
              (peer) => peer.omo === parseInt(minorityIdentity)
            );
          }

          setRealOddManOut(realOddManOutPeer.peerName);
        }
      }, 10000);
    };

    if (voteComplete && !timerStarted) {
      setTimerStarted(true);
      startCountdown();
    }

    if (restartCountdown) {
      restartCountdown = false;
      setTimerStarted(true);
      startCountdown();
    }

    // Cleanup function
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [voteComplete, peers]);

  useEffect(() => {
    // Handle Exit and prompt user with "Are you sure? message"
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
  // useEffect(() => {
  //   // Fetch TURN credentials as soon as the socket connection is established
  //   fetch("/turn-credentials")
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error("HTTP error " + response.status);
  //       }
  //       return response.json();
  //     })
  //     .then((credentials) => {
  //       setTurnCredentials(credentials);
  //     })
  //     .catch((error) => {
  //       console.log("Error fetching TURN credentials:", error);
  //     });
  // }, []);

  useEffect(() => {
    // Start by fetching the TURN credentials
    fetch("/turn-credentials")
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        return response.json();
      })
      .then((credentials) => {
        socketRef.current = io.connect("/");
        navigator.mediaDevices
          .getUserMedia({ video: videoConstraints, audio: true })
          .then((stream) => {
            //console.log("inside then----getUserMedia");
            userVideo.current.srcObject = stream; //JAKEB this is video data
            socketRef.current.emit("join room", {
              roomID: roomID,
              name: name,
              OMO: oddOneOut,
              uid: uid,
            }); // emits join room to server
            socketRef.current.on("all users", (users) => {
              // Return all users currently in the group video chat
              console.log("----- RECEIVED all users !!!! ------");
              const initPeers = []; // JAKEB Create empty peers to add all existing peers
              users.forEach((userID) => {
                // Prevent self from joining
                console.log(
                  `Comparing uid: ${userID.uid} with current player uid: ${currentPlayer.uid}`
                );

                if (userID.uid === currentPlayer.uid) {
                  console.log("Skipping current user in all users list");
                  return; // This return will skip the current iteration of the loop
                }
                //JAKEB Get each peer in the chat
                const peer = createPeer(
                  userID.socketID,
                  socketRef.current.id,
                  stream,
                  credentials
                );
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
                console.log("all users - setPeers:");
                console.log(initPeers);
                setPeers(initPeers); // JAKE Set peersRef state variable
              }
            });

            socketRef.current.on("room full", (users) => {
              setIsRoomFull(true);
            });

            //------------------ Callbacks--------------------

            socketRef.current.on("user joined", (payload) => {
              //console.log("--------------user joined---------------");

              // Prevent self from joining

              console.log(
                `Comparing uid: ${payload.uid} with current player uid: ${currentPlayer.uid}`
              );
              if (payload.uid === currentPlayer.uid) {
                console.log(
                  "Received user joined from current client, ignore this"
                );
                return;
              }

              const peer = addPeer(
                payload.signal,
                payload.callerID,
                stream,
                payload.userName.playerName,
                credentials
              );

              peersRef.current.push({
                peerID: payload.callerID,
                peerName: payload.userName.playerName,
                uid: payload.uid,
                omo: payload.omo,
                peer,
              });

              const tempPeer = {
                peerID: payload.callerID,
                peerName: payload.userName.playerName,
                uid: payload.uid,
                omo: payload.omo,
                peer: peer,
              };

              console.log("user joined - setPeers:");
              console.log(tempPeer);
              setPeers((peers) => [...peers, tempPeer]); // JAKEB update state variable, append to peersRef
            });

            socketRef.current.on("user left", (id) => {
              const peerObj = peersRef.current.find((p) => p.peerID === id);
              if (peerObj) {
                peerObj.peer.destroy();
              }

              const peers = peersRef.current.filter((p) => p.peerID !== id);
              peersRef.current = peers;

              setPeers(peers);
            });

            socketRef.current.on("receiving returned signal", (payload) => {
              const item = peersRef.current.find(
                (p) => p.peerID === payload.id
              );
              if (item) {
                console.log(`Processing received signal from ${payload.id}`);
                item.peer.signal(payload.signal);
              } else {
                console.log(`Could not find a matching peer for ${payload.id}`);
              }
            });

            socketRef.current.on("vote update", (payload) => {
              const { voterId, votedUserId } = payload;

              setVoteCounts((prevVoteCounts) => {
                const updatedVoteCounts = { ...prevVoteCounts };
                if (updatedVoteCounts[votedUserId]) {
                  updatedVoteCounts[votedUserId] += 1;
                } else {
                  updatedVoteCounts[votedUserId] = 1;
                }
                return updatedVoteCounts;
              });
            });
          })
          .catch((error) => {
            console.error("error: " + error);
          });
      })
      .catch((error) => {
        console.log("Error fetching TURN credentials:", error);
      });
    return () => {
      // Cleanup function
      console.log("Cleaning up Peers");
      peersRef.current.forEach((peerObj) => {
        if (peerObj.peer) {
          peerObj.peer.destroy();
        }
      });
    };
  }, []);

  function stopMediaStream(stream) {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }

  useEffect(() => {
    const unlisten = history.listen(() => {
      console.log("Inside history callback!! revoking acess to camera");
      stopMediaStream(userVideo.current.srcObject);
      socketRef.current.disconnect();
    });

    return () => {
      unlisten();
    };
  }, [history]);

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
  function createPeer(userToSignal, callerID, stream, turnCreds) {
    if (turnCreds != null) {
      console.log("In createPeer using turn configuration");
      const configuration = {
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
          {
            urls: "stun:global.stun.twilio.com:3478",
          },
          ...turnCreds.iceServers,
        ],
        sdpSemantics: "unified-plan",
      };

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
        config: configuration,
      });

      peer.on("signal", (signal) => {
        socketRef.current.emit("sending signal", {
          userToSignal,
          callerID,
          signal,
          name,
          uid,
          oddOneOut,
        });
      });

      return peer;
    } else {
      console.log("In createPeer using NON turn configuration");
      // fallback: create a peer without TURN server credentials

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
      });

      peer.on("signal", (signal) => {
        socketRef.current.emit("sending signal", {
          userToSignal,
          callerID,
          signal,
          name,
          uid,
          oddOneOut,
        });
      });

      return peer;
    }
  }

  //  Add new player to current call that this user is already in
  function addPeer(incomingSignal, callerID, stream, userName, turnCreds) {
    console.log("------Inside addPeer()-----");

    if (turnCreds != null) {
      console.log("In addPeer using turn configuration");
      const configuration = {
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
          {
            urls: "stun:global.stun.twilio.com:3478",
          },
          ...turnCreds.iceServers,
        ],
        sdpSemantics: "unified-plan",
      };

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
        config: configuration,
      });

      // Add the event listeners for icecandidate and iceconnectionstatechange
      peer._pc.addEventListener("icecandidate", (event) => {
        const candidate = event.candidate;
        if (candidate) {
          console.log(
            userName + "ICE candidate:",
            candidate.type,
            candidate.candidate
          );
        }
      });

      peer._pc.addEventListener("iceconnectionstatechange", () => {
        console.log(
          userName + "ICE connection state:",
          peer._pc.iceConnectionState
        );
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
        // Reconnect logic here
      });

      peer.on("signal", (signal) => {
        console.log("--------------signal addPeer---------------");

        socketRef.current.emit("returning signal", {
          signal,
          callerID,
          name,
        });
      });

      peer.signal(incomingSignal);

      return peer;
    } else {
      console.log("In addPeer using NON turn configuration");
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
      });

      // Add the event listeners for icecandidate and iceconnectionstatechange
      peer._pc.addEventListener("icecandidate", (event) => {
        const candidate = event.candidate;
        if (candidate) {
          console.log(
            userName + "ICE candidate:",
            candidate.type,
            candidate.candidate
          );
        }
      });

      peer._pc.addEventListener("iceconnectionstatechange", () => {
        console.log(
          userName + "ICE connection state:",
          peer._pc.iceConnectionState
        );
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
        // Reconnect logic here
      });

      peer.on("signal", (signal) => {
        console.log("--------------signal addPeer---------------");

        socketRef.current.emit("returning signal", {
          signal,
          callerID,
          name,
        });
      });

      peer.signal(incomingSignal);

      return peer;
    }
  }

  const uniqueIds = [];
  const filteredPeers = peers.filter((element) => {
    const isDuplicate = uniqueIds.includes(element.uid);

    if (!isDuplicate) {
      uniqueIds.push(element.uid);
      //console.log("not a duplicate");

      return true;
    }
    return false;
  });

  return (
    <Container style={{ border: "0px solid rgba(0, 255, 255, 1)" }}>
      <div>
        <h3>
          {identityATally} {prompt.prompt.identityA} - {identityBTally}
          {prompt.prompt.identityB}
        </h3>
        <h4>Find the Odd Man Out</h4>
      </div>
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
          <>
            <h1>Select the odd man out:</h1>
            <div key={currentPlayer.uid}>
              {currentPlayer.peerName} - Votes:{" "}
              {voteCounts[currentPlayer.uid] || 0}
            </div>
            {filteredPeers.map((peer) => (
              <div key={peer.id}>
                {peer.peerName} - Votes: {voteCounts[peer.uid] || 0}
                {selectedUser === null && (
                  <VoteButton
                    onClick={() => {
                      handleUserVote(peer);
                      //console.log("filteredPeers");
                      //console.log(filteredPeers);
                    }}
                  >
                    Vote
                  </VoteButton>
                )}
              </div>
            ))}
            {isRevote && (
              <h2>Revote is happening due to a tie. Please vote again.</h2>
            )}
            {voteComplete && (
              <div>
                <h1>Voting Complete</h1>
                <h2>
                  {voteResult === "tie"
                    ? "It's a tie!"
                    : `Person with the most votes: ${voteResult}`}
                </h2>
                <h3>Countdown: {countdown}</h3>
                {countdown === 0 && <h2>Real odd man out: {realOddManOut}</h2>}
              </div>
            )}
            {gameComplete && <h3>Redirecting in {redirectCount} seconds...</h3>}
          </>
          {/* <button onClick={toggleModal}>Close</button> */}
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
              border: "3px solid rgba(255, 0, 0, 1)",
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
            {/* <label style={{ padding: 5 }}>
              {typeof oddOneOut !== "undefined" && oddOneOut != null
                ? oddOneOut.oddOneOut
                : "empty"}
            </label> */}
          </div>
        </div>
        {peers.length > 0 &&
          filteredPeers.map((peer) => {
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
                    onVideoReady={handleVideoReady}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <label style={{ padding: 5 }}>{peer.peerName}</label>
                </div>
              </div>
            );
          })}
      </div>
      {!gameReady && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999, // Increase zIndex to a higher value
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(200, 200, 255, 0.1)", // Change the opacity value to 0.1
              padding: 20,
              borderRadius: 10,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              width: "100%", // Set width and height to 100%
              height: "100%",
            }}
          >
            <h2>Loading...</h2>
            <p>Please wait while the game is being prepared</p>
          </div>
        </div>
      )}
    </Container>
  );
};

export default Room;
