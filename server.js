require('dotenv').config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const users = {};

const socketToRoom = {};

io.on('connection', socket => {
    socket.on("join room", payload => {
        console.log('payload')
        console.log(payload)
        if (users[payload.roomID]) {
            const length = users[payload.roomID].length;
            if (length === 4) {
                socket.emit("room full");
                return;
            }
            users[payload.roomID].push({'socketID':socket.id, name:payload.name.playerName});
        } else {
            users[payload.roomID] = [{'socketID':socket.id, name:payload.name.playerName}];
        }
        socketToRoom[socket.id] = payload.roomID;
        console.log('users')
        console.log(users)
        const usersInThisRoom = users[payload.roomID].filter(userData => userData.socketID !== socket.id);
        console.log('usersInThisRoom')
        console.log(usersInThisRoom)
        socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID, userName: payload.name });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id, userName:payload.name });
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
        }
    });

});

server.listen(process.env.PORT || 8000, () =>  console.log('server is running on port 8000'));

