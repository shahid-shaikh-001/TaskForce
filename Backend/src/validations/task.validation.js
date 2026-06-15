const { z } = require("zod");

const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in-progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  category: z.enum(["bug", "feature", "enhancement"]).optional(),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url(),
        size: z.number().optional(),
      })
    )
    .optional(),
});

const updateTaskSchema = createTaskSchema.partial();

const moveTaskSchema = z.object({
  status: z.enum(["todo", "in-progress", "done"]),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
};