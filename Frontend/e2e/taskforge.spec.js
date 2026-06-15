import { expect, test } from "@playwright/test";

const API_URL = "http://localhost:5000/api";
const TITLE_PREFIX = "Playwright Task";

async function deleteTestTasks(request, titlePrefix) {
  const response = await request.get(`${API_URL}/tasks`);

  if (!response.ok()) {
    return;
  }

  const data = await response.json();

  const matchingTasks = data.tasks.filter((task) =>
    task.title.startsWith(titlePrefix)
  );

  for (const task of matchingTasks) {
    await request.delete(`${API_URL}/tasks/${task.id}`);
  }
}

async function dragTaskToColumn(page, dragHandle, destinationColumn) {
  const handleBox = await dragHandle.boundingBox();
  const destinationBox = await destinationColumn.boundingBox();

  if (!handleBox || !destinationBox) {
    throw new Error("Could not calculate drag-and-drop positions");
  }

  const startX = handleBox.x + handleBox.width / 2;
  const startY = handleBox.y + handleBox.height / 2;

  const destinationX =
    destinationBox.x + destinationBox.width / 2;

  const destinationY =
    destinationBox.y + destinationBox.height / 3;

  await page.mouse.move(startX, startY);
  await page.mouse.down();

  await page.mouse.move(
    startX + (destinationX - startX) / 2,
    startY + (destinationY - startY) / 2,
    {
      steps: 10,
    }
  );

  await page.mouse.move(destinationX, destinationY, {
    steps: 15,
  });

  await page.waitForTimeout(300);
  await page.mouse.up();
}

test.describe("TaskForge", () => {
  test.beforeEach(async ({ request }) => {
    await deleteTestTasks(request, TITLE_PREFIX);
  });

  test.afterEach(async ({ request }) => {
    await deleteTestTasks(request, TITLE_PREFIX);
  });

  test("loads the application and connects to the workspace", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: "TaskForge",
        level: 1,
      })
    ).toBeVisible();

    await expect(
      page.getByText("Live workspace")
    ).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "Task board",
      })
    ).toBeVisible();

    await expect(
      page.getByTestId("column-todo")
    ).toBeVisible();

    await expect(
      page.getByTestId("column-in-progress")
    ).toBeVisible();

    await expect(
      page.getByTestId("column-done")
    ).toBeVisible();

    await expect(
      page.getByRole("img", {
        name: /Task progress:/i,
      })
    ).toBeVisible();
  });

  test("creates, edits, moves, and deletes a task", async ({
    page,
  }) => {
    test.setTimeout(90_000);

    const originalTitle = `${TITLE_PREFIX} ${Date.now()}`;
    const updatedTitle = `${originalTitle} Updated`;

    await page.goto("/");

    await expect(
      page.getByText("Live workspace")
    ).toBeVisible();

    // Create task
    const createPanel = page.locator(".create-panel");

    await createPanel
      .getByRole("textbox", {
        name: "Title",
      })
      .fill(originalTitle);

    await createPanel
      .getByRole("textbox", {
        name: "Description",
      })
      .fill("Created by Playwright");

    await createPanel
      .getByRole("combobox", {
        name: "Priority",
      })
      .selectOption("high");

    await createPanel
      .getByRole("combobox", {
        name: "Category",
      })
      .selectOption("feature");

    await createPanel
      .getByRole("button", {
        name: "Create task",
      })
      .click();

    const todoColumn = page.getByTestId("column-todo");

    await expect(
      todoColumn.getByText(originalTitle, {
        exact: true,
      })
    ).toBeVisible();

    // Edit task
    const originalCard = page
      .locator("article.task-card")
      .filter({
        hasText: originalTitle,
      });

    await originalCard
      .getByRole("button", {
        name: "Edit",
      })
      .click();

    const editingCard = page.locator(
      "article.task-card--editing"
    );

    await expect(editingCard).toBeVisible();

    await editingCard
      .getByRole("textbox", {
        name: "Title",
      })
      .fill(updatedTitle);

    await editingCard
      .getByRole("textbox", {
        name: "Description",
      })
      .fill("Updated by Playwright");

    await editingCard
      .getByRole("combobox", {
        name: "Priority",
      })
      .selectOption("medium");

    await editingCard
      .getByRole("combobox", {
        name: "Category",
      })
      .selectOption("bug");

    await editingCard
      .getByRole("button", {
        name: "Save changes",
      })
      .click();

    await expect(
      todoColumn.getByText(updatedTitle, {
        exact: true,
      })
    ).toBeVisible();

    await expect(
      todoColumn.getByText("Updated by Playwright", {
        exact: true,
      })
    ).toBeVisible();

    // Move task to Done using dnd-kit
    const updatedCard = page
      .locator("article.task-card")
      .filter({
        hasText: updatedTitle,
      });

    const dragHandle = updatedCard.getByRole("button", {
      name: `Drag ${updatedTitle}`,
    });

    const doneColumn = page.getByTestId("column-done");

    await dragTaskToColumn(
      page,
      dragHandle,
      doneColumn
    );

    await expect(
      doneColumn.getByText(updatedTitle, {
        exact: true,
      })
    ).toBeVisible();

    // Confirm status persists after refresh
    await page.reload();

    await expect(
      page.getByText("Live workspace")
    ).toBeVisible();

    const reloadedDoneColumn =
      page.getByTestId("column-done");

    await expect(
      reloadedDoneColumn.getByText(updatedTitle, {
        exact: true,
      })
    ).toBeVisible();

    // Delete task
    const movedCard = reloadedDoneColumn
      .locator("article.task-card")
      .filter({
        hasText: updatedTitle,
      });

    await movedCard
      .getByRole("button", {
        name: "Delete",
      })
      .click();

    await expect(
      page.getByText(updatedTitle, {
        exact: true,
      })
    ).not.toBeVisible();
  });
});