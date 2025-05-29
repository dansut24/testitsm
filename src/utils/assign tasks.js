// src/utils/assignTasks.js
import { workflows } from "../data/workflowTemplates";

/**
 * Generates task list for a new service request
 * @param {string} requestType - e.g. "Software Installation"
 * @param {object} metadata - optionally includes who raised it, timestamps, etc.
 */
export function generateTasksForRequest(requestType, metadata = {}) {
  const template = workflows[requestType];
  if (!template) return [];

  return template.tasks.map((task, index) => ({
    ...task,
    id: `${requestType.replace(/\s/g, "_")}_task_${index + 1}`,
    status: "Pending",
    assignedTo: task.assignedTo || "Unassigned",
    createdAt: new Date().toISOString(),
    ...metadata,
  }));
}
