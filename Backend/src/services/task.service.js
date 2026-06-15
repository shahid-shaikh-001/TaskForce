const prisma = require("../config/prisma");

const STATUS_MAP = {
  todo: "TODO",
  "in-progress": "IN_PROGRESS",
  done: "DONE",
};

const PRIORITY_MAP = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
};

const CATEGORY_MAP = {
  bug: "BUG",
  feature: "FEATURE",
  enhancement: "ENHANCEMENT",
};

function formatTask(task) {
  return {
    ...task,
    status: task.status.toLowerCase().replace("_", "-"),
    priority: task.priority.toLowerCase(),
    category: task.category.toLowerCase(),
  };
}

async function getAllTasks() {
  const tasks = await prisma.task.findMany({
    include: {
      attachments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return tasks.map(formatTask);
}

async function createTask(payload) {
  const title = payload?.title?.trim();

  if (!title) {
    throw new Error("Task title is required");
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: payload.description || "",
      status: STATUS_MAP[payload.status] || "TODO",
      priority: PRIORITY_MAP[payload.priority] || "MEDIUM",
      category: CATEGORY_MAP[payload.category] || "FEATURE",
      attachments: {
        create: Array.isArray(payload.attachments)
          ? payload.attachments.map((file) => ({
              name: file.name,
              url: file.url,
              size: file.size || null,
            }))
          : [],
      },
    },
    include: {
      attachments: true,
    },
  });

  return formatTask(task);
}

async function updateTask(id, payload) {
  const existingTask = await prisma.task.findUnique({
    where: { id },
  });

  if (!existingTask) {
    throw new Error("Task not found");
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      title: payload.title?.trim() || existingTask.title,
      description:
        payload.description !== undefined
          ? payload.description
          : existingTask.description,
      priority: PRIORITY_MAP[payload.priority] || existingTask.priority,
      category: CATEGORY_MAP[payload.category] || existingTask.category,
    },
    include: {
      attachments: true,
    },
  });

  return formatTask(task);
}

async function moveTask(id, status) {
  const mappedStatus = STATUS_MAP[status];

  if (!mappedStatus) {
    throw new Error("Invalid task status");
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      status: mappedStatus,
    },
    include: {
      attachments: true,
    },
  });

  return formatTask(task);
}

async function deleteTask(id) {
  await prisma.task.delete({
    where: { id },
  });

  return id;
}

async function addAttachment(taskId, attachmentData) {
  const existingTask = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!existingTask) {
    throw new Error("Task not found");
  }

  await prisma.attachment.create({
    data: {
      taskId,
      name: attachmentData.name,
      url: attachmentData.url,
      size: attachmentData.size || null,
    },
  });

  const updatedTask = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      attachments: true,
    },
  });

  return formatTask(updatedTask);
}

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  addAttachment,
};