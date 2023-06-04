import React, { useEffect, useRef, useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import VideoGrid from "../components/VideoGrid";

import * as Sentry from "@sentry/react";

import {
  getOnConnectHandler,
  getOnCloseHandler,
  getOnIceConnectionStateChangeHandler,
  getOnConnectionStateChangeHandler,
} from "../utils/peerConnectionHandlers";

const Container = styled.div`
  padding: 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100vh;
  width: 100%;
  margin: auto;
  flex-wrap: nowrap;
`;

const StyledVideo = styled.video`
  display: flex;
  flex: 1;
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

const MuteUnmuteButton = styled.button`
  /* Add your styles for the mute/unmute button */
  position: absolute;
  bottom: 10px;
  right: 10px;
`;

export const Video = (props) => {
  const ref = useRef();
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const [muted, setMuted] = useState(isIOS || isSafari);

  // A reference to store the timestamp of the last time readyState was < 3
  const lastTimeStateLessThanThreeRef = useRef(null);

  // Video debug
  useEffect(() => {
    if (ref.current) {
      ref.current.onerror = (event) => {
        console.log("Video error event:", event);
        Sentry.captureMessage(`Video error: ${event.message}`, "error");
      };

      ref.current.onstalled = () => {
        console.log("Video playback has been stalled");
        Sentry.captureMessage("Video playback stalled", "warning");
      };

      ref.current.oncanplay = () => {
        console.log("Video can start, but not sure if it will finish");
      };

      ref.current.oncanplaythrough = () => {
        console.log("Video can start and is expected to finish without interruption");
      };
    }
  }, [ref.current, props.peer]);

  //Sentry error reporting
  useEffect(() => {
    const checkStates = () => {
      if (ref.current) {
        console.log("Video readyState:", ref.current.readyState);

        if (ref.current.readyState < 3) {
          // If this is the first time readyState is < 3, remember the timestamp
          if (!lastTimeStateLessThanThreeRef.current) {
            lastTimeStateLessThanThreeRef.current = Date.now();
          }
          // If readyState has been < 3 for more than 15 seconds, report an error
          else if (Date.now() - lastTimeStateLessThanThreeRef.current > 15000) {
            Sentry.captureMessage(
              `Video readyState less than HAVE_FUTURE_DATA for more than 15 seconds: ${ref.current.readyState}`,
              "warning"
            );
          }
        } else {
          // If readyState is >= 3, clear the timestamp
          lastTimeStateLessThanThreeRef.current = null;
        }

        // Check the RTCPeerConnection state
        const peerConnectionState = props.peer.connectionState;
        console.log("Peer connection state:", peerConnectionState);

        if (
          peerConnectionState === "failed" ||
          peerConnectionState === "disconnected"
        ) {
          Sentry.captureMessage(
            `RTCPeerConnection is in a bad state: ${peerConnectionState}`,
            "warning"
          );
        }
      }
    };

    const interval = setInterval(checkStates, 5000); // Check the states every 5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const setStream = (stream, retryCount = 0) => {
      if (ref.current) {
        ref.current.srcObject = stream;
      } else if (retryCount < 10) {
        console.log("Attempting to set stream:", String(retryCount))
        setTimeout(() => setStream(stream, retryCount + 1), 100);
      } else {
        throw Error("Unable to set ref.current.srcObject in Video");
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
  }, [props.peer]);


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
    <div style={{ position: "relative", display: "flex", flex: 1 }}>
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
  //const debug = props.location.state.debug;

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
  const [oddManOutIdentity, setOddManOutIdentity] = useState(null);
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

    if (
      newIdentityBTally + newIdentityATally >= 3 &&
      oddManOutIdentity == null
    ) {
      if (newIdentityATally === 1) {
        console.log(
          "Setting odd man out identity to: " + prompt.prompt.identityA
        );
        setOddManOutIdentity(prompt.prompt.identityA);
      } else {
        console.log(
          "Setting odd man out identity to: " + prompt.prompt.identityB
        );
        setOddManOutIdentity(prompt.prompt.identityB);
      }
    }

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
                  userID.uid,
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
                  connectionState: "initializing",
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
                payload.uid,
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
                connectionState: "initializing",
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

  // This is the function you'll pass to your handlers.
  const getPeerByUid = (uid) => {
    return peers.find((peer) => peer.uid === uid);
  };

  //  called when joining a room with players already in room. Called in useEffect to make list of players
  function createPeer(uid, userToSignal, callerID, stream, turnCreds) {
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

      // Attach the 'stream' event listener immediately after creating the peer connection
      peer.on('stream', (stream) => {
        console.log("STREAM!!!!!!!!!!!!!!");
        // Handle the stream
      });

      // Connection State Callbacks
      peer.on("connect", () => {
        const { uid, connectionState } = getOnConnectHandler(uid, getPeerByUid);
        setPeers(peers => {
          const updatedPeers = peers.map(peer => {
            if (peer.uid === uid) {
              return { ...peer, connectionState };
            }
            return peer;
          });
          return updatedPeers;
        });
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

      // Attach the 'stream' event listener immediately after creating the peer connection
      peer.on('stream', (stream) => {
        console.log("STREAM!!!!!!!!!!!!!!");
        // Handle the stream
      });

      // Connection State Callbacks
      peer.on("connect", () => {
        const { uid, connectionState } = getOnConnectHandler(uid, getPeerByUid);
        setPeers(peers => {
          const updatedPeers = peers.map(peer => {
            if (peer.uid === uid) {
              return { ...peer, connectionState };
            }
            return peer;
          });
          return updatedPeers;
        });
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
  function addPeer(uid, incomingSignal, callerID, stream, userName, turnCreds) {
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


      // Attach the 'stream' event listener immediately after creating the peer connection
      peer.on('stream', (stream) => {
        console.log("STREAM!!!!!!!!!!!!!!");
        // Handle the stream
      });

      // Connection State Callbacks
      peer.on("connect", () => {
        const { uid, connectionState } = getOnConnectHandler(uid, getPeerByUid);
        setPeers(peers => {
          const updatedPeers = peers.map(peer => {
            if (peer.uid === uid) {
              return { ...peer, connectionState };
            }
            return peer;
          });
          return updatedPeers;
        });
      });
      // peer.on("close", getOnCloseHandler(uid, getPeerByUid));
      // peer._pc.oniceconnectionstatechange =
      //   getOnIceConnectionStateChangeHandler(uid, getPeerByUid);
      // peer._pc.onconnectionstatechange = getOnConnectionStateChangeHandler(
      //   uid,
      //   getPeerByUid
      // );
      // Connection State Callbacks End

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

      // Attach the 'stream' event listener immediately after creating the peer connection
      peer.on('stream', (stream) => {
        console.log("STREAM!!!!!!!!!!!!!!");
        // Handle the stream
      });

      // Connection State Callbacks
      peer.on("connect", () => {
        const { uid, connectionState } = getOnConnectHandler(uid, getPeerByUid);
        setPeers(peers => {
          const updatedPeers = peers.map(peer => {
            if (peer.uid === uid) {
              return { ...peer, connectionState };
            }
            return peer;
          });
          return updatedPeers;
        });
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
    <Container>
      <p style={{ textAlign: "center" }}>OMO</p>
      <p style={{ textAlign: "center" }}>
        {identityATally} {prompt.prompt.identityA} vs {identityBTally}{" "}
        {prompt.prompt.identityB}
      </p>
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

      <VideoGrid
        style={{ flex: 1, overflow: "auto" }}
        userVideo={userVideo}
        filteredPeers={filteredPeers}
        gameInfo={{
          time: formatTime(timeLeft),
          omoIdentity: oddManOutIdentity,
        }}
        handleVideoReady={handleVideoReady}
        // Add new props
        isModalOpen={isModalOpen}
        currentPlayer={currentPlayer}
        voteCounts={voteCounts}
        handleUserVote={handleUserVote}
        isRevote={isRevote}
        voteComplete={voteComplete}
        voteResult={voteResult}
        countdown={countdown}
        realOddManOut={realOddManOut}
        gameComplete={gameComplete}
        redirectCount={redirectCount}
        selectedUser={selectedUser}
      />

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
              backgroundColor: "rgba(200, 200, 255, 0.5)", // Change the opacity value to 0.1
              padding: 20,
              borderRadius: 10,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              width: "90%",
              height: "90%",
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
