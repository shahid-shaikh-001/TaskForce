import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskFilters from "./TaskFilters";

function renderTaskFilters(overrides = {}) {
  const props = {
    search: "",
    priority: "all",
    category: "all",
    onSearchChange: vi.fn(),
    onPriorityChange: vi.fn(),
    onCategoryChange: vi.fn(),
    onClear: vi.fn(),
    ...overrides,
  };

  render(<TaskFilters {...props} />);

  return props;
}

describe("TaskFilters", () => {
  it("updates search, priority, and category filters", async () => {
    const user = userEvent.setup();
    const props = renderTaskFilters();

    await user.type(
      screen.getByRole("searchbox", {
        name: "Search",
      }),
      "backend"
    );

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: "Priority",
      }),
      "high"
    );

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: "Category",
      }),
      "bug"
    );

    expect(props.onSearchChange).toHaveBeenCalled();
    expect(props.onPriorityChange).toHaveBeenCalledWith("high");
    expect(props.onCategoryChange).toHaveBeenCalledWith("bug");
  });

  it("disables clear button when no filters are active", () => {
    renderTaskFilters();

    expect(
      screen.getByRole("button", {
        name: "Clear filters",
      })
    ).toBeDisabled();
  });

  it("shows active state and clears filters", async () => {
    const user = userEvent.setup();

    const props = renderTaskFilters({
      search: "task",
      priority: "high",
    });

    expect(screen.getByText("Filters active")).toBeInTheDocument();

    const clearButton = screen.getByRole("button", {
      name: "Clear filters",
    });

    expect(clearButton).toBeEnabled();

    await user.click(clearButton);

    expect(props.onClear).toHaveBeenCalledTimes(1);
  });
});