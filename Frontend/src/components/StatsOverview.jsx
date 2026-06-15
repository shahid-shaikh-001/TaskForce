export default function StatsOverview({ stats }) {
  if (!stats) {
    return null;
  }

  const cards = [
    {
      label: "Total Tasks",
      value: stats.total,
      className: "stat-card--primary",
    },
    {
      label: "Todo",
      value: stats.todo,
      className: "stat-card--neutral",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      className: "stat-card--warning",
    },
    {
      label: "Completed",
      value: stats.done,
      className: "stat-card--success",
    },
    {
      label: "Completion Rate",
      value: `${stats.completionPercentage}%`,
      className: "stat-card--primary",
    },
  ];

  return (
    <section className="stats-grid">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`stat-card ${card.className}`}
        >
          <div className="stat-card__indicator" />

          <div>
            <p className="stat-card__label">{card.label}</p>
            <h2 className="stat-card__value">{card.value}</h2>
          </div>
        </article>
      ))}
    </section>
  );
}