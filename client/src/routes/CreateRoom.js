import React from "react";
import { v1 as uuid } from "uuid";

const CreateRoom = (props) => {
    
    function create() {
        const id = uuid();
        props.history.push(`/room/${id}`);
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
                {dummyPrompts.map(prompt => 
                 <div  style={listItemStyle}> 
                    <button  onClick={create} key={prompt}> {prompt} </button> 
                 </div>
                 )} 
        </div>
    );
};

export default CreateRoom;
