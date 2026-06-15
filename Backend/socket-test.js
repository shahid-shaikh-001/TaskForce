const { io } = require("socket.io-client");

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit(
    "task:create",
    {
      title: "Realtime Task",
      description: "Testing Socket",
      priority: "high",
      category: "feature",
      status: "todo",
    },
    (response) => {
      console.log("CREATE RESPONSE:");
      console.log(response);
    }
  );
});

socket.on("sync:tasks", (data) => {
  console.log("SYNC:");
  console.log(data);
});

socket.on("tasks:updated", (data) => {
  console.log("UPDATED:");
  console.log(data);

  setTimeout(() => {
    socket.disconnect();
    process.exit(0);
  }, 1000);
});

socket.on("connect_error", (err) => {
  console.log("ERROR:", err.message);
});