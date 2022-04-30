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
    height: 40%;
    width: 50%;
`;

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, []);

    return (
        <StyledVideo playsInline autoPlay ref={ref} />
    );
}


const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const Room = (props) => {
    // ------------------- STATE VARIABLES ----------------
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);  //JAKEB Array of peers, Could expand this to class other user info, along with peer info
    const roomID = props.match.params.roomID;

    // JAKEB useEffect updates when state variables(above) that are in brackets at the bottom
    // of function change value. In this case no variables are specified so it runs when this
    // Component mounts aka displays to screen
    useEffect(() => {
        socketRef.current = io.connect("/");
        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
            userVideo.current.srcObject = stream; //JAKEB this is video data
            socketRef.current.emit("join room", roomID); //JAKEB emits join room to server?
            socketRef.current.on("all users", users => {  // JAKEB Return all users currently in the group video chat
                const peers = []; // JAKEB Create empty peers to add all existing peers
                users.forEach(userID => { //JAKEB Get each peer in the chat
                    const peer = createPeer(userID, socketRef.current.id, stream); //JAKEB Create peer object
                    peersRef.current.push({  //JAKEB Important - Pushing a new player into array of players - will need to remove?
                        peerID: userID,     //JAKEB Important I think you can send data btw peers here, name would be important
                        peer,
                    })
                    peers.push(peer);
                })
                setPeers(peers); // JAKE Set peersRef state variable
            })



            //------------------ Callbacks--------------------


            // JAKEB Callback for when someone joined the room?
            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                })

                setPeers(users => [...users, peer]); // JAKEB update state variable, append to peersRef
            });



            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });
        })
    }, []);

    // JAKEB called when joining a room with players already in room. Called in useEffect to make list of players
    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({  // Peer is from third party NPM module called simple-peer
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    // JAKE Add new player to current call that this user is already in
    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    return (
        <Container>
            <StyledVideo muted ref={userVideo} autoPlay playsInline />
            {peers.map((peer, index) => {
                return (
                    <Video key={index} peer={peer} />
                );
            })}
        </Container>
    );
};

export default Room;
