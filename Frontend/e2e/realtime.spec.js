import { expect, test } from "@playwright/test";

const API_URL = "http://localhost:5000/api";
const TITLE_PREFIX = "Realtime Playwright Task";

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

test.describe("TaskForge real-time synchronization", () => {
  test.beforeEach(async ({ request }) => {
    await deleteTestTasks(request);
  });

  test.afterEach(async ({ request }) => {
    await deleteTestTasks(request);
  });

  test("synchronizes task creation between two browser sessions", async ({
    browser,
  }) => {
    test.setTimeout(90_000);

    const firstContext = await browser.newContext();
    const secondContext = await browser.newContext();

    const firstPage = await firstContext.newPage();
    const secondPage = await secondContext.newPage();

    try {
      await Promise.all([
        firstPage.goto("/"),
        secondPage.goto("/"),
      ]);

      await expect(
        firstPage.getByText("Live workspace")
      ).toBeVisible();

      await expect(
        secondPage.getByText("Live workspace")
      ).toBeVisible();

      const taskTitle = `${TITLE_PREFIX} ${Date.now()}`;

      const createPanel = firstPage.locator(".create-panel");

      await createPanel
        .getByRole("textbox", {
          name: "Title",
        })
        .fill(taskTitle);

      await createPanel
        .getByRole("textbox", {
          name: "Description",
        })
        .fill("Created from the first browser");

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

      await expect(
        firstPage
          .getByTestId("column-todo")
          .getByText(taskTitle, {
            exact: true,
          })
      ).toBeVisible();

      await expect(
        secondPage
          .getByTestId("column-todo")
          .getByText(taskTitle, {
            exact: true,
          })
      ).toBeVisible();
    } finally {
      await firstContext.close();
      await secondContext.close();
    }
  });

  test("synchronizes task deletion between two browser sessions", async ({
    browser,
  }) => {
    test.setTimeout(90_000);

    const firstContext = await browser.newContext();
    const secondContext = await browser.newContext();

    const firstPage = await firstContext.newPage();
    const secondPage = await secondContext.newPage();

    try {
      await Promise.all([
        firstPage.goto("/"),
        secondPage.goto("/"),
      ]);

      await expect(
        firstPage.getByText("Live workspace")
      ).toBeVisible();

      await expect(
        secondPage.getByText("Live workspace")
      ).toBeVisible();

      const taskTitle = `${TITLE_PREFIX} ${Date.now()}`;

      const createPanel = firstPage.locator(".create-panel");

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

      await expect(
        secondPage.getByText(taskTitle, {
          exact: true,
        })
      ).toBeVisible();

      const firstPageCard = firstPage
        .locator("article.task-card")
        .filter({
          hasText: taskTitle,
        });

      await firstPageCard
        .getByRole("button", {
          name: "Delete",
        })
        .click();

      await expect(
        firstPage.getByText(taskTitle, {
          exact: true,
        })
      ).not.toBeVisible();

      await expect(
        secondPage.getByText(taskTitle, {
          exact: true,
        })
      ).not.toBeVisible();
    } finally {
      await firstContext.close();
      await secondContext.close();
    }
  });
});