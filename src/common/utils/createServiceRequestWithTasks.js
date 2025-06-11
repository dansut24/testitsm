// utils/createServiceRequestWithTasks.js

import { v4 as uuidv4 } from "uuid";
import { generateTasksForRequest } from "./assignTasks";

export const createServiceRequestWithTasks = (formData) => {
  const requestId = uuidv4();

  const newRequest = {
    id: requestId,
    title: formData.title,
    description: formData.description,
    category: formData.category,
    status: "Open",
    created: new Date().toISOString(),
  };

  const associatedTasks = generateTasksForRequest(formData.category).map((task) => ({
    ...task,
    requestId,
  }));

  return {
    request: newRequest,
    tasks: associatedTasks,
  };
};
