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
    height: 250px; width: 400px;
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

localStorage.debug = ''
const Room = (props) => {

   console.log("inside Room ------------------");
  const playerInfo = props.history.location.state;
  console.log('playerInfo?')
  console.log(playerInfo) 
  const name = {playerName: playerInfo.playerName}
  console.log('name?')
  console.log(name) 
  const oddOneOut = {oddOneOut: playerInfo.oddOneOut}
  console.log('oddOneOut?')
  console.log(oddOneOut) 
  const uid = {uid: playerInfo.uid}
  console.log('uid?')
  console.log(uid) 


    // ------------------- STATE VARIABLES ----------------
    const [peers, setPeers] = useState([]);
    //const [peerNames, setPeerNames]  = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);  //JAKEB Array of peers, Could expand this to class other user info, along with peer info
    const roomID = props.match.params.roomID;

    useEffect(() => {
        console.log("--------------useEffect 1---------------")
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

 
        console.log("--------------useEffect 2---------------")


        console.log('Begining of useEffect in Room.js');
 
        
        console.log('Trying to read peers from storage');
         
 
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

        console.log('Getting all users currently in room')
        socketRef.current = io.connect("/");
        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
            console.log('inside then----getUserMedia')
            userVideo.current.srcObject = stream; //JAKEB this is video data
            socketRef.current.emit("join room", {'roomID':roomID, 'name':name, 'OMO':oddOneOut, 'uid':uid}); //JAKEB emits join room to server?
            socketRef.current.on("all users", users => {  // JAKEB Return all users currently in the group video chat
                const initPeers = []; // JAKEB Create empty peers to add all existing peers
                users.forEach(userID => { //JAKEB Get each peer in the chat
                    const peer = createPeer(userID.socketID, socketRef.current.id, stream); //JAKEB Create peer object
                    console.log('userID')
                    console.log(userID)  
                    console.log('userID.name')
                    console.log(userID.name)
                    peersRef.current.push({  //JAKEB Important - Pushing a new player into array of players - will need to remove?
                        peerID: userID.socketID,  
                        peerName: userID.name,    
                        uid: userID.uid,    
                        peer,
                    })
                    initPeers.push({
                        'peerID': userID.socketID,
                        'peerName':userID.name,
                        'uid':userID.uid,
                        'peer': peer});
                })
                //console.log('----------------peers')
                //console.log(peers)
                if(initPeers.length > 0){
                    setPeers(initPeers); // JAKE Set peersRef state variable
                }
            })



            //------------------ Callbacks--------------------

            // JAKEB Callback for when someone joined the room?
            socketRef.current.on("user joined", payload => {
                console.log("--------------user joined---------------")
                const peer = addPeer(payload.signal, payload.callerID, stream);
                console.log('payload.userName.playerName')
                console.log(payload.userName.playerName)
                console.log('payload')
                console.log(payload)
                peersRef.current.push({
                    peerID: payload.callerID,
                    peerName: payload.userName.playerName,    
                    uid: payload.uid,
                    peer,
                })
                // console.log('Possuble unique IDS')
                // console.log('peer._id')
                // console.log(peer._id)
                // console.log('peer.channelName')
                // console.log(peer.channelName)
                // console.log(peer)
                //peerNames.push({ [peer._id] : payload.userName.playerName})
                //setPeerNames(oldArray => [...oldArray,{ [peer._id] : payload.userName.playerName}] );
                console.log('before adding peer to peers list:')
                console.log(peers)
                const tempPeer = {'peerID': payload.callerID, 'peerName':payload.userName.playerName, uid: payload.uid, 'peer': peer} 
                console.log('Adding peer to peers list:')
                console.log(tempPeer)
                setPeers(peers => [...peers, tempPeer]); // JAKEB update state variable, append to peersRef
            });
 
 
            socketRef.current.on("user left", id => {
                console.log('--------------user left handler---------------')
                console.log('peersRef before user left handler')
                console.log(peersRef)
                const peerObj = peersRef.current.find(p => p.peerID === id);
                if(peerObj){
                    peerObj.peer.destroy();
                }

                const peers = peersRef.current.filter(p => p.peerID !== id) 
                peersRef.current = peers;
                console.log('peers after user left')
                console.log(peers)




                // Attach name to peer

                
                
                console.log('peersRef after user left handler')
                console.log(peersRef) 
                
                setPeers(peers)  
                

            });


            socketRef.current.on("receiving returned signal", payload => {
                console.log("--------------receiving returned signal---------------")
                console.log('peersRef before receiving returned signal')
                console.log(peersRef)
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal); 

                console.log('peersRef after receiving returned signal')
                console.log(peersRef)
                //console.log("receiving returned signal  " + [item.peer._id] + "   " + "   " + payload.userName.playerName)
                //setPeerNames(oldArray => [...oldArray, { [item.peer._id] : payload.userName.playerName} ]);

            });
        }).catch((error) => {
            // TODO: Handle error where user web cam or microphone could not be found
            //console.log('inside catch----getUserMedia')
            console.error('error: ' + error);
          });
    }, []);

    // Handler for when peers state array is updated
    useEffect(() => {
        //console.log('Peers was updated saving all peer data into local storage')
        //console.log('writing peers.....')
        //console.log(peers) 
        //console.log('names')
        //console.log(peers.map(p => p.peerName))
        //window.localStorage.setItem('peers', JSON.stringify(peers)); 


      }, [peers]);

    window.onunload = function(){ 
        //console.log('Closing page --sending Disconnect--- Clearing Local Storage!!!!!!')
        socketRef.current.emit("disconnect")
    }

    window.onbeforeunload = function(){
        //console.log('Closing page --sending Disconnect--- Clearing Local Storage!!!!!!')
        socketRef.current.emit("disconnect")
 
        //localStorage.clear();
    }

    // JAKEB called when joining a room with players already in room. Called in useEffect to make list of players
    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({  // Peer is from third party NPM module called simple-peer
            initiator: true,
            trickle: false,
            stream,
        });
 
        peer.on("signal", signal => {
            console.log("--------------signal createPeer---------------")
            console.log('peersRef before signal createPeer')
            console.log(peersRef)
            console.log('name?')
            console.log(name)
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal, name, uid })
            console.log('peersRef after signal createPeer')
            console.log(peersRef)
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
            
            console.log("--------------signal addPeer---------------")
            socketRef.current.emit("returning signal", { signal, callerID, name })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    // function getUserName(peer){

    //     peerNames.forEach(element => {
    //         if(peer._id in element){
    //             //console.log('peer id is in peerNames')
    //             //console.log('element')
    //             //console.log(element)
    //             //console.log('peer._id')
    //             //console.log(peer._id)
    //             //console.log('element[peer._id]')
    //             //console.log(element[peer._id])
    //             const name = element[peer._id]
    //             //console.log('name')
    //             //console.log(name)
    //             return (<div><label style={{padding:5}}>{name}</label></div>);
    //             // console.log('Why am I passed a return statment')
    //         }
    //     })
    //     // console.log('did not find name in list!!!!!')
    //     //return <label style={{padding:5}}>{peer._id}</label>

    // }

    // console.log('peers.channelName')
    //peers.forEach(element => {
        console.log('peers--------')
        console.log(peers)
        console.log('peers.length--------')
        console.log(peers.length)
    //});
    // // console.log('peerNames')
    // peerNames.forEach(element => {
    //     // console.log(element)
    // });
    // // console.log('peers.channelName')
    // peers.forEach(element => { 
    //     // console.log(element._id)
    //     // console.log(peerNames)
    // });

    console.log('peers')
    console.log(peers)
    // const connectedPeers = peers.filter( p => p.peer._connected)
    // console.log('connectedPeers')
    // console.log(connectedPeers)
    
    const uniqueIds = [];
    const filteredPeers = peers.filter(element => {
        const isDuplicate = uniqueIds.includes(element.uid);
        console.log('uniqueIds')
        console.log(uniqueIds)
        console.log('element.uid')
        console.log(element.uid)
        console.log('isDuplicate')
        console.log(isDuplicate)

        if (!isDuplicate) {
            uniqueIds.push(element.uid);
            console.log("not a duplicate")

            return true;
        }
        console.log("Removing duplicate !!!")
        return false;
        })
    return ( 

        <Container style={{border: '5px solid rgba(0, 255, 255, 1)'}}> 
            <div style={{display: 'flex', flexWrap: 'wrap',  flexDirection:'row', justifyContent: 'center', alignItems: 'center', border: '5px solid rgba(0, 255, 0, 1)' }}>
                <div style={{display: 'flex',  flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: "250px", width: "400px", border: '5px solid rgba(255, 0, 0, 1)',}}>
                    <StyledVideo style={{border: '1px solid rgba(0, 0, 0, 1.0)', width:"100%"}} muted ref={userVideo} autoPlay playsInline />
                    <label style={{padding:5}}>{(typeof(name) !== 'undefined' && name != null)? name.playerName : 'empty' }</label>
                </div>    
             {(peers.length > 0) && filteredPeers.map((peer) => {
                 console.log('is peer connected - rendering peer')
                 console.log(peer.peerName + '  ' + peer.peer._connected + ' ' + peer.peer._connecting)
                return(
                    <div key={peer.peer._id} style={{display: 'flex',  flexDirection:'column', justifyContent: 'center', alignItems: 'center', border: '5px solid rgba(255, 255, 0, 1)',}}>
                        <Video style={{height: "250px", width: "400px", border: '1px solid rgba(0, 0, 0, 1.0)', }} key={peer.peerID} peer={peer.peer} />
                        <label style={{padding:5}}>{peer.peerName}</label>
                    </div>
                );
            })} 
            </div>
        </Container>
    );
};

export default Room;
