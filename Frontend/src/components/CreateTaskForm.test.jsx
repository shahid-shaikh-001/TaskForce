import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateTaskForm from "./CreateTaskForm";

describe("CreateTaskForm", () => {
  it("shows validation error when title is empty", async () => {
    const user = userEvent.setup();
    const onCreateTask = vi.fn();

    render(<CreateTaskForm onCreateTask={onCreateTask} />);

    await user.click(
      screen.getByRole("button", {
        name: "Create task",
      })
    );

    expect(
      screen.getByText("Task title is required")
    ).toBeInTheDocument();

    expect(onCreateTask).not.toHaveBeenCalled();
  });

  it("submits valid task data", async () => {
    const user = userEvent.setup();
    const onCreateTask = vi.fn().mockResolvedValue({});

    render(<CreateTaskForm onCreateTask={onCreateTask} />);

    await user.type(
      screen.getByRole("textbox", {
        name: "Title",
      }),
      "Build frontend tests"
    );

    await user.type(
      screen.getByRole("textbox", {
        name: "Description",
      }),
      "Test the task creation form"
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

    await user.click(
      screen.getByRole("button", {
        name: "Create task",
      })
    );

    expect(onCreateTask).toHaveBeenCalledTimes(1);

    expect(onCreateTask).toHaveBeenCalledWith({
      title: "Build frontend tests",
      description: "Test the task creation form",
      priority: "high",
      category: "bug",
      status: "todo",
    });
  });

  it("clears the form after successful submission", async () => {
    const user = userEvent.setup();
    const onCreateTask = vi.fn().mockResolvedValue({});

    render(<CreateTaskForm onCreateTask={onCreateTask} />);

    const titleInput = screen.getByRole("textbox", {
      name: "Title",
    });

    const descriptionInput = screen.getByRole("textbox", {
      name: "Description",
    });

    await user.type(titleInput, "Temporary task");
    await user.type(descriptionInput, "Temporary description");

    await user.click(
      screen.getByRole("button", {
        name: "Create task",
      })
    );

    expect(titleInput).toHaveValue("");
    expect(descriptionInput).toHaveValue("");

    expect(
      screen.getByRole("combobox", {
        name: "Priority",
      })
    ).toHaveValue("medium");

    expect(
      screen.getByRole("combobox", {
        name: "Category",
      })
    ).toHaveValue("feature");
  });

  it("shows an error when task creation fails", async () => {
    const user = userEvent.setup();

    const onCreateTask = vi
      .fn()
      .mockRejectedValue(new Error("Server connection is unavailable"));

    render(<CreateTaskForm onCreateTask={onCreateTask} />);

    await user.type(
      screen.getByRole("textbox", {
        name: "Title",
      }),
      "Failed task"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Create task",
      })
    );

    expect(
      await screen.findByText("Server connection is unavailable")
    ).toBeInTheDocument();
  });
});