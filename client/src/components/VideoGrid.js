import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Video } from "../routes/Room"; // adjust the path to match your project structure
import { useHistory } from "react-router-dom";
import TimedRedirectModal from "../modal/redirectModal/RedirectModal.js";
import { useNetworkStatus } from "../helpers/network/NetworkStatus.js";

// Base size of the squares, this can be adjusted as needed
const BASE_SIZE = 50;
const GridContainer = styled.div`
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(2, ${(props) => props.size}px);
  grid-template-rows: repeat(2, ${(props) => props.size}px);
  gap: 5px;
  justify-content: center;
  align-items: center;
  flex: 0.95;
  width: 100%;
`;
const VoteButton = styled.button`
  width: ${(props) => props.size / 6}px; // adjust these fractions as necessary
  height: ${(props) =>
    props.size / 12}px; // half of the width to keep 2:1 ratio
  font-size: ${(props) =>
    props.size / 24}px; // adjust this fraction as necessary
  background-color: #4caf50;
  border: none;
  color: white;
  padding: ${(props) => props.size / 120}px ${(props) => props.size / 60}px; // adjust these fractions as necessary
  text-align: center;
  text-decoration: none;
  display: inline-block;
  margin: ${(props) => props.size / 120}px ${(props) => props.size / 120}px; // adjust these fractions as necessary
  cursor: pointer;
`;

const RedirectButton = styled.button`
  width: ${(props) => props.size / 6}px; // adjust these fractions as necessary
  height: ${(props) =>
    props.size / 12}px; // half of the width to keep 2:1 ratio
  font-size: ${(props) =>
    props.size / 24}px; // adjust this fraction as necessary
  background-color: #4caf50;
  border: none;
  color: white;
  padding: ${(props) => props.size / 120}px ${(props) => props.size / 60}px; // adjust these fractions as necessary
  text-align: center;
  text-decoration: none;
  display: inline-block;
  margin: ${(props) => props.size / 120}px ${(props) => props.size / 120}px; // adjust these fractions as necessary
  cursor: pointer;
`;

const GridItem = styled.div`
  height: ${(props) => props.size}px;
  width: ${(props) => props.size}px;
  border: 1px solid black;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// Also, let's define StyledVideo
const StyledVideo = styled.video`
  display: flex;
  flex: 1;
`;

const VideoGrid = ({
  userVideo,
  filteredPeers,
  gameInfo,
  stopTimer,
  handleVideoReady,
  isModalOpen,
  currentPlayer,
  voteCounts,
  handleUserVote,
  isRevote,
  voteComplete,
  voteResult,
  countdown,
  realOddManOut,
  gameComplete,
  redirectCount,
  selectedUser,
  videoStreams,
  gameReady,
}) => {
  const history = useHistory(); // Here's where we call useHistory
  const [size, setSize] = useState(BASE_SIZE);
  const [allUsersLeft, setAllUsersLeft] = useState(false);
  const [gameRuined, setGameRuined] = useState(false);

  const networkStatus = useNetworkStatus();

  // Use an effect to resize the grid when the window resizes
  useEffect(() => {
    const handleResize = () => {
      // Calculate the size for the squares so that they fill the viewport
      const newSize = Math.min(window.innerHeight / 2, window.innerWidth / 2);

      setSize(newSize - 10); // subtract the gap size
    };

    window.addEventListener("resize", handleResize);

    // Call the function once to set the initial size
    handleResize();

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const connectionStates = filteredPeers.map((peer) => peer.connectionState);
  // Use an effect to resize the grid when the window resizes
  useEffect(() => {
    console.log(
      "Inside ruin game useEffect - gameReady " +
        gameReady +
        " connectionStates: " +
        connectionStates
    );
    if (gameReady) {
      var closedCount = 0;
      connectionStates.forEach((state) => {
        if (state === "closed") {
          console.log("GAME RUINED - someone left game");
          closedCount++;
          setGameRuined(true);
        }
      });

      if (closedCount > 0) {
        console.log(
          "GAME RUINED - Not enough users: " + connectionStates.length
        );
        setGameRuined(true);
        stopTimer();
        if (closedCount === 1) {
          console.log("One User left");
        } else if (closedCount === 2) {
          console.log("All users left triggering modal redirect sequence");
          setAllUsersLeft(true);
        }
      }

      console.log("connectionStates.length: " + connectionStates.length);
      if (connectionStates.length === 0) {
        console.log("All users exited triggering modal redirect sequence");
        setAllUsersLeft(true);
      }
    }
  }, [connectionStates, gameReady, stopTimer]);

  console.log("isModalOpen");
  console.log(isModalOpen);

  return (
    <GridContainer size={size}>
      <GridItem size={size}>
        <StyledVideo muted ref={userVideo} autoPlay playsInline />
      </GridItem>
      {filteredPeers.map((peer, index) => {
        if (index < 2) {
          const stream = videoStreams.current[peer.uid];
          // Only take the first two peers
          return (
            <div>
              {peer.connectionState === "closed" ? (
                <GridItem key={peer.peerID} size={size}>
                  <label
                    style={{
                      position: "absolute",
                      alignSelf: "flex-end",
                      padding: 5,
                      fontWeight: "bold",
                      color: "white", // white color for the text
                      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)", // text shadow for contrast
                      backgroundColor: "rgba(0, 0, 0, 0.5)", // optional: semi-transparent background for the text
                    }}
                  >
                    {peer.peerName} - left the game...
                  </label>
                </GridItem>
              ) : (
                <GridItem key={peer.peerID} size={size}>
                  <Video
                    style={{ display: "flex", flex: 1 }}
                    key={peer.peerID}
                    peer={peer}
                    onVideoReady={handleVideoReady}
                    videoStream={stream}
                  />
                  <label
                    style={{
                      position: "absolute",
                      alignSelf: "flex-end",
                      padding: 5,
                      fontWeight: "bold",
                      color: "white", // white color for the text
                      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)", // text shadow for contrast
                      backgroundColor: "rgba(0, 0, 0, 0.5)", // optional: semi-transparent background for the text
                    }}
                  >
                    {peer.peerName} - {peer.connectionState}
                  </label>
                </GridItem>
              )}
            </div>
          );
        }
      })}
      <GridItem size={size}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isModalOpen ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <>
                {gameRuined ? (
                  <>
                    <p
                      style={{
                        fontSize: "calc(2px + 1.0vh)",
                        marginBottom: "5px",
                      }}
                    >
                      {"GAME RUINED"}
                    </p>
                    <RedirectButton
                      size={size}
                      onClick={() => history.push("/")}
                    >
                      Home
                    </RedirectButton>
                    <p
                      style={{
                        fontSize: "calc(2px + 1.0vh)",
                        marginBottom: "5px",
                      }}
                    >
                      Real odd man out: {realOddManOut}
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      style={{
                        fontSize: "calc(2px + 1.0vh)",
                        marginBottom: "5px",
                      }}
                    >
                      Select the odd man out:
                    </p>
                    <div
                      key={currentPlayer.uid}
                      style={{
                        fontSize: "calc(2px + 1.0vh)",
                        marginBottom: "5px",
                      }}
                    >
                      {currentPlayer.peerName} - Votes:{" "}
                      {voteCounts[currentPlayer.uid] || 0}
                    </div>
                    {filteredPeers.map((peer) => (
                      <div key={peer.id}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            fontSize: "calc(2px + 1.0vh)",
                            marginBottom: "5px",
                          }}
                        >
                          {peer.peerName} - Votes: {voteCounts[peer.uid] || 0}
                          {selectedUser === null && (
                            <VoteButton
                              size={size}
                              onClick={() => {
                                handleUserVote(peer);
                              }}
                            >
                              Vote
                            </VoteButton>
                          )}
                        </div>
                      </div>
                    ))}
                    {isRevote && (
                      <p
                        style={{
                          fontSize: "calc(2px + 1.0vh)",
                          marginBottom: "5px",
                        }}
                      >
                        Revote is happening due to a tie. Please vote again.
                      </p>
                    )}
                    {voteComplete && (
                      <div>
                        <p
                          style={{
                            fontSize: "calc(2px + 1.0vh)",
                            marginBottom: "5px",
                          }}
                        >
                          Voting Complete
                        </p>
                        <p
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "calc(2px + 1.0vh)",
                            marginBottom: "5px",
                          }}
                        >
                          {voteResult === "tie"
                            ? "It's a tie!"
                            : `Person with the most votes: ${voteResult}`}
                        </p>
                        <p
                          style={{
                            fontSize: "calc(2px + 1.0vh)",
                            marginBottom: "5px",
                          }}
                        >
                          Countdown: {countdown}
                        </p>
                        {countdown === 0 && (
                          <p
                            style={{
                              fontSize: "calc(2px + 1.0vh)",
                              marginBottom: "5px",
                            }}
                          >
                            Real odd man out: {realOddManOut}
                          </p>
                        )}
                      </div>
                    )}
                    {gameComplete && (
                      <p
                        style={{
                          fontSize: "calc(2px + 1.0vh)",
                          marginBottom: "5px",
                        }}
                      >
                        Redirecting in {redirectCount} seconds...
                      </p>
                    )}
                  </>
                )}
              </>
            </div>
          ) : (
            <>
              {gameRuined ? (
                <>
                  <p
                    style={{
                      fontSize: "calc(2px + 1.0vh)",
                      marginBottom: "5px",
                    }}
                  >
                    {"GAME RUINED"}
                  </p>
                  <RedirectButton size={size} onClick={() => history.push("/")}>
                    Home
                  </RedirectButton>
                  <p
                    style={{
                      fontSize: "calc(2px + 1.0vh)",
                      marginBottom: "5px",
                    }}
                  >
                    Real odd man out: {realOddManOut}
                  </p>
                </>
              ) : (
                <>
                  <p
                    style={{
                      fontSize: "calc(2px + 1.0vh)",
                      marginBottom: "5px",
                    }}
                  >
                    {"Find the odd man out:"}
                  </p>
                  <p
                    style={{
                      fontSize: "calc(2px + 1.0vh)",
                      marginBottom: "5px",
                    }}
                  >
                    {gameInfo.omoIdentity}
                  </p>
                  <p
                    style={{
                      fontSize: "calc(2px + 1.0vh)",
                      marginBottom: "5px",
                    }}
                  >
                    {gameInfo.time}
                  </p>
                  <p style={{ fontSize: "calc(2px + 1.0vh)" }}>{"Remaining"}</p>
                </>
              )}
            </>
          )}
        </div>
      </GridItem>
      <TimedRedirectModal
        isOpen={allUsersLeft || !networkStatus}
        message="All users left, returning home"
        duration={3}
        networkStatus={networkStatus}
      />
    </GridContainer>
  );
};

export default VideoGrid;
