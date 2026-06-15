require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const { registerTaskSocket } = require("./sockets/task.socket");

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5174";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
});

// Makes Socket.IO available inside controllers through req.app.get("io")
app.set("io", io);

registerTaskSocket(io);

server.listen(PORT, () => {
  console.log(`TaskForge backend running on port ${PORT}`);
});