import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Video } from "../routes/Room"; // adjust the path to match your project structure
// Base size of the squares, this can be adjusted as needed
const BASE_SIZE = 50;
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, ${(props) => props.size}px);
  grid-template-rows: repeat(2, ${(props) => props.size}px);
  gap: 10px;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
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
}) => {
  const [size, setSize] = useState(BASE_SIZE);

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

  return (
    <GridContainer size={size}>
      <GridItem size={size}>
        <StyledVideo muted ref={userVideo} autoPlay playsInline />
      </GridItem>
      {filteredPeers.map((peer, index) => {
        if (index < 2) {
          // Only take the first two peers
          return (
            <GridItem key={peer.peerID} size={size}>
              <Video
                style={{ display: "flex", flex: 1 }}
                key={peer.peerID}
                peer={peer.peer}
                onVideoReady={handleVideoReady}
              />
              <label
                style={{
                  position: "absolute",
                  alignSelf: "flex-end",
                  padding: 5,
                  fontWeight: "bold",
                }}
              >
                {peer.peerName}
              </label>
            </GridItem>
          );
        }
      })}
      <GridItem size={size}>
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
          {isModalOpen ? (
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
          ) : (
            <>
              <h2 style={{fontSize: 'calc(10px + 1.8vh)', marginBottom: '0.1vh'}}>{"Find the odd man out:"}</h2>
              <p style={{fontSize: 'calc(10px + 1.5vh)', marginBottom: '2vh'}}>{gameInfo.omoIdentity}</p>
              <h2 style={{fontSize: 'calc(10px + 1.8vh)', marginBottom: '0.1vh'}}>{gameInfo.time}</h2>
              <p style={{fontSize: 'calc(10px + 1.5vh)'}}>{"Remaining"}</p>
            </>
          )}
        </div>
      </GridItem>

    </GridContainer>
  );
};

export default VideoGrid;
