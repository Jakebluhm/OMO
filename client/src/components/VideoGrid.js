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
        <p>{"Find the odd man out:"}</p>
        <p>{gameInfo.omoIdentity}</p>
        <p>{gameInfo.time}</p>
        <p>{"Remaining"}</p>
      </GridItem>
    </GridContainer>
  );
};

export default VideoGrid;
