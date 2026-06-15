export default function TaskFilters({
  search,
  priority,
  category,
  onSearchChange,
  onPriorityChange,
  onCategoryChange,
  onClear,
}) {
  const filtersActive =
    search.trim() || priority !== "all" || category !== "all";

  return (
    <section className="filters-panel">
      <div className="filters-panel__header">
        <div>
          <h2 className="filters-panel__title">Board filters</h2>
          <p className="filters-panel__subtitle">
            Search tasks or narrow the board by priority and category.
          </p>
        </div>

        {filtersActive && (
          <span className="filters-panel__active">Filters active</span>
        )}
      </div>

      <div className="filters-grid">
        <div className="form-field filters-search">
          <label htmlFor="task-search">Search</label>

          <input
            id="task-search"
            type="search"
            placeholder="Search title or description..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="priority-filter">Priority</label>

          <select
            id="priority-filter"
            value={priority}
            onChange={(event) => onPriorityChange(event.target.value)}
          >
            <option value="all">All priorities</option>
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="category-filter">Category</label>

          <select
            id="category-filter"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="all">All categories</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="enhancement">Enhancement</option>
          </select>
        </div>

        <div className="filters-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={onClear}
            disabled={!filtersActive}
          >
            Clear filters
          </button>
        </div>
      </div>
    </section>
  );
}