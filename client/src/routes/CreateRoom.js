import React, {  useState } from "react";
import { v1 as uuid } from "uuid";

const CreateRoom = (props) => {
    const [name, setname] = useState("");
    function create() {
        const id = uuid();
        console.log(name)
        props.history.push(`/room/${id}`, {playerName: name});
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
                <label style={{padding:5}}>Click to join game</label>
                {dummyPrompts.map(prompt => 
                 <div  style={listItemStyle}> 
                    <button  onClick={create} key={prompt}> {prompt} </button> 
                 </div>
                 )} 
        </div>
    );
};

export default CreateRoom;
