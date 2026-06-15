const taskService = require("../services/task.service");
const { getTaskStats } = require("../utils/stats");

async function emitTasksUpdated(io) {
  const tasks = await taskService.getAllTasks();

  const boardData = {
    tasks,
    stats: getTaskStats(tasks),
  };

  io.emit("tasks:updated", boardData);

  return boardData;
}

function registerTaskSocket(io) {
  io.on("connection", async (socket) => {
    console.log("User connected:", socket.id);

    try {
      const tasks = await taskService.getAllTasks();

      socket.emit("sync:tasks", {
        tasks,
        stats: getTaskStats(tasks),
      });
    } catch (error) {
      console.error("Failed to synchronize tasks:", error);

      socket.emit("tasks:error", {
        message: error.message || "Failed to synchronize tasks",
      });
    }

    socket.on("task:create", async (payload, callback) => {
      try {
        const task = await taskService.createTask(payload);
        const boardData = await emitTasksUpdated(io);

        callback?.({
          success: true,
          task,
          ...boardData,
        });
      } catch (error) {
        callback?.({
          success: false,
          message: error.message || "Failed to create task",
        });
      }
    });

    socket.on("task:update", async (payload, callback) => {
      try {
        const task = await taskService.updateTask(
          payload.id,
          payload
        );

        const boardData = await emitTasksUpdated(io);

        callback?.({
          success: true,
          task,
          ...boardData,
        });
      } catch (error) {
        callback?.({
          success: false,
          message: error.message || "Failed to update task",
        });
      }
    });

    socket.on("task:move", async (payload, callback) => {
      try {
        const task = await taskService.moveTask(
          payload.id,
          payload.status
        );

        const boardData = await emitTasksUpdated(io);

        callback?.({
          success: true,
          task,
          ...boardData,
        });
      } catch (error) {
        callback?.({
          success: false,
          message: error.message || "Failed to move task",
        });
      }
    });

    socket.on("task:delete", async (payload, callback) => {
      try {
        const deletedTaskId = await taskService.deleteTask(
          payload.id
        );

        const boardData = await emitTasksUpdated(io);

        callback?.({
          success: true,
          deletedTaskId,
          ...boardData,
        });
      } catch (error) {
        callback?.({
          success: false,
          message: error.message || "Failed to delete task",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}

module.exports = {
  registerTaskSocket,
};