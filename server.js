const express = require("express");
const http = require("node:http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin:  "*", // Allow your client's origin
    methods: ["GET", "POST"],
  },
});



const cursors = new Map();

io.on("connection", (socket) => {
  console.log("A user connected");

  // Send current cursor state to the new user
  socket.emit("init", Array.from(cursors.values()));

  // Add the new user's cursor
  cursors.set(socket.id, { id: socket.id, x: 0, y: 0 });

  // Broadcast the new user to others
  socket.broadcast.emit("new_user", { id: socket.id, x: 0, y: 0 });

  socket.on("cursor_move", (data) => {
    const cursor = cursors.get(socket.id);
    
    if (cursor) {
      cursor.x = data.x;
      cursor.y = data.y;
      socket.broadcast.emit("cursor_move", { id: socket.id, ...data });
    }
  });

  socket.on("disconnect", () => {
    cursors.delete(socket.id);
    io.emit("user_disconnected", socket.id);
  });
});

const PORT = 4000;
server.listen(PORT,  () => {
  console.log(`Server is running on port ${PORT}`);
});

