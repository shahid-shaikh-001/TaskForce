const express = require("express");
const taskController = require("../controllers/task.controller");
const validate = require("../middlewares/validate.middleware");
const upload = require("../middlewares/upload.middleware");
const attachmentController = require("../controllers/attachment.controller");

const {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
} = require("../validations/task.validation");

const router = express.Router();

router.get("/tasks", taskController.getTasks);
router.get("/stats", taskController.getStats);
router.post(
  "/tasks/:id/attachments",
  upload.single("file"),
  attachmentController.uploadAttachment
);
router.post("/tasks", validate(createTaskSchema), taskController.createTask);
router.patch("/tasks/:id", validate(updateTaskSchema), taskController.updateTask);
router.patch("/tasks/:id/move", validate(moveTaskSchema), taskController.moveTask);
router.delete("/tasks/:id", taskController.deleteTask);

module.exports = router;