import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";

export default function TaskColumn({
  title,
  status,
  tasks,
  onUpdateTask,
  onDeleteTask,
}) {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      data-testid={`column-${status}`}
      aria-label={`${title} column`}
      className={`task-column task-column--${status} ${
        isOver ? "task-column--drag-over" : ""
      }`}
    >
      <header className="task-column__header">
        <div className="task-column__heading">
          <span className="task-column__dot" />
          <h3>{title}</h3>
        </div>

        <span className="task-column__count">
          {tasks.length}
        </span>
      </header>

      <div className="task-column__content">
        {tasks.length === 0 ? (
          <div className="task-column__empty">
            <p>No tasks here</p>
            <span>Drag a task into this column.</span>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
}