import { expect, test } from "@playwright/test";

const API_URL = "http://localhost:5000/api";
const TITLE_PREFIX = "Analytics Playwright Task";

async function deleteTestTasks(request) {
  const response = await request.get(`${API_URL}/tasks`);

  if (!response.ok()) {
    return;
  }

  const data = await response.json();

  const testTasks = data.tasks.filter((task) =>
    task.title.startsWith(TITLE_PREFIX)
  );

  for (const task of testTasks) {
    await request.delete(`${API_URL}/tasks/${task.id}`);
  }
}

function parseChartLabel(label) {
  const match = label.match(
    /Task progress: (\d+) todo, (\d+) in progress, and (\d+) completed/i
  );

  if (!match) {
    throw new Error(`Unexpected chart label: ${label}`);
  }

  return {
    todo: Number(match[1]),
    inProgress: Number(match[2]),
    done: Number(match[3]),
  };
}

async function getChartStats(page) {
  const chart = page.locator(".progress-chart__container");

  await expect(chart).toBeVisible();

  const label = await chart.getAttribute("aria-label");

  if (!label) {
    throw new Error("Task progress chart has no aria-label");
  }

  return parseChartLabel(label);
}

async function dragTaskToColumn(
  page,
  dragHandle,
  destinationColumn
) {
  const handleBox = await dragHandle.boundingBox();
  const destinationBox = await destinationColumn.boundingBox();

  if (!handleBox || !destinationBox) {
    throw new Error(
      "Could not calculate drag-and-drop positions"
    );
  }

  const startX = handleBox.x + handleBox.width / 2;
  const startY = handleBox.y + handleBox.height / 2;

  const destinationX =
    destinationBox.x + destinationBox.width / 2;

  const destinationY =
    destinationBox.y + destinationBox.height / 3;

  await page.mouse.move(startX, startY);
  await page.mouse.down();

  await page.mouse.move(destinationX, destinationY, {
    steps: 25,
  });

  await page.waitForTimeout(500);
  await page.mouse.up();
}

test.describe("TaskForge analytics", () => {
  test.beforeEach(async ({ request }) => {
    await deleteTestTasks(request);
  });

  test.afterEach(async ({ request }) => {
    await deleteTestTasks(request);
  });

  test("updates the progress graph after creating and moving a task", async ({
    page,
  }) => {
    test.setTimeout(120_000);

    const taskTitle = `${TITLE_PREFIX} ${Date.now()}`;

    await page.goto("/");

    await expect(
      page.getByText("Live workspace")
    ).toBeVisible();

    const initialStats = await getChartStats(page);

    // Create task
    const createPanel = page.locator(".create-panel");

    await createPanel
      .getByRole("textbox", {
        name: "Title",
      })
      .fill(taskTitle);

    await createPanel
      .getByRole("button", {
        name: "Create task",
      })
      .click();

    const todoColumn = page.getByTestId("column-todo");

    // First wait until the Socket.IO update adds the task.
    await expect(
      todoColumn.getByText(taskTitle, {
        exact: true,
      })
    ).toBeVisible({
      timeout: 30_000,
    });

    // Then verify the chart received the updated statistics.
    await expect
      .poll(
        async () => {
          const stats = await getChartStats(page);
          return stats.todo;
        },
        {
          timeout: 30_000,
          intervals: [500, 1000, 2000],
        }
      )
      .toBe(initialStats.todo + 1);

    const statsAfterCreation = await getChartStats(page);

    expect(statsAfterCreation.done).toBe(initialStats.done);

    // Move task to Done
    const taskCard = todoColumn
      .locator("article.task-card")
      .filter({
        hasText: taskTitle,
      });

    const dragHandle = taskCard.getByRole("button", {
      name: `Drag ${taskTitle}`,
    });

    const doneColumn = page.getByTestId("column-done");

    await dragTaskToColumn(
      page,
      dragHandle,
      doneColumn
    );

    await expect(
      doneColumn.getByText(taskTitle, {
        exact: true,
      })
    ).toBeVisible({
      timeout: 30_000,
    });

    await expect
      .poll(
        async () => {
          const stats = await getChartStats(page);

          return {
            todo: stats.todo,
            done: stats.done,
          };
        },
        {
          timeout: 30_000,
          intervals: [500, 1000, 2000],
        }
      )
      .toEqual({
        todo: initialStats.todo,
        done: initialStats.done + 1,
      });
  });
});