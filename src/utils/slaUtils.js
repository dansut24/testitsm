// utils/slaUtils.js

export const getSlaDueDate = (createdAt, priority) => {
  const start = new Date(createdAt);
  let hoursToAdd = 0;

  switch (priority?.toLowerCase()) {
    case "high":
      hoursToAdd = 4;
      break;
    case "medium":
      hoursToAdd = 8;
      break;
    case "low":
      hoursToAdd = 24;
      break;
    default:
      hoursToAdd = 12;
  }

  return new Date(start.getTime() + hoursToAdd * 60 * 60 * 1000);
};

export const isSlaBreached = (dueDate) => {
  return new Date() > new Date(dueDate);
};
