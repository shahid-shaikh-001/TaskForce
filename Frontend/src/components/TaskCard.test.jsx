import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskCard from "./TaskCard";

vi.mock("./AttachmentUploader", () => ({
  default: () => <div data-testid="attachment-uploader" />,
}));

const task = {
  id: "task-1",
  title: "Build TaskForge",
  description: "Complete the task management platform",
  status: "todo",
  priority: "high",
  category: "feature",
  attachments: [],
};

function renderTaskCard(overrides = {}) {
  const props = {
    task,
    onUpdateTask: vi.fn().mockResolvedValue({}),
    onDeleteTask: vi.fn().mockResolvedValue({}),
    ...overrides,
  };

  render(<TaskCard {...props} />);

  return props;
}

describe("TaskCard", () => {
  it("renders task information", () => {
    renderTaskCard();

    expect(screen.getByText("Build TaskForge")).toBeInTheDocument();

    expect(
      screen.getByText("Complete the task management platform")
    ).toBeInTheDocument();

    expect(screen.getByText("Feature")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();

    expect(
      screen.getByTestId("attachment-uploader")
    ).toBeInTheDocument();
  });

  it("opens and cancels edit mode", async () => {
    const user = userEvent.setup();

    renderTaskCard();

    await user.click(
      screen.getByRole("button", {
        name: "Edit",
      })
    );

    expect(
      screen.getByRole("textbox", {
        name: "Title",
      })
    ).toHaveValue("Build TaskForge");

    await user.click(
      screen.getByRole("button", {
        name: "Cancel",
      })
    );

    expect(
      screen.queryByRole("button", {
        name: "Save changes",
      })
    ).not.toBeInTheDocument();
  });

  it("updates task information", async () => {
    const user = userEvent.setup();
    const props = renderTaskCard();

    await user.click(
      screen.getByRole("button", {
        name: "Edit",
      })
    );

    const titleInput = screen.getByRole("textbox", {
      name: "Title",
    });

    await user.clear(titleInput);
    await user.type(titleInput, "Updated TaskForge");

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: "Priority",
      }),
      "medium"
    );

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: "Category",
      }),
      "bug"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Save changes",
      })
    );

    expect(props.onUpdateTask).toHaveBeenCalledWith("task-1", {
      title: "Updated TaskForge",
      description: "Complete the task management platform",
      priority: "medium",
      category: "bug",
    });
  });

  it("deletes the task", async () => {
    const user = userEvent.setup();
    const props = renderTaskCard();

    await user.click(
      screen.getByRole("button", {
        name: "Delete",
      })
    );

    expect(props.onDeleteTask).toHaveBeenCalledWith("task-1");
  });
});