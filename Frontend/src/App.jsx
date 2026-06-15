import { useState } from "react";
import KanbanBoard from "./components/KanbanBoard";
import CreateTaskForm from "./components/CreateTaskForm";
import StatsOverview from "./components/StatsOverview";
import TaskProgressChart from "./components/TaskProgressChart";
import TaskFilters from "./components/TaskFilters";
import ErrorBanner from "./components/ErrorBanner";
import { useTasks } from "./hooks/useTasks";

function App() {
  const {
    tasks,
    stats,
    loading,
    connected,
    error,
    clearError,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
  } = useTasks();

  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");

  const filteredTasks = tasks.filter((task) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      task.title.toLowerCase().includes(query) ||
      (task.description || "").toLowerCase().includes(query);

    const matchesPriority =
      priority === "all" || task.priority === priority;

    const matchesCategory =
      category === "all" || task.category === category;

    return matchesSearch && matchesPriority && matchesCategory;
  });

  function clearFilters() {
    setSearch("");
    setPriority("all");
    setCategory("all");
  }

  if (loading) {
    return (
      <div className="loading-screen">
        Loading TaskForge...
      </div>
    );
  }

  return (
    <div className="app-shell">
      <main className="app-container">
        <header className="app-header">
          <div className="app-brand">
            <div className="app-logo">TF</div>

            <div>
              <h1 className="app-title">TaskForge</h1>

              <p className="app-subtitle">
                Real-time task management for focused teams
              </p>
            </div>
          </div>

          <div
            className={`connection-status ${
              connected
                ? "connection-status--online"
                : "connection-status--offline"
            }`}
          >
            <span className="connection-dot" />

            {connected
              ? "Live workspace"
              : "Reconnecting..."}
          </div>
        </header>

        <ErrorBanner
          message={error}
          onDismiss={clearError}
        />

        <StatsOverview stats={stats} />

        <TaskProgressChart stats={stats} />

        <CreateTaskForm onCreateTask={createTask} />

        <TaskFilters
          search={search}
          priority={priority}
          category={category}
          onSearchChange={setSearch}
          onPriorityChange={setPriority}
          onCategoryChange={setCategory}
          onClear={clearFilters}
        />

        <KanbanBoard
          tasks={filteredTasks}
          onUpdateTask={updateTask}
          onMoveTask={moveTask}
          onDeleteTask={deleteTask}
        />
      </main>
    </div>
  );
}

export default App;