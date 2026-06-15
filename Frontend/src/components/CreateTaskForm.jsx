import { useState } from "react";

export default function CreateTaskForm({ onCreateTask }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("feature");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await onCreateTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        status: "todo",
      });

      setTitle("");
      setDescription("");
      setPriority("medium");
      setCategory("feature");
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="create-panel">
      <div className="create-panel__header">
        <div>
          <h2 className="create-panel__title">Create a new task</h2>
          <p className="create-panel__subtitle">
            Add work to the board and keep your team synchronized.
          </p>
        </div>

        <span className="create-panel__badge">New task</span>
      </div>

      <form className="create-form" onSubmit={handleSubmit}>
        <div className="form-field form-field--wide">
          <label htmlFor="task-title">Title</label>

          <input
            id="task-title"
            type="text"
            placeholder="What needs to be completed?"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="form-field form-field--wide">
          <label htmlFor="task-description">Description</label>

          <textarea
            id="task-description"
            placeholder="Add useful context for this task..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="task-priority">Priority</label>

          <select
            id="task-priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="task-category">Category</label>

          <select
            id="task-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="enhancement">Enhancement</option>
          </select>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="create-form__actions">
          <button type="submit" disabled={submitting}>
            {submitting ? "Creating task..." : "Create task"}
          </button>
        </div>
      </form>
    </section>
  );
}