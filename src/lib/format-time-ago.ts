export function formatTimeAgo(date: Date) {
  const parsedDate = date instanceof Date ? date : new Date(date);
  const seconds = Math.floor(
    (new Date().getTime() - parsedDate.getTime()) / 1000,
  );
  let interval = seconds / 31536000;
  if (interval > 1)
    return `${Math.floor(interval)} yr${interval === 1 ? "" : "s"} ago`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)} months ago`;
  interval = seconds / 604800;
  if (interval > 1)
    return `${Math.floor(interval)} week${Math.floor(interval) === 1 ? "" : "s"} ago`;
  interval = seconds / 86400;
  if (interval > 1)
    return `${Math.floor(interval)} day${Math.floor(interval) === 1 ? "" : "s"} ago`;
  interval = seconds / 3600;
  if (interval > 1)
    return `${Math.floor(interval)} hr${Math.floor(interval) === 1 ? "" : "s"} ago`;
  interval = seconds / 60;
  if (interval > 1)
    return `${Math.floor(interval)} min${Math.floor(interval) === 1 ? "" : "s"} ago`;
  return "Just now";
}
