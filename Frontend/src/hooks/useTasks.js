import { useEffect, useState } from "react";
import { fetchTasks, fetchStats } from "../services/api";
import { socket } from "../services/socket";

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(socket.connected);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [tasksData, statsData] = await Promise.all([
          fetchTasks(),
          fetchStats(),
        ]);

        setTasks(tasksData);
        setStats(statsData);
        setError("");
      } catch (loadError) {
        console.error("Failed to load board data:", loadError);

        setError(
          loadError.message || "Failed to load board data"
        );
      } finally {
        setLoading(false);
      }
    }

    function applyBoardData(data) {
      if (Array.isArray(data?.tasks)) {
        setTasks(data.tasks);
      }

      if (data?.stats) {
        setStats(data.stats);
      }
    }

    function handleConnect() {
      setConnected(true);
      setError("");
    }

    function handleDisconnect() {
      setConnected(false);
    }

    function handleConnectError(connectionError) {
      setConnected(false);

      console.error(
        "Socket connection failed:",
        connectionError.message
      );

      setError("Unable to connect to the TaskForge server");
    }

    function handleSync(data) {
      applyBoardData(data);
      setError("");
    }

    function handleTasksUpdated(data) {
      applyBoardData(data);
      setError("");
    }

    function handleTasksError(data) {
      setError(
        data?.message || "A real-time synchronization error occurred"
      );
    }

    loadData();

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("sync:tasks", handleSync);
    socket.on("tasks:updated", handleTasksUpdated);
    socket.on("tasks:error", handleTasksError);

    if (!socket.connected) {
      socket.connect();
    } else {
      setConnected(true);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("sync:tasks", handleSync);
      socket.off("tasks:updated", handleTasksUpdated);
      socket.off("tasks:error", handleTasksError);

      socket.disconnect();
    };
  }, []);

  function emitWithAck(eventName, payload) {
    return new Promise((resolve, reject) => {
      if (!socket.connected) {
        const operationError = new Error(
          "Server connection is unavailable"
        );

        setError(operationError.message);
        reject(operationError);
        return;
      }

      socket
        .timeout(60_000)
        .emit(eventName, payload, (timeoutError, response) => {
          if (timeoutError) {
            const operationError = new Error(
              "Server did not respond within 60 seconds. Please try again."
            );

            setError(operationError.message);
            reject(operationError);
            return;
          }

          if (!response?.success) {
            const operationError = new Error(
              response?.message || "Operation failed"
            );

            setError(operationError.message);
            reject(operationError);
            return;
          }

          /*
           * Apply the updated board from the acknowledgement.
           * This prevents the UI from depending only on the
           * separate tasks:updated broadcast.
           */
          if (Array.isArray(response.tasks)) {
            setTasks(response.tasks);
          }

          if (response.stats) {
            setStats(response.stats);
          }

          setError("");
          resolve(response);
        });
    });
  }

  async function createTask(taskData) {
    const response = await emitWithAck(
      "task:create",
      taskData
    );

    return response.task;
  }

  async function updateTask(taskId, updates) {
    const response = await emitWithAck("task:update", {
      id: taskId,
      ...updates,
    });

    return response.task;
  }

  async function moveTask(taskId, status) {
    const response = await emitWithAck("task:move", {
      id: taskId,
      status,
    });

    return response.task;
  }

  async function deleteTask(taskId) {
    const response = await emitWithAck("task:delete", {
      id: taskId,
    });

    return response.deletedTaskId;
  }

  function clearError() {
    setError("");
  }

  return {
    tasks,
    stats,
    loading,
    connected,
    error,
    clearError,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
  };
}