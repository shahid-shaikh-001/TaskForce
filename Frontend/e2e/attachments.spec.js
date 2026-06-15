import { expect, test } from "@playwright/test";

const API_URL = "http://localhost:5000/api";
const TITLE_PREFIX = "Attachment Playwright Task";

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

async function createTask(page, title) {
  const createPanel = page.locator(".create-panel");

  await createPanel
    .getByRole("textbox", {
      name: "Title",
    })
    .fill(title);

  await createPanel
    .getByRole("button", {
      name: "Create task",
    })
    .click();

  const taskCard = page
    .locator("article.task-card")
    .filter({
      hasText: title,
    });

  await expect(taskCard).toBeVisible();

  return taskCard;
}

test.describe("TaskForge attachments", () => {
  test.beforeEach(async ({ request }) => {
    await deleteTestTasks(request);
  });

  test.afterEach(async ({ request }) => {
    await deleteTestTasks(request);
  });

  test("uploads an image and displays its preview", async ({
    page,
  }) => {
    test.setTimeout(90_000);

    const title = `${TITLE_PREFIX} ${Date.now()}`;

    await page.goto("/");

    await expect(
      page.getByText("Live workspace")
    ).toBeVisible();

    const taskCard = await createTask(page, title);

    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl7WQAAAABJRU5ErkJggg==",
      "base64"
    );

    await taskCard
      .locator(".attachment-uploader__input")
      .setInputFiles({
        name: "playwright-image.png",
        mimeType: "image/png",
        buffer: pngBuffer,
      });

    const updatedCard = page
      .locator("article.task-card")
      .filter({
        hasText: title,
      });

    await expect(
      updatedCard.getByText("playwright-image.png", {
        exact: true,
      })
    ).toBeVisible({
      timeout: 30_000,
    });

    await expect(
      updatedCard.getByRole("img", {
        name: "playwright-image.png",
      })
    ).toBeVisible();
  });

  test("rejects an unsupported attachment type", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const title = `${TITLE_PREFIX} Invalid ${Date.now()}`;

    await page.goto("/");

    await expect(
      page.getByText("Live workspace")
    ).toBeVisible();

    const taskCard = await createTask(page, title);

    await taskCard
      .locator(".attachment-uploader__input")
      .setInputFiles({
        name: "malicious-file.exe",
        mimeType: "application/x-msdownload",
        buffer: Buffer.from("invalid executable content"),
      });

    await expect(
      taskCard.locator(".attachment-uploader__error")
    ).toContainText(
      /Only images, PDFs, TXT, DOC, and DOCX files are allowed/i
    );
  });
});