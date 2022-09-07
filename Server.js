const express = require("express");
const app = express();

const server = require("http").Server(app);
const socketIO = require("socket.io");
const io = socketIO(server);
// const io = require("socket.io")(app);
const { v4: uuidV4 } = require("uuid");
const { ExpressPeerServer } = require("peer");
// const { disconnect } = require("process");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
// Announsement of app
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

// io.on("connection", (socket) => {
//   socket.on("join-room", (roomId) => {
//     console.log("me joined");
//   });
// });
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    //messages
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});
const PORT = process.env.PORT;
// server.listen(443, (err) => console.log("lisening and running on "));
app.listen(PORT || 4000);
(err) => console.log(`lisening and running on Http://localhost:${PORT}`);
