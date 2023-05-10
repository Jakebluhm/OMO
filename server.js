require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const users = {}; //maybe rename to rooms?

const socketToRoom = {}; //collection of key (socket.id) value(RoomID)

io.on("connection", (socket) => {
  socket.on("join room", (payload) => {
    console.log("payload");
    console.log(payload);
    if (users[payload.roomID]) {
      var length = users[payload.roomID].length;
      if (length === 3) {
        socket.emit("room full");
        return;
      }
      users[payload.roomID].push({
        socketID: socket.id,
        name: payload.name.playerName,
        omo: payload.OMO.oddOneOut,
        uid: payload.uid.uid,
      });
    } else {
      users[payload.roomID] = [
        {
          socketID: socket.id,
          name: payload.name.playerName,
          omo: payload.OMO.oddOneOut,
          uid: payload.uid.uid,
        },
      ];
    }

    console.log("--------USERS---------");
    console.log("users:", users);

    //Not sure this is used
    io.emit("update users", {
      allUsers: users,
    });
    console.log(`Emitted update users event to room ${payload.roomID}`); // For server UI??

    socketToRoom[socket.id] = payload.roomID;

    // Add this socket connection (Client that triggered this) to the roomId they are in
    socket.join(payload.roomID);
    console.log("users");
    console.log(users);
    const usersInThisRoom = users[payload.roomID].filter(
      (userData) => userData.socketID !== socket.id
    );
    console.log("usersInThisRoom");
    console.log(usersInThisRoom);

    // length = users[payload.roomID].length;
    // if (length === 3) {
    //   console.log("--- Sending room ready to " + payload.roomID);
    //   io.in(payload.roomID).emit("room ready");
    // }

    //This needs to be sent to room specific socket, see above
    //socket.emit("all users", usersInThisRoom);
    io.in(payload.roomID).emit("all users", usersInThisRoom);
  });

  socket.on("vote cast", (payload) => {
    const { voterId, votedUserId, roomId } = payload;
    console.log("vote cast received!");
    console.log("voterId");
    console.log(voterId);
    console.log("votedUserId");
    console.log(votedUserId);
    console.log("roomId");
    console.log(roomId);
    // You can store the vote information in a data structure or process it as needed

    // Broadcast the vote information to other users in the same room
    io.in(roomId).emit("vote update", { voterId, votedUserId });
  });

  socket.on("sending signal", (payload) => {
    console.log("Emitting User Joined");
    // console.log('payload.uid.uid')
    // console.log(payload.uid.uid)
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
      userName: payload.name,
      uid: payload.uid.uid,
      omo: payload.oddOneOut.oddOneOut,
    });
  });

  socket.on("returning signal", (payload) => {
    console.log("Emitting receiving returned signal");
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
      userName: payload.name,
    });
  });

  socket.on("disconnect", () => {
    console.log("Disconnect!!");
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    console.log("Room before Disconnect:");
    console.log(room);
    if (room) {
      console.log("socket.id");
      console.log(socket.id);
      room = room.filter((id) => id.socketID !== socket.id);
      users[roomID] = room;
    }
    socket.broadcast.to(roomID).emit("user left", socket.id);

    console.log("Room after Disconnect:");
    console.log(room);
  });
});

// app.use(express.static(__dirname + '/server-public'));

// This was created to give a ui to the server.js file Keping it as i may need to use it later
// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/server-public/index.html");
// });

const path = require("path");

// This is for the server to grab the build folder after running npm run build in client
// Add this line to serve the static files from the React build folder
app.use(express.static(path.join(__dirname, "client/build")));

// Add this line to handle any other routes and serve the React app's index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

server.listen(process.env.PORT || 3000, () =>
  console.log("server is running on port 3000")
);
