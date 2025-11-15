// Utility to format a date string or Date into a date-only string (dd/mm/yyyy)
export function formatDateOnly(value) {
  if (!value) return "";

  // If it's already a Date, use it. Otherwise try to parse.
  let d;
  if (value instanceof Date) {
    d = value;
  } else if (typeof value === "string") {
    // If it's an ISO string with time, take the date part first (safe)
    // e.g. "2025-08-12T07:34:56.000Z" -> "2025-08-12"
    const dateOnly = value.split("T")[0];
    d = new Date(dateOnly);
  } else {
    // Fallback: try constructing a Date
    d = new Date(value);
  }

  if (isNaN(d.getTime())) return "";

  // Format as dd/mm/yyyy (Vietnamese common format)
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default formatDateOnly;
