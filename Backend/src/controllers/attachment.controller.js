const taskService = require("../services/task.service");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const { getTaskStats } = require("../utils/stats");

async function uploadAttachment(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname
    );

    const task = await taskService.addAttachment(req.params.id, {
      name: req.file.originalname,
      url: uploadResult.secure_url,
      size: req.file.size,
    });

    const io = req.app.get("io");

    if (io) {
      const tasks = await taskService.getAllTasks();

      io.emit("tasks:updated", {
        tasks,
        stats: getTaskStats(tasks),
      });
    }

    res.status(201).json({
      success: true,
      message: "Attachment uploaded successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadAttachment,
};