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

  // console.log("inside Room ------------------");
  const name = props.history.location.state;
  // console.log('name?')
  // console.log(name)


    // ------------------- STATE VARIABLES ----------------
    const [peers, setPeers] = useState([]);
    const [peerNames, setPeerNames]  = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);  //JAKEB Array of peers, Could expand this to class other user info, along with peer info
    const roomID = props.match.params.roomID;

    // JAKEB useEffect updates when state variables(above) that are in brackets at the bottom
    // of function change value. In this case no variables are specified so it runs when this
    // Component mounts aka displays to screen
    useEffect(() => {
         console.log('Begining of useEffect in Room.js')
        socketRef.current = io.connect("/");
        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
            console.log('inside then----getUserMedia')
            userVideo.current.srcObject = stream; //JAKEB this is video data
            socketRef.current.emit("join room", {'roomID':roomID, 'name':name}); //JAKEB emits join room to server?
            socketRef.current.on("all users", users => {  // JAKEB Return all users currently in the group video chat
                const peers = []; // JAKEB Create empty peers to add all existing peers
                users.forEach(userID => { //JAKEB Get each peer in the chat
                    const peer = createPeer(userID.socketID, socketRef.current.id, stream); //JAKEB Create peer object
                    peersRef.current.push({  //JAKEB Important - Pushing a new player into array of players - will need to remove?
                        peerID: userID.socketID,     //JAKEB Important I think you can send data btw peers here, name would be important 
                        peer,
                    })
                    peers.push({'peer': peer, 'peerName':userID.name});
                })
                console.log('----------------peers')
                console.log(peers)
                if(peers.length > 0){
                    setPeers(peers); // JAKE Set peersRef state variable
                }
            })



            //------------------ Callbacks--------------------

            // JAKEB Callback for when someone joined the room?
            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    userName: payload.userName,
                    peer,
                })
                // console.log('Possuble unique IDS')
                // console.log('peer._id')
                // console.log(peer._id)
                // console.log('peer.channelName')
                // console.log(peer.channelName)
                // console.log(peer)
                //peerNames.push({ [peer._id] : payload.userName.playerName})
                setPeerNames(oldArray => [...oldArray,{ [peer._id] : payload.userName.playerName}] );
                const tempPeer = {'peer': peer, 'peerName':payload.userName.playerName} 
                setPeers([...peers, tempPeer]); // JAKEB update state variable, append to peersRef
            });



            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal); 

                console.log("receiving returned signal  " + [item.peer._id] + "   " + "   " + payload.userName.playerName)
                setPeerNames(oldArray => [...oldArray, { [item.peer._id] : payload.userName.playerName} ]);

            });
        }).catch((error) => {
            // TODO: Handle error where user web cam or microphone could not be found
            console.log('inside catch----getUserMedia')
            console.error('error: ' + error);
          });
    }, []);

    // JAKEB called when joining a room with players already in room. Called in useEffect to make list of players
    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({  // Peer is from third party NPM module called simple-peer
            initiator: true,
            trickle: false,
            stream,
        });
 
        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal, name })
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
            socketRef.current.emit("returning signal", { signal, callerID, name })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    function getUserName(peer){

        peerNames.forEach(element => {
            if(peer._id in element){
                console.log('peer id is in peerNames')
                console.log('element')
                console.log(element)
                console.log('peer._id')
                console.log(peer._id)
                console.log('element[peer._id]')
                console.log(element[peer._id])
                const name = element[peer._id]
                console.log('name')
                console.log(name)
                return (<div><label style={{padding:5}}>{name}</label></div>);
                // console.log('Why am I passed a return statment')
            }
        })
        // console.log('did not find name in list!!!!!')
        //return <label style={{padding:5}}>{peer._id}</label>

    }

    // console.log('peers.channelName')
    // peers.forEach(element => {
    //     // console.log(element.channelName)
    // });
    // // console.log('peerNames')
    // peerNames.forEach(element => {
    //     // console.log(element)
    // });
    // // console.log('peers.channelName')
    // peers.forEach(element => { 
    //     // console.log(element._id)
    //     // console.log(peerNames)
    // });

    return ( 

        <Container style={{border: '5px solid rgba(0, 255, 255, 1)'}}> 
            <div style={{display: 'flex', flexWrap: 'wrap',  flexDirection:'row', justifyContent: 'center', alignItems: 'center', border: '5px solid rgba(0, 255, 0, 1)' }}>
                <div style={{display: 'flex',  flexDirection:'column', justifyContent: 'center', alignItems: 'center', border: '5px solid rgba(255, 0, 0, 1)',}}>
                    <StyledVideo style={{border: '1px solid rgba(0, 0, 0, 1.0)',}} muted ref={userVideo} autoPlay playsInline />
                    <label style={{padding:5}}>{(typeof(name) !== 'undefined' && name != null)? name.playerName : 'empty' }</label>
                </div>    
             {peers.map((peer, index) => {
                 console.log('rendering peer')
                 console.log(peer)
                return (
                    <div key={peer.peer._id} style={{display: 'flex',  flexDirection:'column', justifyContent: 'center', alignItems: 'center', border: '5px solid rgba(255, 255, 0, 1)',}}>
                        <Video key={index} peer={peer.peer} />
                        <label style={{padding:5}}>{peer.peerName}</label>
                    </div>
                );
            })} 
            </div>
        </Container>
    );
};

export default Room;
