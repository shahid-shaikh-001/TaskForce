import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";

const testTaskTitle = `Vitest Task ${Date.now()}`;
let createdTaskId = null;

describe("TaskForge API", () => {
  afterAll(async () => {
    // Cleanup if a test failed before the delete test completed.
    if (createdTaskId) {
      await request(app).delete(`/api/tasks/${createdTaskId}`);
    }
  });

  it("returns backend health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "TaskForge backend is running",
    });
  });

  it("returns 404 for an unknown route", async () => {
    const response = await request(app).get("/invalid-route");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Route not found: GET /invalid-route",
    });
  });

  it("rejects a task without a title", async () => {
    const response = await request(app).post("/api/tasks").send({
      description: "Missing title",
      priority: "medium",
      category: "feature",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation failed");
  });

  it("rejects an invalid task priority", async () => {
    const response = await request(app).post("/api/tasks").send({
      title: "Invalid priority task",
      priority: "urgent",
      category: "feature",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("rejects an invalid move status", async () => {
    const response = await request(app)
      .patch("/api/tasks/test-id/move")
      .send({
        status: "blocked",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  describe.sequential("Task CRUD operations", () => {
    it("creates a task", async () => {
      const response = await request(app).post("/api/tasks").send({
        title: testTaskTitle,
        description: "Created by the backend integration test",
        status: "todo",
        priority: "medium",
        category: "feature",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.task).toMatchObject({
        title: testTaskTitle,
        description: "Created by the backend integration test",
        status: "todo",
        priority: "medium",
        category: "feature",
      });

      expect(response.body.task.id).toBeTypeOf("string");

      createdTaskId = response.body.task.id;
    });

    it("returns the created task in the task list", async () => {
      const response = await request(app).get("/api/tasks");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.tasks)).toBe(true);

      expect(response.body.tasks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: createdTaskId,
            title: testTaskTitle,
          }),
        ])
      );
    });

    it("updates the task", async () => {
      const response = await request(app)
        .patch(`/api/tasks/${createdTaskId}`)
        .send({
          title: `${testTaskTitle} Updated`,
          description: "Updated through Vitest",
          priority: "high",
          category: "bug",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.task).toMatchObject({
        id: createdTaskId,
        title: `${testTaskTitle} Updated`,
        description: "Updated through Vitest",
        priority: "high",
        category: "bug",
      });
    });

    it("moves the task to done", async () => {
      const response = await request(app)
        .patch(`/api/tasks/${createdTaskId}/move`)
        .send({
          status: "done",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.task).toMatchObject({
        id: createdTaskId,
        status: "done",
      });
    });

    it("returns updated task statistics", async () => {
      const response = await request(app).get("/api/stats");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.stats).toEqual(
        expect.objectContaining({
          total: expect.any(Number),
          todo: expect.any(Number),
          inProgress: expect.any(Number),
          done: expect.any(Number),
          completionPercentage: expect.any(Number),
        })
      );

      expect(response.body.stats.total).toBeGreaterThanOrEqual(1);
      expect(response.body.stats.done).toBeGreaterThanOrEqual(1);
    });

    it("deletes the task", async () => {
      const response = await request(app).delete(
        `/api/tasks/${createdTaskId}`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      createdTaskId = null;
    });

    it("removes the deleted task from the task list", async () => {
      const response = await request(app).get("/api/tasks");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const deletedTaskStillExists = response.body.tasks.some(
        (task) => task.title === `${testTaskTitle} Updated`
      );

      expect(deletedTaskStillExists).toBe(false);
    });
  });
});