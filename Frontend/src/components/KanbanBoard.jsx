import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import TaskColumn from "./TaskColumn";

export default function KanbanBoard({
  tasks,
  onUpdateTask,
  onMoveTask,
  onDeleteTask,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const todoTasks = tasks.filter(
    (task) => task.status === "todo"
  );

  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress"
  );

  const doneTasks = tasks.filter(
    (task) => task.status === "done"
  );

  async function handleDragEnd(event) {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const taskId = String(active.id);
    const destinationStatus = String(over.id);

    const validStatuses = [
      "todo",
      "in-progress",
      "done",
    ];

    if (!validStatuses.includes(destinationStatus)) {
      return;
    }

    const activeTask = tasks.find(
      (task) => task.id === taskId
    );

    if (
      !activeTask ||
      activeTask.status === destinationStatus
    ) {
      return;
    }

    try {
      await onMoveTask(taskId, destinationStatus);
    } catch (error) {
      console.error("Failed to move task:", error);
    }
  }

  return (
    <section className="board-section">
      <div className="board-section__header">
        <div>
          <h2 className="board-section__title">
            Task board
          </h2>

          <p className="board-section__subtitle">
            Drag tasks between columns to update their status.
          </p>
        </div>

        <span className="board-task-count">
          {tasks.length}{" "}
          {tasks.length === 1 ? "task" : "tasks"}
        </span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board">
          <TaskColumn
            title="Todo"
            status="todo"
            tasks={todoTasks}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />

          <TaskColumn
            title="In Progress"
            status="in-progress"
            tasks={inProgressTasks}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />

          <TaskColumn
            title="Done"
            status="done"
            tasks={doneTasks}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        </div>
      </DndContext>
    </section>
  );
}