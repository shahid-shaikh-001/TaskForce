const taskService = require("../services/task.service");
const { getTaskStats } = require("../utils/stats");

async function getTasks(req, res, next) {
  try {
    const tasks = await taskService.getAllTasks();

    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    next(error);
  }
}

async function getStats(req, res, next) {
  try {
    const tasks = await taskService.getAllTasks();
    const stats = getTaskStats(tasks);

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const task = await taskService.createTask(req.body);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
}

async function moveTask(req, res, next) {
  try {
    const task = await taskService.moveTask(req.params.id, req.body.status);

    res.status(200).json({
      success: true,
      message: "Task moved successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const deletedTaskId = await taskService.deleteTask(req.params.id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      deletedTaskId,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTasks,
  getStats,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
};