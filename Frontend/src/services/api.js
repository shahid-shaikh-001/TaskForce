const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(
      data?.message || `${fallbackMessage} (${response.status})`
    );
  }

  return data;
}

export async function fetchTasks() {
  const response = await fetch(`${API_BASE_URL}/tasks`);

  const data = await parseResponse(
    response,
    "Failed to fetch tasks"
  );

  return data.tasks;
}

export async function fetchStats() {
  const response = await fetch(`${API_BASE_URL}/stats`);

  const data = await parseResponse(
    response,
    "Failed to fetch statistics"
  );

  return data.stats;
}

export async function createTask(taskData) {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  const data = await parseResponse(
    response,
    "Failed to create task"
  );

  return data.task;
}

export async function uploadTaskAttachment(taskId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/tasks/${taskId}/attachments`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await parseResponse(
    response,
    "Failed to upload attachment"
  );

  return data.task;
}