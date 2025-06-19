export function formatTimeAgo(date: Date) {
  const parsedDate = date instanceof Date ? date : new Date(date);
  const seconds = Math.floor(
    (new Date().getTime() - parsedDate.getTime()) / 1000,
  );
  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)} yrs ago`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)} months ago`;
  interval = seconds / 604800;
  if (interval > 1) return `${Math.floor(interval)} weeks ago`;
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)} days ago`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)} hrs ago`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)} mins ago`;
  return "Just now";
}
