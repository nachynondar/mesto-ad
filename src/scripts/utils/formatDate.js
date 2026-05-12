export const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
