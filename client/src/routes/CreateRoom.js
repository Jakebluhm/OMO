import React, {  useState, useEffect } from "react";
import { v1 as uuid } from "uuid";
import Modal from "react-modal";

import "../ModalStyles/ModalStyle.css";


import AWS from 'aws-sdk';
import {putData} from '../awsLib/awsFunctions.js';


const CreateRoom = (props) => {

    const dynamoDb = new AWS.DynamoDB.DocumentClient();

    const [items, setItems] = useState([]);

    const [name, setname] = useState("");
    const [uuidNum, setuuid] = useState("");

    // Modal State
    const [isOpen, setIsOpen] = useState(false);
    const [modalIndex, setModalIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState(-1) // 1 is omo, 0 is not omo

    useEffect(() => {
        console.log('selectedAnswer was updated')
        console.log('selectAnswer')
        console.log(selectAnswer)



        
    
        const params = {
          TableName: "OMOUserQueue"
        };
        
        dynamoDb.scan(params, (err, data) => {
            if (err) {
              console.error(err);
            } else {
                console.error('data.Items');
                console.error(data.Items);
              setItems(data.Items);
            }
          }); 


        if(selectedAnswer !== -1){
            console.log("dummyPrompts.find(element => element.id === modalIndex).uuid  --- Calling create" )
            console.log(dummyPrompts.find(element => element.id === modalIndex).uuid)
            create(dummyPrompts.find(element => element.id === modalIndex).uuid);
        }
        // TODO:Check for valid answer, rooms will already have an omo and new omo should be prevented from entering

    }, [selectedAnswer]);

    // Toggle modal
    function toggleModal(id) {
        console.log("toggleModal()")

        //Only set id on open
        if(!isOpen){
            console.log('id')
            console.log(id)
            setModalIndex(id)
        }
      setIsOpen(!isOpen);
    }

    function selectAnswer(ans){
        console.log("selectAnswer()")
        console.log('ans')
        console.log(ans)
        setSelectedAnswer(ans)
        //create();
    }

    function create(id) {
        console.log("create()")
        const uid = uuid();
        // console.log(name)
        props.history.push(`/room/${id}`, {playerName: name, oddOneOut: selectedAnswer, uid:uid});
    }

    // Callback for joining with a specific UUID
    function join() { 
        console.log("join()")
        // console.log('uuidNum.length')
        // console.log(uuidNum.length)
        if(uuidNum.length > 20){
            // console.log('uuid is 128 in length')
        }
        else{ 
            // console.log('uuid is NOT 128 in length')
            return
        } 
        // console.log(uuid + ' < Joining ')
        props.history.push(`/room/${uuidNum}`, {playerName: name});
    }

    // Callback for confirm under Name entry
    async function confirmName() { 
        console.log("confirmName()")

        console.log("'name': " + name) 

        const params = {
            TableName: 'OMOUserQueue',
            Item: {
                'user': uuid(),
                'name': name
            }
        };
    
        try{
            const data = await dynamoDb.put(params).promise();
            console.log('Success', data);
        } 
        catch (err) {
            console.log('Error', err);
        }
        
    }


    const style = { display: 'flex', paddingTop:50, flexDirection:'column', justifyContent: 'center', alignItems: 'center', width: '..', height: '..'}
    const listItemStyle = {padding:10}


    // These will be read in from database
    // TODO: UUID can be assigned when prompt is created
    const dummyPrompts = [{id:0, uuid:"abc123", prompt:'Prompt 1', question:"Question 1?", omoAns:"ans1", notOmoAns:"ans2", count:0}, 
    {id:1, prompt:'Prompt 2', uuid:"xyz789", question:"Question 2?", omoAns:"ans1", notOmoAns:"ans2", count:0}, 
    {id:2, prompt:'Prompt 3', uuid:"jkl456", question:"Question 3", omoAns:"ans1", notOmoAns:"ans2", count:0}]

// <button onClick={create}>{dummyPrompts[0]}</button>
    return (
        <div  style={style}>   


            <div>
            <h2>AWS DynamoDB Document Client</h2>
            {items.map(item => (
                <div key={item.id}>
                <p>{item.user + " - " + item.name}</p>  
                </div>
            ))}
            </div>


            <div style={{paddingBottom:50, display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center',}}>
                <label style={{padding:5}}> Enter name</label>
                <input type="text" placeholder="name" value={name} onChange={e => setname(e.target.value)}></input>
                <button  onClick={confirmName} key={'confirmNameButton'}>Confirm</button> 
            </div>  
            <div style={{paddingBottom:50, display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center',}}>
                <label style={{padding:5}}> Enter uuid</label>
                <input type="text" placeholder="uuid" value={uuidNum} onChange={e => setuuid(e.target.value)}></input>
                <button  onClick={join} key={'joinUUID'}>Join with UUID</button> 
            </div>     
            <label style={{padding:5}}>Click to join game</label>
            {
                dummyPrompts.map(prompt => 
                <div  style={listItemStyle}> 
                    <button  onClick={() => { toggleModal(prompt.id);}} key={prompt.prompt}> {prompt.prompt} </button> 
                </div>)
            }
            <Modal
                isOpen={isOpen}
                onRequestClose={toggleModal}
                contentLabel="My dialog"
                className="mymodal"
                overlayClassName="myoverlay"
                closeTimeoutMS={500}
            >
                <div>{dummyPrompts.find(element => element.id === modalIndex).prompt}</div>
                <div>{dummyPrompts.find(element => element.id === modalIndex).question}</div>
                <div style={{display: 'flex', flexWrap: 'wrap',  flexDirection:'row', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(0, 255, 0, 1)' }}>
                    <button onClick={() => {selectAnswer(1); toggleModal();}} >{dummyPrompts.find(element => element.id === modalIndex).omoAns}</button>
                    <button onClick={() => {selectAnswer(0); toggleModal();}} >{dummyPrompts.find(element => element.id === modalIndex).notOmoAns}</button>
                </div> 
            </Modal> 
        </div>
    );
};

export default CreateRoom;
