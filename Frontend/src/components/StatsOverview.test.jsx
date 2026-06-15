import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import StatsOverview from "./StatsOverview";

const stats = {
  total: 10,
  todo: 4,
  inProgress: 3,
  done: 3,
  completionPercentage: 30,
};

describe("StatsOverview", () => {
  it("renders nothing when stats are unavailable", () => {
    const { container } = render(<StatsOverview stats={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders all task statistics", () => {
    render(<StatsOverview stats={stats} />);

    expect(screen.getByText("Total Tasks")).toBeInTheDocument();
    expect(screen.getByText("Todo")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Completion Rate")).toBeInTheDocument();

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getAllByText("3")).toHaveLength(2);
    expect(screen.getByText("30%")).toBeInTheDocument();
  });
});