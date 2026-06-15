function getTaskStats(tasks) {
  const total = tasks.length;

  const todo = tasks.filter((task) => task.status === "todo").length;
  const inProgress = tasks.filter((task) => task.status === "in-progress").length;
  const done = tasks.filter((task) => task.status === "done").length;

  const lowPriority = tasks.filter((task) => task.priority === "low").length;
  const mediumPriority = tasks.filter((task) => task.priority === "medium").length;
  const highPriority = tasks.filter((task) => task.priority === "high").length;

  const bugs = tasks.filter((task) => task.category === "bug").length;
  const features = tasks.filter((task) => task.category === "feature").length;
  const enhancements = tasks.filter(
    (task) => task.category === "enhancement"
  ).length;

  return {
    total,
    todo,
    inProgress,
    done,
    completionPercentage: total === 0 ? 0 : Math.round((done / total) * 100),

    byPriority: {
      low: lowPriority,
      medium: mediumPriority,
      high: highPriority,
    },

    byCategory: {
      bug: bugs,
      feature: features,
      enhancement: enhancements,
    },
  };
}

module.exports = {
  getTaskStats,
};