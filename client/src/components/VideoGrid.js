import React from "react";
import styled from "styled-components";
import { Video } from "../routes/Room"; // adjust the path to match your project structure

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px;
  height: 100vh; /* adjust as needed */
  width: 100vw; /* adjust as needed */
`;

const GridItem = styled.div`
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
  return (
    <GridContainer>
      <GridItem>
        <StyledVideo muted ref={userVideo} autoPlay playsInline />
      </GridItem>
      {filteredPeers.map((peer, index) => {
        if (index < 2) {
          // Only take the first two peers
          return (
            <GridItem key={peer.peerID}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  border: "3px solid rgba(0, 255, 0, 1)",
                }}
              >
                <Video
                  style={{ display: "flex", flex: 1 }}
                  key={peer.peerID}
                  peer={peer.peer}
                  onVideoReady={handleVideoReady}
                />
                <label style={{ padding: 5 }}>{peer.peerName}</label>
              </div>
            </GridItem>
          );
        }
      })}
      <GridItem>
        <p>{gameInfo}</p>
      </GridItem>
    </GridContainer>
  );
};

export default VideoGrid;
