import React from "react";
import styled from "styled-components";
import { Video } from "../routes/Room"; // adjust the path to match your project structure

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px;
`;

const GridItem = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%; // Add this line to make GridItem a square
  border: 1px solid black;
  flex: 0.5;
`;

const GridItemContent = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
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
        <GridItemContent>
          <StyledVideo muted ref={userVideo} autoPlay playsInline />
        </GridItemContent>
      </GridItem>
      {filteredPeers.map((peer, index) => {
        if (index < 2) {
          // Only take the first two peers
          return (
            <GridItem key={peer.peerID}>
              <GridItemContent>
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
              </GridItemContent>
            </GridItem>
          );
        }
      })}
      <GridItem>
        <GridItemContent>
          <p>{gameInfo}</p>
        </GridItemContent>
      </GridItem>
    </GridContainer>
  );
};

export default VideoGrid;
