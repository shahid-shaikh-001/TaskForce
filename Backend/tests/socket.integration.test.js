import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import http from "http";
import { Server } from "socket.io";
import { io as createSocketClient } from "socket.io-client";

import app from "../src/app.js";
import { registerTaskSocket } from "../src/sockets/task.socket.js";

let httpServer;
let socketServer;
let serverUrl;

const clients = [];
const createdTaskIds = new Set();

function waitForEvent(socket, eventName, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(eventName, handleEvent);
      reject(new Error(`Timed out waiting for ${eventName}`));
    }, timeout);

    function handleEvent(data) {
      clearTimeout(timer);
      resolve(data);
    }

    socket.once(eventName, handleEvent);
  });
}

async function connectClient() {
  const client = createSocketClient(serverUrl, {
    autoConnect: false,
    transports: ["websocket"],
    reconnection: false,
    forceNew: true,
  });

  clients.push(client);

  const syncPromise = waitForEvent(client, "sync:tasks");

  client.connect();

  await new Promise((resolve, reject) => {
    if (client.connected) {
      resolve();
      return;
    }

    const timer = setTimeout(() => {
      reject(new Error("Socket connection timed out"));
    }, 15000);

    client.once("connect", () => {
      clearTimeout(timer);
      resolve();
    });

    client.once("connect_error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });

  const syncData = await syncPromise;

  return {
    client,
    syncData,
  };
}

function emitWithAcknowledgement(socket, eventName, payload) {
  return new Promise((resolve, reject) => {
    socket.timeout(15000).emit(
      eventName,
      payload,
      (timeoutError, response) => {
        if (timeoutError) {
          reject(new Error(`Acknowledgement timed out for ${eventName}`));
          return;
        }

        if (!response?.success) {
          reject(new Error(response?.message || `${eventName} failed`));
          return;
        }

        resolve(response);
      }
    );
  });
}

beforeAll(async () => {
  httpServer = http.createServer(app);

  socketServer = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH", "DELETE"],
    },
  });

  app.set("io", socketServer);
  registerTaskSocket(socketServer);

  await new Promise((resolve) => {
    httpServer.listen(0, "127.0.0.1", resolve);
  });

  const address = httpServer.address();

  serverUrl = `http://127.0.0.1:${address.port}`;
});

afterEach(async () => {
  for (const client of clients.splice(0)) {
    client.removeAllListeners();
    client.disconnect();
  }

  for (const taskId of createdTaskIds) {
    try {
      await request(app).delete(`/api/tasks/${taskId}`);
    } catch {
      // Cleanup should not hide the original test result.
    }
  }

  createdTaskIds.clear();
});

afterAll(async () => {
  await new Promise((resolve) => {
    socketServer.close(resolve);
  });

  await new Promise((resolve) => {
    httpServer.close(resolve);
  });
});

describe("TaskForge WebSocket integration", () => {
  it("sends the current task board when a client connects", async () => {
    const { client, syncData } = await connectClient();

    expect(client.connected).toBe(true);
    expect(Array.isArray(syncData.tasks)).toBe(true);

    expect(syncData.stats).toEqual(
      expect.objectContaining({
        total: expect.any(Number),
        todo: expect.any(Number),
        inProgress: expect.any(Number),
        done: expect.any(Number),
        completionPercentage: expect.any(Number),
      })
    );
  });

  it("broadcasts a created task to another connected client", async () => {
    const { client: firstClient } = await connectClient();
    const { client: secondClient } = await connectClient();

    const title = `Socket integration task ${Date.now()}`;

    const secondClientUpdate = waitForEvent(
      secondClient,
      "tasks:updated"
    );

    const createResponse = await emitWithAcknowledgement(
      firstClient,
      "task:create",
      {
        title,
        description: "Created during the multi-client Socket.IO test",
        status: "todo",
        priority: "high",
        category: "feature",
      }
    );

    createdTaskIds.add(createResponse.task.id);

    const updateData = await secondClientUpdate;

    expect(createResponse.task).toMatchObject({
      title,
      status: "todo",
      priority: "high",
      category: "feature",
    });

    expect(updateData.tasks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createResponse.task.id,
          title,
        }),
      ])
    );

    expect(updateData.stats.total).toBeGreaterThanOrEqual(1);
  });

  it("broadcasts task movement to another connected client", async () => {
    const { client: firstClient } = await connectClient();
    const { client: secondClient } = await connectClient();

    const createUpdate = waitForEvent(
      secondClient,
      "tasks:updated"
    );

    const createResponse = await emitWithAcknowledgement(
      firstClient,
      "task:create",
      {
        title: `Movable socket task ${Date.now()}`,
        status: "todo",
        priority: "medium",
        category: "bug",
      }
    );

    createdTaskIds.add(createResponse.task.id);

    await createUpdate;

    const moveUpdate = waitForEvent(
      secondClient,
      "tasks:updated"
    );

    const moveResponse = await emitWithAcknowledgement(
      firstClient,
      "task:move",
      {
        id: createResponse.task.id,
        status: "done",
      }
    );

    const updatedBoard = await moveUpdate;

    expect(moveResponse.task.status).toBe("done");

    expect(updatedBoard.tasks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createResponse.task.id,
          status: "done",
        }),
      ])
    );
  });
});