import { useEffect, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import AttachmentUploader from "./AttachmentUploader";

function formatLabel(value) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isImageAttachment(attachment) {
  const fileName = attachment.name || "";
  const fileUrl = attachment.url?.split("?")[0] || "";

  return (
    /\.(png|jpe?g|webp)$/i.test(fileName) ||
    /\.(png|jpe?g|webp)$/i.test(fileUrl)
  );
}

export default function TaskCard({
  task,
  onUpdateTask,
  onDeleteTask,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(
    task.description || ""
  );
  const [priority, setPriority] = useState(task.priority);
  const [category, setCategory] = useState(task.category);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
    data: {
      status: task.status,
    },
    disabled: isEditing,
  });

  const dragStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 20 : undefined,
      }
    : undefined;

  useEffect(() => {
    if (!isEditing) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setCategory(task.category);
    }
  }, [task, isEditing]);

  async function handleSave() {
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await onUpdateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
      });

      setIsEditing(false);
    } catch (saveError) {
      setError(saveError.message || "Failed to update task");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setCategory(task.category);
    setError("");
    setIsEditing(false);
  }

  async function handleDelete() {
    try {
      setDeleting(true);
      setError("");

      await onDeleteTask(task.id);
    } catch (deleteError) {
      console.error("Failed to delete task:", deleteError);
      setError(deleteError.message || "Failed to delete task");
      setDeleting(false);
    }
  }

  if (isEditing) {
    return (
      <article className="task-card task-card--editing">
        <div className="task-edit-form">
          <div className="form-field">
            <label htmlFor={`task-title-${task.id}`}>
              Title
            </label>

            <input
              id={`task-title-${task.id}`}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Task title"
            />
          </div>

          <div className="form-field">
            <label htmlFor={`task-description-${task.id}`}>
              Description
            </label>

            <textarea
              id={`task-description-${task.id}`}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Task description"
            />
          </div>

          <div className="task-edit-form__row">
            <div className="form-field">
              <label htmlFor={`task-priority-${task.id}`}>
                Priority
              </label>

              <select
                id={`task-priority-${task.id}`}
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value)
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor={`task-category-${task.id}`}>
                Category
              </label>

              <select
                id={`task-category-${task.id}`}
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
              >
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="enhancement">
                  Enhancement
                </option>
              </select>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="task-card__actions">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>

            <button
              type="button"
              className="button-secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      ref={setNodeRef}
      style={dragStyle}
      data-testid={`task-${task.id}`}
      className={`task-card task-card--priority-${task.priority} ${
        isDragging ? "task-card--dragging" : ""
      }`}
    >
      <div className="task-card__top">
        <div className="task-card__labels">
          <span
            className={`task-tag task-tag--${task.category}`}
          >
            {formatLabel(task.category)}
          </span>

          <span
            className={`priority-badge priority-badge--${task.priority}`}
          >
            {formatLabel(task.priority)}
          </span>
        </div>

        <button
          type="button"
          className="task-card__drag-handle"
          {...attributes}
          {...listeners}
          aria-label={`Drag ${task.title}`}
          title="Drag task"
        >
          ⠿
        </button>
      </div>

      <h4 className="task-card__title">{task.title}</h4>

      {task.description && (
        <p className="task-card__description">
          {task.description}
        </p>
      )}

      {task.attachments?.length > 0 && (
        <div className="task-attachments">
          <p className="task-attachments__title">
            Attachments ({task.attachments.length})
          </p>

          <div className="task-attachments__list">
            {task.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="task-attachment-item"
              >
                {isImageAttachment(attachment) && (
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="task-attachment-preview"
                    aria-label={`Open ${attachment.name}`}
                  >
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      loading="lazy"
                    />
                  </a>
                )}

                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="task-attachment"
                >
                  {attachment.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <AttachmentUploader taskId={task.id} />

      {error && <p className="form-error">{error}</p>}

      <div className="task-card__actions">
        <button
          type="button"
          className="button-secondary"
          onClick={() => {
            setError("");
            setIsEditing(true);
          }}
        >
          Edit
        </button>

        <button
          type="button"
          className="button-danger"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}