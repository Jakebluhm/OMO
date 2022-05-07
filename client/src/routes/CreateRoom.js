import React, {  useState } from "react";
import { v1 as uuid } from "uuid";

const CreateRoom = (props) => {
    const [name, setname] = useState("");
    const [uuidNum, setuuid] = useState("");
    function create() {
        const id = uuid();
        // console.log(name)
        props.history.push(`/room/${id}`, {playerName: name});
    }
    function join() { 
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
    const style = { display: 'flex', paddingTop:50, flexDirection:'column', justifyContent: 'center', alignItems: 'center', width: '..', height: '..'}
    const listItemStyle = {padding:10}


    // These will be read in from database
    const dummyPrompts = ['Odd man out - 5 Straight 1 Gay', 
    'Odd man out - 5 Kanye fans 1 imposter', 
    'Odd man out - 5 one direction fans 1 imposter']

// <button onClick={create}>{dummyPrompts[0]}</button>
    return (
        <div  style={style}>   
            <div style={{paddingBottom:50, display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center',}}>
                <label style={{padding:5}}> Enter name</label>
                <input type="text" placeholder="name" value={name} onChange={e => setname(e.target.value)}></input>
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
                    <button  onClick={create} key={prompt}> {prompt} </button> 
                </div>)
            } 
        </div>
    );
};

export default CreateRoom;
