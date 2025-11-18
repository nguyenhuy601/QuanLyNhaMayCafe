// Utility to format a date string or Date into a date-only string (dd/mm/yyyy)
export function formatDate(value) {
  if (!value) return "";

  let d;
  if (value instanceof Date) {
    d = value;
  } else if (typeof value === "string") {
    // Extract date part from ISO string (e.g., "2025-11-15" from "2025-11-15T10:26:33.146Z")
    const dateOnly = value.split("T")[0]; // "2025-11-15"
    
    // Parse as local date to avoid timezone issues
    const [year, month, day] = dateOnly.split("-");
    d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } else {
    d = new Date(value);
  }

  if (isNaN(d.getTime())) return "";

  // Format as dd/mm/yyyy (Vietnamese common format)
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default formatDate;
